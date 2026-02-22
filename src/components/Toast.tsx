// import React, { useEffect } from 'react';

// interface ToastProps {
//     message: string;
//     type: 'success' | 'error' | 'info';
//     onClose: () => void;
//     duration?: number;
// }

// export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
//     useEffect(() => {
//         const timer = setTimeout(onClose, duration);
//         return () => clearTimeout(timer);
//     }, [onClose, duration]);

//     const icons: Record<string, React.ReactNode> = {
//         success: (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//                 <polyline points="22,4 12,14.01 9,11.01" />
//             </svg>
//         ),
//         error: (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="15" y1="9" x2="9" y2="15" />
//                 <line x1="9" y1="9" x2="15" y2="15" />
//             </svg>
//         ),
//         info: (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="12" y1="16" x2="12" y2="12" />
//                 <line x1="12" y1="8" x2="12.01" y2="8" />
//             </svg>
//         ),
//     };

//     return (
//         <div className={`toast toast-${type}`} role="alert">
//             <span className="toast-icon">{icons[type]}</span>
//             <span className="toast-message">{message}</span>
//             <button className="toast-close" onClick={onClose} aria-label="Close">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <line x1="18" y1="6" x2="6" y2="18" />
//                     <line x1="6" y1="6" x2="18" y2="18" />
//                 </svg>
//             </button>
//         </div>
//     );
// }


import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warning';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    // Colored glass backgrounds
    const bgColors: Record<string, string> = {
        success: 'rgba(52, 211, 153, 0.2)', // green
        warning: 'rgba(250, 204, 21, 0.2)', // yellow
        error: 'rgba(239, 68, 68, 0.2)',    // red
    };

    const textColors: Record<string, string> = {
        success: '#34d399',
        warning: '#facc15',
        error: '#ef4444',
    };

    const icons: Record<string, React.ReactNode> = {
        success: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20,6 9,17 4,12" />
            </svg>
        ),
        warning: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 9v4" />
                <circle cx="12" cy="16" r="1" />
                <path d="M10.29 3.86l-8.63 15.01a1 1 0 0 0 .86 1.5h17.16a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z" />
            </svg>
        ),
        error: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    };

    return (
        <div
            role="alert"
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                backdropFilter: 'blur(8px)',
                backgroundColor: bgColors[type],
                color: textColors[type],
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                fontWeight: 500,
                fontSize: '14px',
                maxWidth: '90vw',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                animation: 'toast-slide 0.3s ease-out',
            }}
        >
            <span style={{ display: 'flex', alignItems: 'center' }}>{icons[type]}</span>
            <span>{message}</span>
            <button
                onClick={onClose}
                aria-label="Close"
                style={{
                    marginLeft: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: textColors[type],
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <style>
                {`
                @keyframes toast-slide {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                `}
            </style>
        </div>
    );
}


// import React, { useEffect } from 'react';

// interface ToastProps {
//     message: string;
//     type: 'success' | 'error' | 'info';
//     onClose: () => void;
//     duration?: number;
// }

// export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
//     useEffect(() => {
//         const timer = setTimeout(onClose, duration);
//         return () => clearTimeout(timer);
//     }, [onClose, duration]);

//     const icons: Record<string, React.ReactNode> = {
//         success: (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//                 <polyline points="22,4 12,14.01 9,11.01" />
//             </svg>
//         ),
//         error: (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="15" y1="9" x2="9" y2="15" />
//                 <line x1="9" y1="9" x2="15" y2="15" />
//             </svg>
//         ),
//         info: (
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="12" y1="16" x2="12" y2="12" />
//                 <line x1="12" y1="8" x2="12.01" y2="8" />
//             </svg>
//         ),
//     };

//     return (
//         <div
//             className={`toast toast-${type}`}
//             role="alert"
//             style={{
//                 position: 'fixed',
//                 top: '20px',       // Show at top
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 zIndex: 9999,
//             }}
//         >
//             <span className="toast-icon">{icons[type]}</span>
//             <span className="toast-message">{message}</span>
//             <button className="toast-close" onClick={onClose} aria-label="Close">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <line x1="18" y1="6" x2="6" y2="18" />
//                     <line x1="6" y1="6" x2="18" y2="18" />
//                 </svg>
//             </button>
//         </div>
//     );
// }