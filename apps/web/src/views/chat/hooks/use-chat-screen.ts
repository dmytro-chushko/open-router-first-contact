'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useCallback, useEffect } from 'react';

import { ChatMessage } from '../model/chat-message';

import { useChatCompletionMutation } from '@/entities/chat';
import { FrontChatError } from '@/shared/lib/front-chat-error';

export function useChatScreen() {
  const tErrors = useTranslations('errors');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending, reset } = useChatCompletionMutation();
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

    try {
      const assistantContent = await mutateAsync({
        messages: historyForApi,
      });
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      if (e instanceof FrontChatError) {
        if (e.payload.kind === 'http') {
          setError(
            tErrors('requestFailed', { status: String(e.payload.status) })
          );
        } else {
          setError(tErrors('invalidResponse'));
        }
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(tErrors('unknown'));
      }
    }
  }, [draft, isPending, messages, mutateAsync, reset, tErrors]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

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
