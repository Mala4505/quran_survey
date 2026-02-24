// interface SyncStatusProps {
//     syncState: { status: string; message?: string };
//     pendingCount: number;
//     onManualSync: () => void;
// }

// export default function SyncStatus({ syncState, pendingCount, onManualSync }: SyncStatusProps) {
//     const getStatusColor = () => {
//         switch (syncState.status) {
//             case 'syncing': return 'sync-active';
//             case 'success': return 'sync-success';
//             case 'failed': return 'sync-failed';
//             default: return 'sync-idle';
//         }
//     };

//     const getStatusText = () => {
//         switch (syncState.status) {
//             case 'syncing': return 'Syncing...';
//             case 'success': return syncState.message || 'Synced';
//             case 'failed': return 'Sync failed';
//             default: return pendingCount > 0 ? `${pendingCount} pending` : 'Up to date';
//         }
//     };

//     return (
//         <div className="sync-status-bar">
//             <div className={`sync-indicator ${getStatusColor()}`}>
//                 <span className={`sync-dot ${syncState.status === 'syncing' ? 'sync-dot-pulse' : ''}`} />
//                 <span className="sync-text">{getStatusText()}</span>
//             </div>
//             {pendingCount > 0 && (
//                 <button
//                     className="btn-sync"
//                     onClick={onManualSync}
//                     disabled={syncState.status === 'syncing'}
//                     title="Sync now"
//                 >
//                     <svg
//                         width="16"
//                         height="16"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         className={syncState.status === 'syncing' ? 'spin' : ''}
//                     >
//                         <polyline points="23,4 23,10 17,10" />
//                         <polyline points="1,20 1,14 7,14" />
//                         <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
//                     </svg>
//                 </button>
//             )}
//         </div>
//     );
// }


import React from 'react';

interface SyncStatusProps {
  syncState: { status: string; message?: string };
  pendingCount: number;
  onManualSync: () => void;
}

export default function SyncStatus({ syncState, pendingCount, onManualSync }: SyncStatusProps) {
  const getStatusColor = () => {
    switch (syncState.status) {
      case 'syncing': return 'sync-active';
      case 'success': return 'sync-success';
      case 'failed': return 'sync-failed';
      default: return 'sync-idle';
    }
  };

  const getStatusText = () => {
    switch (syncState.status) {
      case 'syncing': return 'Syncing...';
      case 'success': return syncState.message || 'Synced';
      case 'failed': return 'Sync failed';
      default: return pendingCount > 0 ? `${pendingCount} pending` : 'Up to date';
    }
  };

  return (
    <div className="sync-status-bar">
      <div className={`sync-indicator ${getStatusColor()}`}>
        <span className={`sync-dot ${syncState.status === 'syncing' ? 'sync-dot-pulse' : ''}`} />
        <span className="sync-text">{getStatusText()}</span>
      </div>

      {/* Always show sync button */}
      <button
        className="btn-sync"
        onClick={onManualSync}
        disabled={syncState.status === 'syncing'}
        title="Sync & Refresh"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={syncState.status === 'syncing' ? 'spin' : ''}
        >
          <polyline points="23,4 23,10 17,10" />
          <polyline points="1,20 1,14 7,14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
    </div>
  );
}
