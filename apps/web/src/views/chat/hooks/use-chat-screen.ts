'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

import { ChatMessage } from '../model/chat-message';

import { useChatCompletionMutation } from '@/entities/chat';
import { useError } from '@/shared/hooks/use-error';

export function useChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const {
    mutateAsync,
    isPending,
    reset,
    error: mutationError,
    isError,
  } = useChatCompletionMutation();
  const { getErrorMessage } = useError();
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();

    if (!text || isPending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setDraft('');
    setError(null);
    setMessages((prev) => [...prev, userMessage]);
    reset();

    const historyForApi = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const assistantContent = await mutateAsync({
      messages: historyForApi,
    });
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: assistantContent,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, [draft, isPending, messages, mutateAsync, reset]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  useEffect(() => {
    if (isError && mutationError) {
      setError(getErrorMessage(mutationError));
    }
  }, [isError, mutationError, getErrorMessage]);

  const canSend = draft.trim().length > 0 && !isPending;

  return {
    messages,
    draft,
    error,
    isPending,
    reset,
    endRef,
    onKeyDown,
    canSend,
    handleSend,
    setDraft,
  };
}
