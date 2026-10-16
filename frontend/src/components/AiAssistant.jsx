import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Good evening. I'm your personal shopping assistant — tell me the occasion, and I'll curate for you." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await client.post('/ai/chat', { message: text, sessionId });
      setSessionId(data.sessionId);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, products: data.products }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "I'm having trouble connecting right now — please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gold text-inkDeep flex items-center justify-center shadow-[0_0_30px_rgba(198,161,91,0.4)] hover:scale-105 transition-transform duration-300"
        aria-label="Open AI Shopping Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4.5" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-28 right-8 z-50 w-[92vw] max-w-md panel fade-slow shadow-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div>
              <p className="eyebrow">AI Personal Shopper</p>
              <p className="font-display text-lg">At your service</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-ash hover:text-gold text-lg">✕</button>
          </div>

          <div ref={scrollRef} className="px-6 py-5 h-80 overflow-y-auto space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <p className={`inline-block text-sm leading-relaxed max-w-[85%] ${m.role === 'user' ? 'text-parchment' : 'text-ash'}`}>
                  {m.content}
                </p>
                {m.products?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-start">
                    {m.products.map((p) => (
                      <Link key={p.id} to={`/product/${p.slug}`} onClick={() => setOpen(false)} className="text-xs border border-gold/40 px-3 py-1 hover:border-gold hover:text-gold transition-colors">
                        {p.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-ash">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 px-5 py-4 border-t border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a recommendation…"
              className="flex-1 bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60"
            />
            <button type="submit" className="text-gold text-sm tracking-widest2 uppercase hover:text-goldSoft">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
