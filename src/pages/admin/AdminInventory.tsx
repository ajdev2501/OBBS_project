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