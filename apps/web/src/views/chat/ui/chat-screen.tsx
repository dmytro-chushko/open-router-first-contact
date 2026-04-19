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
import { useTranslations } from 'next-intl';

import { useChatScreen } from '../hooks/use-chat-screen';

import { getPublicApiBaseUrl } from '@/shared/config/public-api-url';

export function ChatScreen() {
  const t = useTranslations('chat');
  const {
    messages,
    draft,
    error,
    isPending,
    endRef,
    onKeyDown,
    canSend,
    handleSend,
    setDraft,
  } = useChatScreen();

  return (
    <div className="bg-background flex h-full flex-col items-center px-4 py-8">
      <Card className="flex h-[min(720px,calc(100dvh-4rem))] w-full max-w-2xl flex-col">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('description', { apiUrl: getPublicApiBaseUrl() })}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 pt-4">
          <ScrollArea className="min-h-0 flex-1">
            <section
              className="flex flex-col gap-3 pr-3 pb-2"
              aria-label={t('title')}
            >
              {messages.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  {t('emptyHint')}
                </p>
              )}
              {messages.map((m) => (
                <article
                  key={m.id}
                  aria-label={
                    m.role === 'user' ? t('yourMessage') : t('assistantReply')
                  }
                  className={
                    m.role === 'user'
                      ? 'ml-8 rounded-lg bg-primary/10 px-3 py-2'
                      : 'mr-8 rounded-lg bg-muted px-3 py-2'
                  }
                >
                  <div className="text-muted-foreground mb-1 text-xs font-medium capitalize">
                    {m.role}
                  </div>
                  <div className="text-sm wrap-break-word whitespace-pre-wrap">
                    {m.content}
                  </div>
                </article>
              ))}
              {isPending && (
                <div
                  className="text-muted-foreground mr-8 rounded-lg bg-muted px-3 py-2 text-sm italic"
                  aria-live="polite"
                  aria-busy="true"
                >
                  {t('thinking')}
                </div>
              )}
              <div ref={endRef} />
            </section>
          </ScrollArea>

          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-0 border-t border-border p-0!">
          <div className="flex w-full min-w-0 flex-col gap-2 px-4 pt-4 pb-4">
            <label className="sr-only" htmlFor="chat-input">
              {t('messageLabel')}
            </label>
            <Textarea
              id="chat-input"
              placeholder={t('inputPlaceholder')}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isPending}
              rows={3}
              className="resize-none"
              aria-label={t('inputAriaLabel')}
            />
            <div className="flex w-full justify-end">
              <Button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend}
                aria-busy={isPending}
                className="gap-2 [&_svg]:translate-y-px"
              >
                <Send className="size-4" aria-hidden />
                {t('send')}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
