import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { InventoryForm } from '../../components/forms/InventoryForm';
import { InventoryTable } from '../../components/data-display/InventoryTable';
import { useToast } from '../../components/ui/Toast';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../lib/api/inventory';
import type { InventoryItem } from '../../types/database';

export function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getInventoryItems(true);
      setInventory(data);
    } catch (error) {
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newItem = await createInventoryItem(data);
      setInventory(prev => [...prev, newItem]);
      setModalOpen(false);
      showToast('Blood unit added successfully', 'success');
    } catch (error) {
      showToast('Failed to add blood unit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingItem) return;
    
    try {
      setLoading(true);
      const updatedItem = await updateInventoryItem(editingItem.id, data);
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));
      setModalOpen(false);
      setEditingItem(null);
      showToast('Blood unit updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update blood unit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setInventory(prev => prev.filter(item => item.id !== id));
      showToast('Blood unit deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete blood unit', 'error');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blood Inventory Management</h1>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Blood Unit
        </Button>
      </div>

      <InventoryTable
        inventory={inventory}
        loading={loading}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Blood Unit' : 'Add Blood Unit'}
        size="lg"
      >
        <InventoryForm
          onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
          loading={loading}
          initialData={editingItem || undefined}
        />
      </Modal>
    </div>
  );
}