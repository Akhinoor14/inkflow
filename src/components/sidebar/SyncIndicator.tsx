'use client';
// src/components/sidebar/SyncIndicator.tsx

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export function SyncIndicator() {
  const syncStatus = useAppStore((s) => s.syncStatus);

  const icon = () => {
    switch (syncStatus.status) {
      case 'syncing': return <RefreshCw size={13} className="animate-spin text-blue-500" />;
      case 'synced': return <CheckCircle size={13} className="text-green-500" />;
      case 'error': return <AlertCircle size={13} className="text-red-500" />;
      case 'conflict': return <AlertCircle size={13} className="text-amber-500" />;
      default: return <Cloud size={13} className="text-gray-400" />;
    }
  };

  return (
    <button
      title={
        syncStatus.status === 'synced'
          ? `Saved ${syncStatus.lastSynced ? new Date(syncStatus.lastSynced).toLocaleTimeString() : ''}`
          : syncStatus.error ?? syncStatus.status
      }
      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {icon()}
    </button>
  );
}
