import React, { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Trash2, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';

const NotificationModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'info', targetRole: 'all' });
  const [saving, setSaving] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;
    try {
      setSaving(true);
      await axiosClient.post('/notifications', formData);
      setFormData({ title: '', message: '', type: 'info', targetRole: 'all' });
      setShowAddForm(false);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="College Announcements & Alerts">
      <div className="space-y-4">
        {user?.role === 'teacher' && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? 'Cancel' : 'New Announcement'}
            </button>
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleCreate} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Schedule Change or Attendance Warning"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
              <textarea
                required
                rows={2}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Details of the announcement..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Audience</label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                >
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              {saving ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-center py-6 text-xs text-slate-400">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No active announcements.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item._id} className="p-3.5 bg-white border border-slate-100 rounded-xl flex items-start gap-3">
                {getTypeIcon(item.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.message}</p>
                </div>
                {user?.role === 'teacher' && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotificationModal;
