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
    console.log(`[useRealTimeUpdates] Setting up for table: ${table}`);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`[useRealTimeUpdates] Fetching data for table: ${table}`);
        
        let query = supabase.from(table).select('*');

        // Add specific joins only for certain tables
        if (table === 'notices') {
          query = supabase.from(table).select(`
            *,
            created_by_profile:profiles!created_by(full_name)
          `);
        }
        
        if (filter) {
          query = query.eq(filter.column, filter.value);
          console.log(`[useRealTimeUpdates] Applied filter: ${filter.column} = ${filter.value}`);
        }

        const { data: initialData, error: fetchError } = await query;
        
        if (fetchError) {
          console.error(`[useRealTimeUpdates] Error fetching ${table}:`, fetchError);
          throw fetchError;
        }
        
        console.log(`[useRealTimeUpdates] Successfully fetched ${initialData?.length || 0} records from ${table}`);
        setData(initialData || []);
        setError(null);
      } catch (err) {
        console.error(`[useRealTimeUpdates] Error for ${table}:`, err);
        setError(err as Error);
        // Set empty array on error to prevent undefined issues
        setData([]);
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
          console.log(`[useRealTimeUpdates] Real-time event for ${table}:`, payload.eventType, payload);
          
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
      .subscribe((status) => {
        console.log(`[useRealTimeUpdates] Subscription status for ${table}:`, status);
      });

    return () => {
      console.log(`[useRealTimeUpdates] Cleaning up subscription for ${table}`);
      supabase.removeChannel(channel);
    };
  }, [table, JSON.stringify(filter), ...dependencies]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from(table).select('*');

      // Add specific joins only for certain tables
      if (table === 'notices') {
        query = supabase.from(table).select(`
          *,
          created_by_profile:profiles!created_by(full_name)
        `);
      }
      
      if (filter) {
        query = query.eq(filter.column, filter.value);
      }

      const { data: newData, error: fetchError } = await query;
      
      if (fetchError) {
        console.error(`Error refetching ${table}:`, fetchError);
        throw fetchError;
      }
      
      setData(newData || []);
    } catch (err) {
      console.error(`useRealTimeUpdates refetch error for ${table}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};