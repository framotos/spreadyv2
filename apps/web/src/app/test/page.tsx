'use client';

import React from 'react';
import { ChatMessage } from '@neurofinance/ui';
import type { Message } from '@neurofinance/ui';

export default function TestPage() {
  const userMessage: Message = {
    id: '1',
    content: 'This is a test user message',
    sender: 'user',
  };

  const assistantMessage: Message = {
    id: '2',
    content: 'This is a test assistant message with a longer text to see how it handles wrapping and padding in the component.',
    sender: 'assistant',
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ChatMessage Component Test</h1>
      
      <div className="space-y-4 max-w-2xl mx-auto">
        <ChatMessage message={userMessage} />
        <ChatMessage message={assistantMessage} />
      </div>
    </div>
  );
} 