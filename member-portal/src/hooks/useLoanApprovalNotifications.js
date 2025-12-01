// Socket.IO-based hook to receive loan-approval notifications in real-time.
// Requires `socket.io-client` in the front-end and a compatible Socket.IO server
// that emits `loanApproved` events or responds to a `subscribe` message.

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useLoanApprovalNotifications(memberNumber, onApproved) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!memberNumber) return;

    const apiBase = (process.env.REACT_APP_WS_URL || process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
    // If WS_URL isn't provided, try to derive it from API URL
    const wsBase = process.env.REACT_APP_WS_URL || (apiBase ? apiBase.replace(/^http/, 'ws') : '');

    const socket = io(wsBase, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      try {
        socket.emit('subscribe', { memberNumber });
      } catch (e) {}
    });

    socket.on('loanApproved', (payload) => {
      try {
        if (typeof onApproved === 'function') onApproved(payload);
      } catch (e) {}
    });

    // Generic message handling for servers that wrap events
    socket.on('message', (msg) => {
      try {
        if (msg && (msg.type === 'loanApproved' || msg.event === 'loanApproved')) {
          onApproved(msg.payload || msg);
        }
      } catch (e) {}
    });

    socket.on('connect_error', () => {
      // could add logging
    });

    return () => {
      try { socket.off('loanApproved'); socket.off('message'); socket.disconnect(); } catch (e) {}
      socketRef.current = null;
    };
  }, [memberNumber, onApproved]);
}
