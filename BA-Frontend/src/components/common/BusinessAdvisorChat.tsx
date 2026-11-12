import { useState } from 'react';
import type { FormEvent } from 'react';
import { Bot, LoaderCircle, MessageCircle, Send, X } from 'lucide-react';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export default function BusinessAdvisorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you think through practical ways to grow your business. What would you like advice on?',
    },
  ]);
  const { showToast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || isSending) return;

    setMessages((current) => [...current, { role: 'user', content: question }]);
    setMessage('');
    setIsSending(true);

    try {
      const { data } = await api().post<{ advice: string }>('/api/business-advice', {
        message: question,
        history: messages.slice(-10),
      });
      setMessages((current) => [...current, { role: 'assistant', content: data.advice }]);
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, 'The business advisor could not respond. Please try again.');
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: errorMessage },
      ]);
      showToast('error', errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-100">
      {isOpen && (
        <section
          aria-label="AI Business Advisor"
          className="mb-3 flex h-[min(34rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-blue-950 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-orange-500/20 p-2 text-orange-300">
                <Bot aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">AI Business Advisor</h2>
                <p className="text-xs text-blue-200">Practical growth ideas</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close business advisor"
              className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4" aria-live="polite">
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    entry.role === 'user'
                      ? 'rounded-br-md bg-blue-900 text-white'
                      : 'rounded-bl-md border border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  {entry.content}
                </p>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-sm text-gray-500" role="status">
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                Preparing advice...
              </div>
            )}
          </div>

          <p className="border-t border-gray-100 bg-white px-4 pt-2 text-xs leading-relaxed text-gray-500">
            Your recent chat and question are sent to our AI provider. Avoid sharing passwords or sensitive personal information.
            Advice is for general information, not a guarantee of results.
          </p>
          <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-white p-3">
            <label className="sr-only" htmlFor="business-advisor-message">Ask a business question</label>
            <textarea
              id="business-advisor-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={2000}
              rows={2}
              placeholder="Ask how to grow your business..."
              className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              aria-label="Send message"
              className="rounded-xl bg-orange-600 p-3 text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close business advisor' : 'Open AI business advisor'}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-xl transition hover:scale-105 hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-300"
      >
        {isOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <MessageCircle aria-hidden="true" className="h-6 w-6" />}
      </button>
    </div>
  );
}
