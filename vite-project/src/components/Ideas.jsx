import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Edit3, Bell, UserPlus, X, Check } from 'lucide-react';
import emailjs from '@emailjs/browser';

const IDEATORS = ['Dagim', 'Trial', 'Maya Patel', 'David Kim', 'Emma Thompson'];
const CATEGORIES = ['Product Feature', 'UI/UX', 'User Experience', 'Technical', 'Marketing'];
const CHANNELS = ['Slack', 'Email', 'Forum'];
const EXECUTORS = ['Shanzal', 'Mehretab', 'Athni', 'Anna Davis', 'Tom Wilson'];

// Map names to emails
const IDEATOR_EMAILS = {
  'Sarah Chen': 'mohitraghav350@gmail.com',
  'Alex Rodriguez': 'alex.rodriguez@email.com',
  'Maya Patel': 'maya.patel@email.com',
  'David Kim': 'david.kim@email.com',
  'Emma Thompson': 'emma.thompson@email.com',
};
const EXECUTOR_EMAILS = {
  'John Smith': 'shanzalsiddiqui2@gmail.com',
  'Lisa Wang': 'lisa.wang@email.com',
  'Athni': 'athnitesfaye@gmail.com',
  'Mehretab': 'mehretab@gmail.com',
  'Shanzal': 'shanzalsiddiqui2@gmail.com',
};

// EmailJS config (replace with your actual values)
const EMAILJS_SERVICE_ID = 'service_evmoydf';
const EMAILJS_TEMPLATE_REJECT = 'template_n0u5g98';
const EMAILJS_TEMPLATE_ASSIGN = 'template_23ru5i2';
const EMAILJS_PUBLIC_KEY = 'NKJdATGaWOlV_l_BI'; 

function Ideas() {
  const [ideas, setIdeas] = useState(() => {
    const stored = localStorage.getItem('ideas');
    if (stored) return JSON.parse(stored);
    return [
      {
        id: 1,
        title: 'AI-powered content recommendation system',
        link: 'https://notion.so/ai-content-rec',
        ideator: 'Sarah Chen',
        category: 'Product Feature',
        channel: 'Slack',
        status: 'Pending'
      },
      {
        id: 2,
        title: 'Mobile app dark mode implementation',
        link: 'https://notion.so/dark-mode',
        ideator: 'Alex Rodriguez',
        category: 'UI/UX',
        channel: 'Email',
        status: 'Confirmed',
        executor: 'John Smith'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assigningIdea, setAssigningIdea] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    ideator: '',
    category: '',
    channel: ''
  });

  const [selectedExecutor, setSelectedExecutor] = useState('');

  // Helper to send email via EmailJS
  const sendEmail = (templateId, variables) => {
    return emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      variables,
      EMAILJS_PUBLIC_KEY
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.ideator && formData.category && formData.channel) {
      const newIdea = {
        id: Date.now(),
        ...formData,
        status: 'Pending'
      };
      setIdeas([...ideas, newIdea]);
      setFormData({
        title: '',
        link: '',
        ideator: '',
        category: '',
        channel: ''
      });
      setShowForm(false);
      addNotification('New idea submitted successfully');
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (editingIdea && formData.title && formData.ideator && formData.category && formData.channel) {
      setIdeas(ideas.map(idea => 
        idea.id === editingIdea.id 
          ? { ...idea, ...formData }
          : idea
      ));
      setEditingIdea(null);
      setEditModalOpen(false);
      setFormData({
        title: '',
        link: '',
        ideator: '',
        category: '',
        channel: ''
      });
      addNotification('Idea updated successfully');
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (assigningIdea && selectedExecutor) {
      setIdeas(ideas.map(idea =>
        idea.id === assigningIdea.id
          ? { ...idea, executor: selectedExecutor, status: 'Confirmed' }
          : idea
      ));
      addNotification(`Assigned "${assigningIdea.title}" to ${selectedExecutor}`);
      // Send assignment email
      console.log('Sending assignment email to:', IDEATOR_EMAILS[assigningIdea.ideator], EXECUTOR_EMAILS[selectedExecutor]);
      sendEmail(EMAILJS_TEMPLATE_ASSIGN, {
        to_email: IDEATOR_EMAILS[assigningIdea.ideator] || 'default@email.com',
        executor_email: EXECUTOR_EMAILS[selectedExecutor] || 'default@email.com',
        idea_title: assigningIdea.title,
        ideator_name: assigningIdea.ideator,
        executor_name: selectedExecutor,
      }).then(() => {
        addNotification(`Assignment email sent to ${assigningIdea.ideator} and ${selectedExecutor}`);
      }).catch(() => {
        addNotification('Failed to send assignment email');
      });
      setAssigningIdea(null);
      setSelectedExecutor('');
    }
  };

  const handleNotify = (idea) => {
    addNotification(`Notification sent for idea: "${idea.title}" to ${idea.ideator}`);
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

  // Modified reject handler
  const handleReject = (idea) => {
    setIdeas(ideas.map(i =>
      i.id === idea.id ? { ...i, status: 'Rejected' } : i
    ));
    addNotification(`Idea "${idea.title}" was rejected.`);
    // Send rejection email
    sendEmail(EMAILJS_TEMPLATE_REJECT, {
      to_email: IDEATOR_EMAILS[idea.ideator] || 'default@email.com',
      idea_title: idea.title,
      ideator_name: idea.ideator,
    }).then(() => {
      addNotification(`Rejection email sent to ${idea.ideator}`);
    }).catch(() => {
      addNotification('Failed to send rejection email');
    });
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

      {/* Add Idea Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add New Idea
        </button>
      </div>

      {/* Idea Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Submit New Idea</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Idea Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="url"
                placeholder="Link to Notion"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <select
                value={formData.ideator}
                onChange={(e) => setFormData({ ...formData, ideator: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Ideator</option>
                {IDEATORS.map(ideator => (
                  <option key={ideator} value={ideator}>{ideator}</option>
                ))}
              </select>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Channel</option>
                {CHANNELS.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Submit Idea
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    title: '',
                    link: '',
                    ideator: '',
                    category: '',
                    channel: ''
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
            <h3 className="text-lg font-medium mb-4">Edit Idea</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <input
                type="text"
                placeholder="Idea Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="url"
                placeholder="Link to Notion"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <select
                value={formData.ideator}
                onChange={(e) => setFormData({ ...formData, ideator: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Ideator</option>
                {IDEATORS.map(ideator => (
                  <option key={ideator} value={ideator}>{ideator}</option>
                ))}
              </select>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Channel</option>
                {CHANNELS.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update Idea
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingIdea(null);
                    setFormData({
                      title: '',
                      link: '',
                      ideator: '',
                      category: '',
                      channel: ''
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

      {/* Ideas by Status */}
      {Object.entries(groupByStatus(ideas)).map(([status, statusIdeas]) => (
        <div key={status} className="mb-8">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              status === 'Pending' ? 'bg-yellow-500' :
              status === 'Confirmed' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            {status} ({statusIdeas.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusIdeas.map(idea => (
              <div key={idea.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-white text-sm leading-5">{idea.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(idea.status)}`}>
                    {idea.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>By {idea.ideator}</span>
                    <span>{idea.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>via {idea.channel}</span>
                    {idea.link && (
                      <a href={idea.link} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                        <ExternalLink size={12} />
                        Link
                      </a>
                    )}
                  </div>
                  {idea.executor && (
                    <div className="text-xs text-green-400">
                      Assigned to: {idea.executor}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleNotify(idea)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    <Bell size={12} />
                    Notify
                  </button>
                  <button 
                    onClick={() => {
                      setEditingIdea(idea);
                      setFormData({
                        title: idea.title,
                        link: idea.link || '',
                        ideator: idea.ideator,
                        category: idea.category,
                        channel: idea.channel
                      });
                      setEditModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                  <button 
                    onClick={() => setAssigningIdea(idea)}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                  >
                    <UserPlus size={12} />
                    Assign
                  </button>
                  {idea.status === 'Pending' && (
                    <button
                      onClick={() => handleReject(idea)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Assignment Modal */}
      {assigningIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Assign Executor</h3>
            <p className="text-gray-400 text-sm mb-4">
              Assign "{assigningIdea.title}" to an executor
            </p>
            <select
              value={selectedExecutor}
              onChange={(e) => setSelectedExecutor(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-4"
            >
              <option value="">Select Executor</option>
              {EXECUTORS.map(executor => (
                <option key={executor} value={executor}>{executor}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAssign}
                disabled={!selectedExecutor}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setAssigningIdea(null);
                  setSelectedExecutor('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ideas; 