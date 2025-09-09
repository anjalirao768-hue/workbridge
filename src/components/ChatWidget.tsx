"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  message_text: string;
  message_type: 'text' | 'system';
  created_at: string;
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  status: 'active' | 'waiting' | 'closed';
  support_agent_id?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if user is authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Poll for new messages when chat is open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen && conversation && !isMinimized) {
      interval = setInterval(() => {
        fetchMessages();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, conversation, isMinimized]); // Removed fetchMessages dependency to avoid recreating interval

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const userData = await response.json();
        // The API returns user data directly, not wrapped in a 'user' property
        setCurrentUser(userData);
        console.log('User authenticated:', userData.email);
      } else {
        console.log('User not authenticated');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentUser(null);
    }
  };

  const startChat = async () => {
    if (!currentUser) {
      alert('Please login to start a chat with support');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setConversation(data.data);
        setIsOpen(true);
        await fetchMessages(data.data.id);
      } else {
        alert('Failed to start chat: ' + data.error);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId?: string) => {
    const convId = conversationId || conversation?.id;
    if (!convId) return;

    try {
      const response = await fetch(`/api/chat/conversations/${convId}/messages`);
      if (!response.ok) {
        console.error('Failed to fetch messages:', response.status);
        return;
      }
      
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages || []);
        
        // Update conversation data if provided
        if (data.data.conversation) {
          setConversation(prev => ({
            ...prev,
            ...data.data.conversation
          }));
        }
      } else {
        console.error('Error in messages response:', data.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`/api/chat/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      if (data.success) {
        // Add message immediately for better UX
        setMessages(prev => [...prev, data.data]);
      } else {
        alert('Failed to send message: ' + data.error);
        setNewMessage(messageText); // Restore message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Network error. Please try again.');
      setNewMessage(messageText); // Restore message
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'waiting': return 'text-yellow-600';
      case 'closed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Agent Online';
      case 'waiting': return 'Waiting for Agent';
      case 'closed': return 'Chat Closed';
      default: return status;
    }
  };

  // Don't show chat widget on auth pages
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (['/login', '/signup'].includes(pathname)) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={startChat}
          disabled={loading}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          ) : (
            <span className="text-2xl">💬</span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`w-80 h-96 shadow-2xl transition-all duration-300 ${isMinimized ? 'h-14' : ''}`}>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Support Chat</CardTitle>
                {conversation && (
                  <p className={`text-sm ${getStatusColor(conversation.status)} bg-white/20 px-2 py-1 rounded-full inline-block mt-1`}>
                    {getStatusText(conversation.status)}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  {isMinimized ? '↑' : '−'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <p>👋 Welcome to WorkBridge Support</p>
                    <p className="mt-1">How can we help you today?</p>
                  </div>
                )}

                {messages.map((message) => {
                  const isOwn = message.sender.id === currentUser?.id;
                  const isSystem = message.message_type === 'system';

                  if (isSystem) {
                    return (
                      <div key={message.id} className="text-center">
                        <p className="text-xs text-gray-500 bg-gray-200 inline-block px-3 py-1 rounded-full">
                          {message.message_text}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        isOwn 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.message_text}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    disabled={conversation?.status === 'closed'}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newMessage.trim() || conversation?.status === 'closed'}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4"
                  >
                    Send
                  </Button>
                </form>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}