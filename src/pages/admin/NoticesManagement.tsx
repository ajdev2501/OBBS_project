import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getActiveNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice 
} from '../../lib/api/notices';
import type { Notice, NoticePriority, NoticeCategory } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { Toast } from '../../components/ui/Toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MegaphoneIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface NoticeFormData {
  title: string;
  message: string;
  city: string;
  blood_group: string;
  active: boolean;
  priority: NoticePriority;
  category: NoticeCategory;
}

// Base data arrays
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune'];

// Priority and category definitions
const priorities = [
  { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-100' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600 bg-blue-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-100' }
];

const categories = [
  { value: 'general', label: 'General', icon: InformationCircleIcon },
  { value: 'urgent', label: 'Urgent Request', icon: ExclamationTriangleIcon },
  { value: 'donation_drive', label: 'Donation Drive', icon: MegaphoneIcon },
  { value: 'maintenance', label: 'Maintenance', icon: CheckCircleIcon },
  { value: 'emergency', label: 'Emergency', icon: ExclamationTriangleIcon }
];

// Filter options (with 'all' option)
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  ...priorities.map(p => ({ value: p.value, label: p.label }))
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  ...categories.map(c => ({ value: c.value, label: c.label }))
];

const cityOptions = [
  { value: 'all', label: 'All Cities' },
  ...cities.map(city => ({ value: city, label: city }))
];

const bloodGroupOptions = [
  { value: 'all', label: 'All Blood Groups' },
  ...bloodGroups.map(group => ({ value: group, label: group }))
];

// Form-specific options (without 'all' option)
const formPriorityOptions = priorities.map(p => ({ value: p.value, label: p.label }));
const formCategoryOptions = categories.map(c => ({ value: c.value, label: c.label }));
const formCityOptions = [
  { value: '', label: 'All Cities' },
  ...cities.map(city => ({ value: city, label: city }))
];
const formBloodGroupOptions = [
  { value: '', label: 'All Blood Groups' },
  ...bloodGroups.map(group => ({ value: group, label: group }))
];

/**
 * NoticesManagement - Comprehensive notice management system for administrators
 * 
 * Features:
 * - Create, edit, delete notices
 * - Real-time search and filtering
 * - Priority and category management
 * - Targeted notices by city/blood group
 * - Bulk operations
 * - Analytics and engagement tracking
 */
export function NoticesManagement() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('all');
  
  // Bulk operations
  const [selectedNotices, setSelectedNotices] = useState<string[]>([]);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    message: '',
    city: '',
    blood_group: '',
    active: true,
    priority: 'medium',
    category: 'general'
  });

  // Load notices
  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveNotices();
      setNotices(data);
    } catch (err) {
      setError('Failed to load notices');
      console.error('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter notices based on search and filters
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && notice.active) ||
                         (filterActive === 'inactive' && !notice.active);
    
    const matchesPriority = filterPriority === 'all' || notice.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || notice.category === filterCategory;
    const matchesCity = filterCity === 'all' || notice.city === filterCity || !notice.city;
    const matchesBloodGroup = filterBloodGroup === 'all' || notice.blood_group === filterBloodGroup || !notice.blood_group;
    
    return matchesSearch && matchesActive && matchesPriority && matchesCategory && matchesCity && matchesBloodGroup;
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      city: '',
      blood_group: '',
      active: true,
      priority: 'medium',
      category: 'general'
    });
  };

  const handleCreateNotice = () => {
    resetForm();
    setEditingNotice(null);
    setModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setFormData({
      title: notice.title,
      message: notice.message,
      city: notice.city || '',
      blood_group: notice.blood_group || '',
      active: notice.active,
      priority: notice.priority || 'medium',
      category: notice.category || 'general'
    });
    setEditingNotice(notice);
    setModalOpen(true);
  };

  const handleDeleteClick = (notice: Notice) => {
    setNoticeToDelete(notice);
    setDeleteConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      
      if (editingNotice) {
        await updateNotice(editingNotice.id, {
          ...formData,
          city: formData.city || null,
          blood_group: formData.blood_group || null
        });
        showToast('Notice updated successfully!', 'success');
      } else {
        await createNotice({
          ...formData,
          city: formData.city || null,
          blood_group: formData.blood_group || null,
          created_by: user.id
        });
        showToast('Notice created successfully!', 'success');
      }
      
      setModalOpen(false);
      resetForm();
      await loadNotices();
    } catch (err) {
      console.error('Error saving notice:', err);
      showToast(editingNotice ? 'Failed to update notice' : 'Failed to create notice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!noticeToDelete) return;

    try {
      setSubmitting(true);
      await deleteNotice(noticeToDelete.id);
      showToast('Notice deleted successfully!', 'success');
      setDeleteConfirmOpen(false);
      setNoticeToDelete(null);
      await loadNotices();
    } catch (err) {
      console.error('Error deleting notice:', err);
      showToast('Failed to delete notice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (notice: Notice) => {
    try {
      await updateNotice(notice.id, { active: !notice.active });
      showToast(`Notice ${notice.active ? 'deactivated' : 'activated'} successfully!`, 'success');
      await loadNotices();
    } catch (err) {
      console.error('Error toggling notice status:', err);
      showToast('Failed to update notice status', 'error');
    }
  };

  const handleBulkToggleActive = async (active: boolean) => {
    if (selectedNotices.length === 0) return;

    try {
      setBulkOperationLoading(true);
      await Promise.all(
        selectedNotices.map(id => 
          updateNotice(id, { active })
        )
      );
      showToast(`${selectedNotices.length} notices ${active ? 'activated' : 'deactivated'} successfully!`, 'success');
      setSelectedNotices([]);
      await loadNotices();
    } catch (err) {
      console.error('Error in bulk operation:', err);
      showToast('Failed to update notices', 'error');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotices.length === 0) return;

    try {
      setBulkOperationLoading(true);
      await Promise.all(
        selectedNotices.map(id => deleteNotice(id))
      );
      showToast(`${selectedNotices.length} notices deleted successfully!`, 'success');
      setSelectedNotices([]);
      await loadNotices();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      showToast('Failed to delete notices', 'error');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotices.length === filteredNotices.length) {
      setSelectedNotices([]);
    } else {
      setSelectedNotices(filteredNotices.map(notice => notice.id));
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'text-gray-600 bg-gray-100';
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(c => c.value === category);
    return categoryObj?.icon || InformationCircleIcon;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Notices Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Create and manage system notices and announcements
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadNotices}
                className="flex items-center space-x-2"
                disabled={loading}
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <Button
                onClick={handleCreateNotice}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create Notice</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MegaphoneIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Notices</p>
                <p className="text-2xl font-semibold text-gray-900">{notices.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notices.filter(n => n.active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Urgent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notices.filter(n => n.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notices.filter(n => {
                    const createdAt = new Date(n.created_at);
                    const now = new Date();
                    return createdAt.getMonth() === now.getMonth() && 
                           createdAt.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              options={statusOptions}
            />
            
            {/* Priority Filter */}
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={priorityOptions}
            />
            
            {/* Category Filter */}
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={categoryOptions}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City Filter */}
            <Select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              options={cityOptions}
            />
            
            {/* Blood Group Filter */}
            <Select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              options={bloodGroupOptions}
            />
          </div>
        </div>

        {/* Bulk Operations */}
        {selectedNotices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  {selectedNotices.length} notice{selectedNotices.length > 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkToggleActive(true)}
                  disabled={bulkOperationLoading}
                  className="text-green-600 hover:text-green-700"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Activate
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkToggleActive(false)}
                  disabled={bulkOperationLoading}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <EyeSlashIcon className="w-4 h-4 mr-1" />
                  Deactivate
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkOperationLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                All Notices ({filteredNotices.length})
              </h3>
              
              {filteredNotices.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-gray-600 hover:text-gray-700"
                >
                  {selectedNotices.length === filteredNotices.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorDisplay message={error} />
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-12">
              <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterActive !== 'all' || filterPriority !== 'all' ? 
                  'Try adjusting your search or filters' : 
                  'Get started by creating your first notice'}
              </p>
              {(!searchTerm && filterActive === 'all' && filterPriority === 'all') && (
                <Button onClick={handleCreateNotice}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create First Notice
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedNotices.length === filteredNotices.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotices.map((notice) => {
                    const CategoryIcon = getCategoryIcon(notice.category || 'general');
                    
                    return (
                      <tr 
                        key={notice.id}
                        className={`hover:bg-gray-50 ${selectedNotices.includes(notice.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedNotices.includes(notice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotices([...selectedNotices, notice.id]);
                              } else {
                                setSelectedNotices(selectedNotices.filter(id => id !== notice.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <CategoryIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notice.title}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {notice.message}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {notice.city && (
                              <div className="flex items-center space-x-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  📍 {notice.city}
                                </span>
                              </div>
                            )}
                            {notice.blood_group && (
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  🩸 {notice.blood_group}
                                </span>
                              </div>
                            )}
                            {!notice.city && !notice.blood_group && (
                              <span className="text-gray-500 text-xs">All users</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notice.priority || 'medium')}`}>
                            {notice.priority || 'medium'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(notice)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              notice.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {notice.active ? (
                              <>
                                <EyeIcon className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeSlashIcon className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNotice(notice)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(notice)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Notice Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetForm();
            setEditingNotice(null);
          }}
          title={editingNotice ? 'Edit Notice' : 'Create New Notice'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter notice title"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter notice message"
                required
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as NoticePriority })}
                  options={formPriorityOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NoticeCategory })}
                  options={formCategoryOptions}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target City (Optional)
                </label>
                <Select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  options={formCityOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Blood Group (Optional)
                </label>
                <Select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  options={formBloodGroupOptions}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active (visible to users)
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                  setEditingNotice(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={submitting || !formData.title.trim() || !formData.message.trim()}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    {editingNotice ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingNotice ? 'Update Notice' : 'Create Notice'
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setNoticeToDelete(null);
          }}
          title="Delete Notice"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  Are you sure you want to delete this notice? This action cannot be undone.
                </p>
                {noticeToDelete && (
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>"{noticeToDelete.title}"</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setNoticeToDelete(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Notice'
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
