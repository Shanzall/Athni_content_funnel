import { useState } from 'react';
import { Plus, ExternalLink, Edit3, Bell, RotateCcw, X, Check } from 'lucide-react';

function Drafts() {
  const [drafts, setDrafts] = useState([
    {
      id: 1,
      title: 'Q4 Marketing Strategy Document',
      link: 'https://drive.google.com/marketing-q4',
      status: 'Pending'
    },
    {
      id: 2,
      title: 'API Documentation v2.0',
      link: 'https://drive.google.com/api-docs',
      status: 'Confirmed'
    },
    {
      id: 3,
      title: 'Product Roadmap 2025',
      link: 'https://drive.google.com/roadmap-2025',
      status: 'Rejected'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    link: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.link) {
      const newDraft = {
        id: Date.now(),
        ...formData,
        status: 'Pending'
      };
      setDrafts([...drafts, newDraft]);
      setFormData({
        title: '',
        link: ''
      });
      setShowForm(false);
      addNotification('New draft submitted successfully');
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (editingDraft && formData.title && formData.link) {
      setDrafts(drafts.map(draft => 
        draft.id === editingDraft.id 
          ? { ...draft, ...formData }
          : draft
      ));
      setEditingDraft(null);
      setEditModalOpen(false);
      setFormData({
        title: '',
        link: ''
      });
      addNotification('Draft updated successfully');
    }
  };

  const handleNotify = (draft) => {
    addNotification(`Notification sent for draft: "${draft.title}"`);
  };

  const handleResubmit = (draft) => {
    setDrafts(drafts.map(d => 
      d.id === draft.id ? { ...d, status: 'Pending' } : d
    ));
    addNotification(`Resubmitted draft: "${draft.title}"`);
  };

  const addNotification = (message) => {
    const notification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const groupByStatus = (items) => {
    return ['Pending', 'Confirmed', 'Rejected'].reduce((acc, status) => {
      acc[status] = items.filter(item => item.status === status);
      return acc;
    }, {});
  };

  return (
    <div className="relative">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div key={notification.id} className="bg-green-600 text-white p-3 rounded-lg shadow-lg flex items-center justify-between max-w-sm">
              <div className="flex items-center gap-2">
                <Check size={16} />
                <div>
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs opacity-75">{notification.timestamp}</p>
                </div>
              </div>
              <button onClick={() => dismissNotification(notification.id)} className="text-white hover:text-gray-300">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Draft Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add New Draft
        </button>
      </div>

      {/* Draft Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Submit New Draft</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Draft Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="url"
                placeholder="Link to location (e.g. Google Drive)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Submit Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    title: '',
                    link: ''
                  });
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Edit Draft</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <input
                type="text"
                placeholder="Draft Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="url"
                placeholder="Link to location (e.g. Google Drive)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingDraft(null);
                    setFormData({
                      title: '',
                      link: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drafts by Status */}
      {Object.entries(groupByStatus(drafts)).map(([status, statusDrafts]) => (
        <div key={status} className="mb-8">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              status === 'Pending' ? 'bg-yellow-500' :
              status === 'Confirmed' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            {status} ({statusDrafts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusDrafts.map(draft => (
              <div key={draft.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-white text-sm leading-5">{draft.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(draft.status)}`}>
                    {draft.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  {draft.link && (
                    <a href={draft.link} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs">
                      <ExternalLink size={12} />
                      View Document
                    </a>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleNotify(draft)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    <Bell size={12} />
                    Notify
                  </button>
                  <button 
                    onClick={() => {
                      setEditingDraft(draft);
                      setFormData({
                        title: draft.title,
                        link: draft.link
                      });
                      setEditModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                  {draft.status === 'Rejected' && (
                    <button 
                      onClick={() => handleResubmit(draft)}
                      className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                    >
                      <RotateCcw size={12} />
                      Resubmit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Drafts; 