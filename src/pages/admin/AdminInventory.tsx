import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { InventoryTable } from '../../components/data-display/InventoryTable';
import { InventoryForm } from '../../components/forms/InventoryForm';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../lib/api/inventory';
import { useAuth } from '../../contexts/AuthContext';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useToast } from '../../components/ui/Toast';
import type { InventoryItem } from '../../types/database';

export const AdminInventory: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: inventory, refetch } = useRealTimeUpdates<InventoryItem & { created_by_profile: { full_name: string } }>('inventory');

  const handleCreateItem = async (data: any) => {
    try {
      await createInventoryItem({
        ...data,
        created_by: user!.id,
      });
      showToast('Inventory item created successfully', 'success');
      setModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating item:', error);
      showToast('Failed to create inventory item', 'error');
    }
  };

  const handleUpdateItem = async (data: any) => {
    if (!editingItem) return;
    
    try {
      await updateInventoryItem(editingItem.id, data);
      showToast('Inventory item updated successfully', 'success');
      setEditingItem(null);
      setModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating item:', error);
      showToast('Failed to update inventory item', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      await deleteInventoryItem(id);
      showToast('Inventory item deleted successfully', 'success');
      refetch();
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('Failed to delete inventory item', 'error');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-2">
              Manage blood unit inventory with FEFO allocation.
            </p>
          </div>
          <Button
            icon={PlusIcon}
            onClick={() => setModalOpen(true)}
          >
            Add Blood Unit
          </Button>
        </div>

        <InventoryTable
          items={inventory}
          onEdit={handleEdit}
          onDelete={handleDeleteItem}
          isAdmin={true}
        />

        <Modal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          title={editingItem ? 'Edit Blood Unit' : 'Add Blood Unit'}
          size="lg"
        >
          <InventoryForm
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            initialData={editingItem || undefined}
          />
        </Modal>
      </div>
    </div>
  );
};