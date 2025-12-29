import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeSocket, getSocket, disconnectSocket } from '../../utils/socket';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (user.id) {
            const socketInstance = initializeSocket(user.id);
            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                setConnected(true);
            });

            socketInstance.on('disconnect', () => {
                setConnected(false);
            });

            return () => {
                disconnectSocket();
            };
        }
    }, []);

    const joinChat = (bookingId) => {
        if (socket) {
            socket.emit('chat:join', bookingId);
        }
    };

    const sendMessage = (bookingId, message, senderId, senderRole) => {
        if (socket) {
            socket.emit('chat:message', {
                bookingId,
                message,
                senderId,
                senderRole,
            });
        }
    };

    const markAsRead = (bookingId) => {
        if (socket) {
            socket.emit('chat:markRead', bookingId);
        }
    };

    const startTyping = (bookingId) => {
        if (socket) {
            socket.emit('chat:typing', bookingId);
        }
    };

    const stopTyping = (bookingId) => {
        if (socket) {
            socket.emit('chat:stopTyping', bookingId);
        }
    };

    const value = {
        socket,
        connected,
        unreadCount,
        setUnreadCount,
        joinChat,
        sendMessage,
        markAsRead,
        startTyping,
        stopTyping,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
