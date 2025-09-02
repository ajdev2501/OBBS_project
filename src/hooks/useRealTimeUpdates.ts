import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useRealTimeUpdates = <T>(
  table: string,
  filter?: { column: string; value: any },
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let query = supabase.from(table).select(`
          *,
          ${table === 'inventory' ? 'created_by_profile:profiles!created_by(full_name)' : ''}
          ${table === 'notices' ? 'created_by_profile:profiles!created_by(full_name)' : ''}
        `.trim());
        
        if (filter) {
          query = query.eq(filter.column, filter.value);
        }

        const { data: initialData, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        setData(initialData || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`realtime_${table}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              (item as any).id === payload.new.id ? payload.new as T : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => (item as any).id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, JSON.stringify(filter), ...dependencies]);

  const refetch = () => {
    setLoading(true);
    setError(null);
  };

  return { data, loading, error, refetch };
};