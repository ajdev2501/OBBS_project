import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { InventoryForm } from '../../components/forms/InventoryForm';
import { InventoryTable } from '../../components/data-display/InventoryTable';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../lib/api/inventory';
import type { InventoryItem, BloodGroup } from '../../types/database';

export function AdminInventory() {
  const [inventory, setInventory] = useState<(InventoryItem & { created_by_profile: { full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  const loadInventory = useCallback(async () => {
    try {
      const data = await getInventoryItems(true);
      setInventory(data);
    } catch (error) {
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleCreateItem = async (formData: { blood_group: string; bag_id: string; volume_ml: number; storage_location: string; collected_on: string; expires_on: string }) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = {
        ...formData,
        blood_group: formData.blood_group as BloodGroup, // Type assertion since form validates the blood group
        status: 'available' as const,
        created_by: user.id
      };
      await createInventoryItem(data);
      // Reload inventory to get the proper structure with created_by_profile
      await loadInventory();
      setModalOpen(false);
      showToast('Blood unit added successfully', 'success');
    } catch (error) {
      showToast('Failed to add blood unit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (formData: { blood_group: string; bag_id: string; volume_ml: number; storage_location: string; collected_on: string; expires_on: string }) => {
    if (!editingItem) return;
    
    try {
      setLoading(true);
      const updates = {
        ...formData,
        blood_group: formData.blood_group as BloodGroup // Type assertion since form validates the blood group
      };
      await updateInventoryItem(editingItem.id, updates);
      // Reload inventory to get the updated data
      await loadInventory();
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
        items={inventory}
        loading={loading}
        onEdit={handleEditItem}
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
          loading={loading}
          initialData={editingItem || undefined}
        />
      </Modal>
    </div>
  );
}