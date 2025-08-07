import React, { useState, useEffect } from 'react';
import { RealTimeJournalManager } from '@/lib/journal';

interface PerformanceMonitorProps {
  journalManager: RealTimeJournalManager;
  enabled?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  journalManager, 
  enabled = false 
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const newMetrics = journalManager.getPerformanceMetrics();
      setMetrics(newMetrics);
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [journalManager, enabled]);

  // Show/hide with Ctrl+Shift+P
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  if (!enabled || !isVisible || !metrics) {
    return null;
  }

  const { fastSync, syncQueueSize, activeEdits, pendingSaves, fastSyncEnabled } = metrics;
  const isFastSyncActive = journalManager.isFastSyncActive();

  const toggleFastSync = () => {
    const newState = !fastSyncEnabled;
    console.log(`🔄 Toggling FastSync: ${fastSyncEnabled} → ${newState}`);
    journalManager.setFastSyncEnabled(newState);
    // Force metrics update
    setTimeout(() => {
      const newMetrics = journalManager.getPerformanceMetrics();
      setMetrics(newMetrics);
    }, 100);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-green-400">Performance Monitor</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="text-yellow-400 font-semibold">
            Fast Sync Status {isFastSyncActive ? '🚀' : '🐌'}
          </div>
          <button
            onClick={toggleFastSync}
            className={`px-2 py-1 text-xs rounded ${
              fastSyncEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {fastSyncEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        {fastSync ? (
          <>
            <div>Total Saves: <span className="text-green-300">{fastSync.totalSaves}</span></div>
            <div>Avg Save Time: <span className="text-green-300">{fastSync.averageSaveTime.toFixed(1)}ms</span></div>
            <div>Failed Saves: <span className={fastSync.failedSaves > 0 ? 'text-red-300' : 'text-green-300'}>{fastSync.failedSaves}</span></div>
            <div>Pending Changes: <span className="text-blue-300">{fastSync.pendingChanges}</span></div>
            <div>Last Sync: <span className="text-gray-300">
              {fastSync.lastSyncTime > 0 ? `${Math.round((Date.now() - fastSync.lastSyncTime) / 1000)}s ago` : 'Never'}
            </span></div>
          </>
        ) : (
          <div className="text-red-300">Fast Sync Disabled</div>
        )}
        
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="text-yellow-400 font-semibold">Legacy Sync</div>
          <div>Sync Queue: <span className="text-blue-300">{syncQueueSize}</span></div>
          <div>Active Edits: <span className="text-blue-300">{activeEdits}</span></div>
          <div>Pending Saves: <span className="text-blue-300">{pendingSaves}</span></div>
        </div>
      </div>
      
      <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-600">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};
