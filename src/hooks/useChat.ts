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

      // Call OpenAI API through Supabase Edge Function
      const { data: aiResponseData, error: aiError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: message.trim(),
          userId: user.id,
        },
      });

      if (aiError) {
        console.error('AI API Error:', aiError);
        throw aiError;
      }

      const aiResponse = aiResponseData?.response || generateFallbackResponse();

      // Add AI response to database
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('chat_logs')
        .insert({
          user_id: user.id,
          message: aiResponse,
          sender: 'assistant',
        })
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;

      // Update local state with AI response
      setMessages(prev => [...prev, aiMessage]);

      // Award XP for chat interaction
      if (onXPUpdate) {
        onXPUpdate(5);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add fallback response on error
      const fallbackResponse = generateFallbackResponse();
      const { data: fallbackMessage } = await supabase
        .from('chat_logs')
        .insert({
          user_id: user.id,
          message: fallbackResponse,
          sender: 'assistant',
        })
        .select()
        .single();

      if (fallbackMessage) {
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackResponse = (): string => {
    const responses = [
      "I'm here to help with your financial goals! What would you like to know about budgeting, saving, or investing?",
      "Great question! While I process that, remember that building good financial habits is key to long-term success.",
      "I'm experiencing some technical difficulties, but I'm still here to help you make smart financial decisions!",
      "Let me help you with your financial planning. What specific area would you like to focus on today?",
      "Your financial journey is important to me. How can I assist you in reaching your goals today?"
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