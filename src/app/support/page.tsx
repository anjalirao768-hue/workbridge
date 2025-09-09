"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  title: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  closure_note?: string;
  resolution_time_minutes?: number;
  users?: {
    id: string;
    email: string;
    role: string;
  };
  support_agent?: {
    id: string;
    email: string;
  };
}

export default function SupportDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [closureNote, setClosureNote] = useState('');
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthAndRole();
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-refresh conversations and messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const checkAuthAndRole = async () => {
    try {
      const response = await fetch('/api/user/me');
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        
        // Check if user has support or admin role
        if (!['support', 'admin'].includes(userData.role)) {
          alert('Access denied. This page is for support agents only.');
          window.location.href = '/';
          return;
        }
        
        console.log('Support dashboard access granted for:', userData.email, 'Role:', userData.role);
      } else {
        console.log('Authentication failed, status:', response.status);
        alert('Please login to access support dashboard');
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      alert('Authentication error');
      window.location.href = '/login';
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      const data = await response.json();

      if (data.success) {
        setConversations(data.data);
      } else {
        console.error('Failed to fetch conversations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
        
        // Update the conversation in the list
        const updatedConversation = data.data.conversation;
        setSelectedConversation(updatedConversation);
        
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId ? updatedConversation : conv
          )
        );
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        // Update conversation status if needed
        fetchConversations();
      } else {
        alert('Failed to send message: ' + data.error);
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const closeConversation = async () => {
    if (!selectedConversation || isClosing) return;

    setIsClosing(true);
    
    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          closure_note: closureNote.trim() || undefined 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the conversation status locally
        setSelectedConversation(prev => prev ? {
          ...prev,
          status: 'closed',
          closed_at: data.data.closed_at,
          closure_note: data.data.closure_note
        } : prev);
        
        // Refresh conversations list
        fetchConversations();
        
        // Reset closure dialog
        setShowClosureDialog(false);
        setClosureNote('');
        
        alert('Conversation closed successfully');
      } else {
        alert('Failed to close conversation: ' + data.error);
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsClosing(false);
    }
  };

  const handleCloseButtonClick = () => {
    setShowClosureDialog(true);
  };

  const handleClosureCancel = () => {
    setShowClosureDialog(false);
    setClosureNote('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return formatTime(timestamp);
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Waiting</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800">👤 Assigned</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">🟢 Active</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">⭕ Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserRole = (role: string) => {
    switch (role) {
      case 'client': return '🏢 Client';
      case 'freelancer': return '💼 Freelancer';
      case 'admin': return '👑 Admin';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.email}
              </span>
              <Badge className="bg-purple-100 text-purple-800">
                {currentUser && getUserRole(currentUser.role)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Conversations ({conversations.length})</span>
                <Button size="sm" onClick={fetchConversations} variant="outline">
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => selectConversation(conversation)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-purple-50 border-r-2 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {conversation.users?.email || 'Unknown User'}
                          </div>
                          {getStatusBadge(conversation.status)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">
                            {conversation.users?.role ? getUserRole(conversation.users.role) : 'Unknown Role'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.updated_at)}
                          </span>
                        </div>
                        {conversation.support_agent && (
                          <div className="text-xs text-green-600 mt-1">
                            Agent: {conversation.support_agent.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Chat with {selectedConversation.users?.email || 'Unknown User'}
                      </CardTitle>
                      <p className="text-sm text-purple-100">
                        {selectedConversation.users?.role ? getUserRole(selectedConversation.users.role) : 'Unknown Role'} • {getStatusBadge(selectedConversation.status)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {selectedConversation.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleCloseButtonClick}
                          className="text-purple-600"
                        >
                          Mark as Closed
                        </Button>
                      )}
                      {selectedConversation.status === 'closed' && currentUser?.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            // TODO: Implement reopen functionality
                            alert('Reopen functionality can be implemented here');
                          }}
                          className="text-green-600"
                        >
                          Reopen Chat
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex flex-col h-[calc(100vh-360px)]">
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
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
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs font-medium ${isOwn ? 'text-purple-100' : 'text-gray-600'}`}>
                                {isOwn ? 'You' : (message.sender?.role ? getUserRole(message.sender.role) : 'User')}
                              </span>
                            </div>
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
                    {selectedConversation.status === 'closed' ? (
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                          <span className="text-sm font-medium">Chat Closed</span>
                          {selectedConversation.closed_at && (
                            <span className="text-xs">
                              on {new Date(selectedConversation.closed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {selectedConversation.closure_note && (
                          <div className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded">
                            Closure Note: "{selectedConversation.closure_note}"
                          </div>
                        )}
                        {selectedConversation.resolution_time_minutes && (
                          <div className="text-xs text-gray-400">
                            Resolution Time: {Math.round(selectedConversation.resolution_time_minutes)} minutes
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={sendMessage} className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6"
                        >
                          Send
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the left to start chatting with users</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Closure Dialog Modal */}
      {showClosureDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Close Conversation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to close this conversation? The user will be notified and won't be able to send more messages.
            </p>
            
            <div className="mb-4">
              <label htmlFor="closure-note" className="block text-sm font-medium text-gray-700 mb-2">
                Closure Note (Optional)
              </label>
              <textarea
                id="closure-note"
                value={closureNote}
                onChange={(e) => setClosureNote(e.target.value)}
                placeholder="Brief reason for closing the chat..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1">
                {closureNote.length}/500 characters
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleClosureCancel}
                disabled={isClosing}
              >
                Cancel
              </Button>
              <Button
                onClick={closeConversation}
                disabled={isClosing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isClosing ? 'Closing...' : 'Close Conversation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}