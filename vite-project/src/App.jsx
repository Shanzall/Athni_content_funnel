import { useState } from 'react';
import Ideas from './components/Ideas';
import Drafts from './components/Drafts';
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('ideas');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Hire Armada Content Funnel</h1>
          <p className="text-gray-400 text-sm">All ideas and drafts are managed here</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ideas'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            🧠 Ideas
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'drafts'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            📝 Drafts
          </button>
        </div>

        {/* Content */}
        <main>
          {activeTab === 'ideas' ? <Ideas /> : <Drafts />}
        </main>
      </div>
    </div>
  );
}

export default App;
