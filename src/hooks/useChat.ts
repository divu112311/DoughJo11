import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  id: string;
  user_id: string | null;
  message: string | null;
  sender: string | null;
  timestamp: string | null;
}

export const useChat = (user: User | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async (message: string, onXPUpdate?: (points: number) => void) => {
    if (!user || !message.trim()) return;

    setLoading(true);

    try {
      // Add user message to database
      const { data: userMessage, error: userError } = await supabase
        .from('chat_logs')
        .insert({
          user_id: user.id,
          message: message.trim(),
          sender: 'user',
        })
        .select()
        .single();

      if (userError) throw userError;

      // Update local state immediately
      setMessages(prev => [...prev, userMessage]);

      // Generate AI response (mock for now)
      const aiResponse = generateMockResponse(message);

      // Add AI response to database
      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_logs')
        .insert({
          user_id: user.id,
          message: aiResponse,
          sender: 'assistant',
        })
        .select()
        .single();

      if (aiError) throw aiError;

      // Update local state with AI response
      setMessages(prev => [...prev, aiMessage]);

      // Award XP for chat interaction
      if (onXPUpdate) {
        onXPUpdate(5);
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (userMessage: string): string => {
    const responses = [
      "That's a great question! Based on your financial profile, I'd recommend focusing on building your emergency fund first.",
      "I can see you're making good progress with your savings goals. Have you considered automating your investments?",
      "Your spending patterns look healthy overall. Let me help you optimize your budget for better returns.",
      "I notice you're interested in investing. Would you like me to explain some beginner-friendly investment options?",
      "Great job on staying engaged with your finances! Consistency is key to building wealth over time."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchChatHistory,
  };
};