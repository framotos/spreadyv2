import React, { useState, FormEvent } from 'react';
import { DatasetType, ChatInputProps } from '@/lib/types';
import ToggleButtonComponent from './ToggleButtonComponent';

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading}) => {
    const [message, setMessage] = useState('');
    const [datasetType, setDatasetType] = useState<DatasetType | null>(null);
    const [selectedYears, setSelectedYears] = useState<number[]>([2019, 2020, 2021, 2022, 2023]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (message.trim() || !isLoading) {
            onSendMessage(message, datasetType, selectedYears);
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