import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useChat } from './ChatProvider';

const ChatList = () => {
    const navigate = useNavigate();
    const { connected, socket } = useChat();

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/chat/user/chats`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setChats(response.data);

                // Calculate unread count
                let count = 0;
                response.data.forEach(chat => {
                    chat.messages.forEach(msg => {
                        if (msg.senderId !== user.id && !msg.isRead) {
                            count++;
                        }
                    });
                });
                setUnreadCount(count);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching chats:', err);
                setError(err.response?.data?.message || 'Failed to load chats');
                setLoading(false);
            }
        };

        if (token) {
            fetchChats();
        } else {
            navigate('/login');
        }
    }, [token, navigate, user.id]);

    // Listen for new messages to update chat list
    useEffect(() => {
        if (socket) {
            socket.on('chat:newMessage', () => {
                // Refetch chats when new message arrives
                const fetchChats = async () => {
                    try {
                        const response = await axios.get(
                            `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/chat/user/chats`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );
                        setChats(response.data);
                    } catch (err) {
                        console.error('Error refetching chats:', err);
                    }
                };
                fetchChats();
            });

            return () => {
                socket.off('chat:newMessage');
            };
        }
    }, [socket, token]);

    const formatLastMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const getUnreadCountForChat = (chat) => {
        return chat.messages.filter(msg => msg.senderId !== user.id && !msg.isRead).length;
    };

    const getLastMessage = (chat) => {
        if (chat.messages.length === 0) return 'No messages yet';
        const lastMsg = chat.messages[chat.messages.length - 1];
        return lastMsg.message.length > 50
            ? lastMsg.message.substring(0, 50) + '...'
            : lastMsg.message;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {connected ? (
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                        Disconnected
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                            Dashboard
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <div className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
                            You have {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {chats.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No chats yet</h3>
                        <p className="text-gray-500">
                            Chats will appear here once you have confirmed bookings
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chats.map((chat) => {
                            const otherUser = user.role === 'customer' ? chat.maidId : chat.customerId;
                            const unreadForChat = getUnreadCountForChat(chat);

                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => navigate(`/chat/${chat.bookingId._id}`)}
                                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-gray-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-800">
                                                    {otherUser?.name || 'Unknown User'}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {formatLastMessageTime(chat.lastMessageAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {getLastMessage(chat)}
                                            </p>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span className="px-2 py-1 bg-gray-100 rounded">
                                                    {new Date(chat.bookingId.serviceDate).toLocaleDateString()}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 rounded">
                                                    {chat.bookingId.serviceTime}
                                                </span>
                                                <span className={`px-2 py-1 rounded ${chat.bookingId.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {chat.bookingId.status}
                                                </span>
                                            </div>
                                        </div>
                                        {unreadForChat > 0 && (
                                            <div className="ml-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                                    {unreadForChat}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
