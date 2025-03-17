import React, { useState, FormEvent } from 'react';
import { ChatInputProps } from '@/lib/types';

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading}) => {
    const [message, setMessage] = useState('');
    // Diese States werden nicht mehr verwendet, kommentieren wir sie vorerst aus
    // Wir entfernen sie nicht vollständig, falls sie in Zukunft wieder benötigt werden
    // const [datasetType, setDatasetType] = useState<DatasetType | null>(null);
    // const [selectedYears, setSelectedYears] = useState<number[]>([2019, 2020, 2021, 2022, 2023]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (message.trim() || !isLoading) {
            // Da datasetType und selectedYears nicht mehr aktiv verwendet werden,
            // übergeben wir Standardwerte
            onSendMessage(message, null, [2019, 2020, 2021, 2022, 2023]);
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