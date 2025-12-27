import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useChat } from './ChatProvider';
import ChatBubble from './ChatBubble';

const ChatWindow = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { socket, connected, joinChat, sendMessage, markAsRead, startTyping, stopTyping } = useChat();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chatInfo, setChatInfo] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch chat history
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/chat/booking/${bookingId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setChatInfo(response.data);
                setMessages(response.data.messages || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching chat:', err);
                setError(err.response?.data?.message || 'Failed to load chat');
                setLoading(false);
            }
        };

        if (token && bookingId) {
            fetchChat();
        }
    }, [bookingId, token]);

    // Join chat room and set up socket listeners
    useEffect(() => {
        if (socket && bookingId && connected) {
            joinChat(bookingId);

            // Listen for new messages
            socket.on('chat:newMessage', (message) => {
                setMessages((prev) => [...prev, message]);
            });

            // Listen for chat history
            socket.on('chat:history', (history) => {
                setMessages(history);
            });

            // Listen for typing indicators
            socket.on('chat:userTyping', () => {
                setOtherUserTyping(true);
            });

            socket.on('chat:userStopTyping', () => {
                setOtherUserTyping(false);
            });

            // Listen for messages read
            socket.on('chat:messagesRead', () => {
                setMessages((prev) =>
                    prev.map((msg) => ({ ...msg, isRead: true }))
                );
            });

            // Listen for errors
            socket.on('error', (error) => {
                setError(error.message);
            });

            // Mark messages as read
            markAsRead(bookingId);

            return () => {
                socket.off('chat:newMessage');
                socket.off('chat:history');
                socket.off('chat:userTyping');
                socket.off('chat:userStopTyping');
                socket.off('chat:messagesRead');
                socket.off('error');
            };
        }
    }, [socket, bookingId, connected, joinChat, markAsRead]);

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            startTyping(bookingId);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            stopTyping(bookingId);
        }, 1000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        sendMessage(bookingId, newMessage, user.id, user.role);
        setNewMessage('');

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            stopTyping(bookingId);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/chat')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Chats
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← Back
                        </button>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                {user.role === 'customer'
                                    ? chatInfo?.maidId?.name || 'Maid'
                                    : chatInfo?.customerId?.name || 'Customer'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {connected ? (
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Online
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                        Offline
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <ChatBubble
                                key={index}
                                message={msg}
                                isOwnMessage={msg.senderId === user.id}
                            />
                        ))
                    )}

                    {otherUserTyping && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-200 px-4 py-2 rounded-lg">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="bg-white border-t px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={false} // Allow typing even if disconnected (for better UX)
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !connected}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
