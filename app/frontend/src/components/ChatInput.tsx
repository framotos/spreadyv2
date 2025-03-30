'use client';

import React, { useState, FormEvent } from 'react';
import { ChatInputProps } from '@/lib/types';

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading}) => {
    const [message, setMessage] = useState('');
    // Diese States wurden entfernt, da sie nicht mehr verwendet werden

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (message.trim() || !isLoading) {
            // Rufe onSendMessage nur mit dem message-Parameter auf
            onSendMessage(message);
            setMessage('');
        }
    };
    
    return (
        <div>
            <form onSubmit={handleSubmit} className="flex gap-1 items-center">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nachricht eingeben..."
                    className="flex-1 border px-3 py-2 rounded-d"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    className="ml-2 px-4 py-2 bg-h1-new text-white rounded-d hover:bg-h1-light"
                    disabled={!message.trim() || isLoading}
                >
                    Senden
                </button>
            </form>
        </div>
    );
};

export default ChatInput;