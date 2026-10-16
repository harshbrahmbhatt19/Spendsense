import { useEffect, useRef, useState } from "react";
import { aiService } from "@/services/insightsService";
import type { AIMessage } from "@/types";
import { getErrorMessage } from "@/services/api";
import { Sparkles, Send } from "lucide-react";
import { cn } from "@/utils/format";

const SUGGESTIONS = [
  "Where did I spend most of my money this month?",
  "How can I save more money?",
  "What category am I overspending on?",
  "What is my average daily expense?",
];

export const AIAssistantPage = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiService.history().then((res) => setMessages(res.data.data));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setError("");
    setMessages((prev) => [...prev, { role: "user", content: message, createdAt: new Date().toISOString() }]);
    setInput("");
    setSending(true);

    try {
      const res = await aiService.ask(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.data.reply, createdAt: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col md:h-[calc(100vh-120px)]">
      <div className="mb-3">
        <h1 className="font-display text-2xl">AI Financial Assistant</h1>
        <p className="text-sm text-muted">Ask about your real spending — grounded in your own transaction data.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-line p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Sparkles size={28} className="mb-3 text-emerald" />
            <p className="font-display text-lg">Ask me about your finances</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-paper-dim"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
                m.role === "user" ? "bg-emerald text-white" : "border border-line bg-white"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-muted">Thinking...</div>
          </div>
        )}

        {error && <p className="text-sm text-brick">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your spending..."
          className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
