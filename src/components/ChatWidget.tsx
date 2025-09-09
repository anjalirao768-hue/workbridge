"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  message_text: string;
  message_type: 'text' | 'system';
  created_at: string;
  sender?: {
    id: string;
    email: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  status: 'waiting' | 'assigned' | 'active' | 'closed';
  support_agent_id?: string;
  closed_at?: string;
  closure_note?: string;
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
    
    if (isOpen && conversation?.id && !isMinimized) {
      // Create a stable reference to the fetchMessages function
      const pollMessages = () => {
        fetchMessages(conversation.id);
      };
      
      interval = setInterval(pollMessages, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, conversation?.id, isMinimized]); // Only depend on stable values

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        console.log('User authenticated:', userData.email);
        
        // Also check if we have an existing conversation
        await checkExistingConversation();
      } else {
        console.log('User not authenticated');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentUser(null);
    }
  };

  const checkExistingConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          // Get the most recent conversation
          const mostRecent = data.data[0];
          setConversation(mostRecent);
          await fetchMessages(mostRecent.id);
        }
      }
    } catch (error) {
      console.error('Error checking existing conversations:', error);
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

      if (!response.ok) {
        if (response.status === 401) {
          alert('Please login again to start a chat');
          // Clear current user and redirect to login
          setCurrentUser(null);
          window.location.href = '/login';
          return;
        }
        
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error && errorData.error.includes('foreign key')) {
            alert('Please complete your account setup before starting a chat. Redirecting to login...');
            window.location.href = '/login';
            return;
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setConversation(data.data);
        setIsOpen(true);
        await fetchMessages(data.data.id);
      } else {
        console.error('Chat creation failed:', data.error);
        alert('Failed to start chat. Please try logging in again.');
        setCurrentUser(null);
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please ensure you are logged in properly.');
      setCurrentUser(null);
      window.location.href = '/login';
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

      if (!response.ok) {
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          setCurrentUser(null);
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Add message immediately for better UX
        setMessages(prev => [...prev, data.data]);
        
        // Update conversation status if it was waiting
        if (conversation.status === 'waiting') {
          setConversation(prev => prev ? { ...prev, status: 'active' } : prev);
        }
        
        // Fetch latest messages to ensure sync
        setTimeout(() => fetchMessages(), 500);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
      case 'waiting': return 'Waiting for Agent';
      case 'assigned': return 'Agent Assigned';
      case 'active': return 'Agent Online';
      case 'closed': return 'Chat Closed';
      default: return status;
    }
  };

  const handleChatClick = async () => {
    if (!currentUser) {
      alert('Please login to start a chat with support');
      return;
    }

    if (conversation) {
      // If we already have a conversation, just open the widget
      setIsOpen(true);
      await fetchMessages(conversation.id);
    } else {
      // If no conversation, create one
      await startChat();
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
                  const isOwn = message.sender?.id === currentUser?.id;
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
                {conversation?.status === 'closed' ? (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <span className="text-sm">This chat has been closed</span>
                      {conversation.closed_at && (
                        <span className="text-xs">
                          on {new Date(conversation.closed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {conversation.closure_note && (
                      <div className="text-xs text-gray-400 italic">
                        &quot;{conversation.closure_note}&quot;
                      </div>
                    )}
                    <Button
                      onClick={startNewChat}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6"
                    >
                      Start New Chat
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4"
                    >
                      Send
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}