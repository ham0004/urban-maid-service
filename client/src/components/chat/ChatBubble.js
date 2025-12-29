import React from 'react';

const ChatBubble = ({ message, isOwnMessage }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
            >
                <p className="text-sm break-words">{message.message}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                    <span className={`text-xs ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                    </span>
                    {isOwnMessage && (
                        <span className="text-xs text-indigo-200">
                            {message.isRead ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
