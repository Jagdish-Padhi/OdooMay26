import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from './Button.jsx';
import { getTripChatHistory, sendTripChatMessage } from '../services/ai.service.js';

function ChatBubble({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isAssistant
            ? 'border border-slate-200 bg-white text-slate-700'
            : 'bg-(--app-color-primary) text-white'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function AiConciergeChat({ tripId, tripName }) {
  const [open, setOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [initializedForTrip, setInitializedForTrip] = useState(null);

  const scrollRef = useRef(null);

  const quickPrompts = useMemo(
    () => [
      'It might rain on Day 3. What should I do instead?',
      'I am vegetarian. Which stops should I swap?',
      'My flight lands at 11pm. What can I still do?',
    ],
    [],
  );

  useEffect(() => {
    if (!open || initializedForTrip === tripId) return undefined;

    let alive = true;
    setLoadingHistory(true);

    getTripChatHistory(tripId)
      .then((response) => {
        if (!alive) return;
        setMessages(response.data?.messages || []);
        setInitializedForTrip(tripId);
      })
      .catch((error) => {
        if (!alive) return;
        toast.error(error.message || 'Could not load concierge history.');
      })
      .finally(() => {
        if (alive) setLoadingHistory(false);
      });

    return () => {
      alive = false;
    };
  }, [initializedForTrip, open, tripId]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setMessages([]);
    setDraft('');
    setLoadingHistory(false);
    setSending(false);
    setInitializedForTrip(null);
  }, [tripId]);

  async function handleSend(promptText) {
    const content = String(promptText || draft).trim();
    if (!content || sending) return;

    const userMessage = { role: 'user', content };
    const assistantPlaceholderId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setDraft('');
    setSending(true);
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantPlaceholderId, role: 'assistant', content: '' },
    ]);

    try {
      const result = await sendTripChatMessage({
        tripId,
        messages: [userMessage],
        stream: true,
        onChunk: (_, fullReply) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantPlaceholderId
                ? { ...message, content: fullReply }
                : message,
            ),
          );
        },
      });

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantPlaceholderId
            ? { ...message, content: result.reply }
            : message,
        ),
      );
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== assistantPlaceholderId));
      toast.error(error.message || 'Could not send your question.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-(--app-color-primary) px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-transform hover:scale-[1.02]"
      >
        <Sparkles size={16} />
        Ask your AI Concierge
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="fixed inset-x-0 bottom-0 mx-auto flex h-[88vh] w-full max-w-xl flex-col overflow-hidden border border-white/10 bg-[linear-gradient(180deg,#fff_0%,#f8fafc_100%)] shadow-2xl sm:inset-y-5 sm:right-5 sm:left-auto sm:h-[calc(100vh-2.5rem)] sm:w-104 sm:rounded-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--app-color-text-muted)">
                  <MessageCircle size={14} />
                  AI Concierge
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">{tripName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close concierge chat"
              >
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {loadingHistory ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
                  Loading your trip context...
                </div>
              ) : messages.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                  <p className="font-semibold text-slate-900">Ask anything about this trip.</p>
                  <p className="mt-1 text-slate-500">
                    Weather backups, restaurant swaps, late arrivals, budget tradeoffs, and more.
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatBubble
                    key={message.id || `${message.role}-${index}-${message.content.slice(0, 12)}`}
                    message={message}
                  />
                ))
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend();
                }}
                className="space-y-3"
              >
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about timing, weather, food, budget, or logistics..."
                  rows={3}
                  className="w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--app-color-primary)"
                />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    The concierge remembers this trip.
                  </p>
                  <Button type="submit" loading={sending} disabled={!draft.trim() || sending}>
                    <Send size={14} />
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}