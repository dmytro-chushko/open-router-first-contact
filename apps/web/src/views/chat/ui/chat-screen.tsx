'use client';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Textarea } from '@repo/ui/components/textarea';
import { Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChatMessage } from '../model/chat-message';

import { postChatCompletion } from '@/shared/api/post-chat-completion';
import { getPublicApiBaseUrl } from '@/shared/config/public-api-url';

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();

    if (!text || isSending) {
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
    setIsSending(true);

    const historyForApi = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const assistantContent = await postChatCompletion({
        messages: historyForApi,
      });
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Request failed';
      setError(message);
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const canSend = draft.trim().length > 0 && !isSending;

  return (
    <div className="bg-background flex min-h-dvh flex-col items-center px-4 py-8">
      <Card className="flex h-[min(720px,calc(100dvh-4rem))] w-full max-w-2xl flex-col">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            Messages are sent to your API at{' '}
            <code className="text-xs">{getPublicApiBaseUrl()}</code>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 px-0 pt-4">
          <ScrollArea className="min-h-0 flex-1 px-4">
            <div className="flex flex-col gap-3 pr-3 pb-2">
              {messages.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Start a conversation. Press Enter to send, Shift+Enter for a
                  new line.
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === 'user'
                      ? 'ml-8 rounded-lg bg-primary/10 px-3 py-2'
                      : 'mr-8 rounded-lg bg-muted px-3 py-2'
                  }
                >
                  <div className="text-muted-foreground mb-1 text-xs font-medium capitalize">
                    {m.role}
                  </div>
                  <div className="text-sm break-words whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="text-muted-foreground mr-8 rounded-lg bg-muted px-3 py-2 text-sm italic">
                  Thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          {error && (
            <p className="text-destructive px-4 text-sm" role="alert">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="border-t border-border flex flex-col gap-2 pt-4">
          <label className="sr-only" htmlFor="chat-input">
            Message
          </label>
          <Textarea
            id="chat-input"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isSending}
            rows={3}
            className="resize-none"
            aria-label="Chat message input"
          />
          <div className="flex w-full justify-end">
            <Button
              type="button"
              onClick={() => void handleSend()}
              disabled={!canSend}
              className="gap-2"
            >
              <Send className="size-4" aria-hidden />
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
