"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Database,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Ticket {
  id: string;
  department: string;
  issue: string;
  priority: string;
  location: string;
  status: string;
  eta: string;
}

interface TriageResult {
  citizenResponse: string;
  tickets: Ticket[];
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: input }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      // Handle error silently for prototype
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <main className="min-h-screen px-6 py-16 md:py-24 max-w-5xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[var(--foreground)]" />
          <span className="text-xs font-medium tracking-widest uppercase text-[var(--muted)]">
            Smart 311
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Triage
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2 max-w-md">
          Describe what&apos;s happening. We&apos;ll parse, route, and confirm.
        </p>
      </motion.header>

      {/* Input Section */}
      <motion.section
        layout
        className="mb-12"
        transition={{ layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
      >
        <div className="border border-[var(--border)] rounded-xl p-1 focus-within:border-[var(--foreground)] transition-colors duration-200">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's happening in your neighborhood?"
            rows={4}
            disabled={loading}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed placeholder:text-[var(--muted)] focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              ⌘ + Enter to submit
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              Submit
            </button>
          </div>
        </div>
      </motion.section>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-12"
          >
            <div className="border border-[var(--border)] rounded-xl p-8 relative overflow-hidden">
              {/* Scanning line animation */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--foreground)] to-transparent"
                animate={{ y: [0, 120, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[var(--foreground)]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-sm text-[var(--muted)]">
                  Parsing request and routing to departments...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Dashboard */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Citizen View */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={14} className="text-[var(--muted)]" />
                <span className="text-xs font-medium tracking-wide uppercase text-[var(--muted)]">
                  Citizen Response
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                {result.citizenResponse}
              </p>
              <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center gap-2">
                <CheckCircle2 size={12} className="text-green-600" />
                <span className="text-xs text-[var(--muted)]">
                  Confirmation sent
                </span>
              </div>
            </motion.div>

            {/* System / CMS View */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Database size={14} className="text-[var(--muted)]" />
                <span className="text-xs font-medium tracking-wide uppercase text-[var(--muted)]">
                  System Tickets
                </span>
              </div>
              <div className="space-y-3">
                {result.tickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
                    className="border border-[var(--border)] rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[var(--muted)]">
                        {ticket.id}
                      </span>
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <div className="text-sm font-medium">{ticket.issue}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <Database size={10} />
                        {ticket.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {ticket.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {ticket.eta}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const isHigh = priority.toLowerCase() === "high";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isHigh
          ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
      }`}
    >
      {isHigh && <AlertTriangle size={10} />}
      {priority}
    </span>
  );
}
