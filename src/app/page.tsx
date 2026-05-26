"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Database,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  History,
  Trash2,
  ChevronRight,
  Zap,
  Shield,
  CircleDot,
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

interface HistoryEntry {
  id: string;
  complaint: string;
  result: TriageResult;
  timestamp: number;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("triage-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (entries: HistoryEntry[]) => {
    setHistory(entries);
    localStorage.setItem("triage-history", JSON.stringify(entries));
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setResult(null);
    setSelectedEntry(null);
    setLoading(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: input }),
      });
      const data: TriageResult = await res.json();
      setResult(data);

      // Add to history
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        complaint: input,
        result: data,
        timestamp: Date.now(),
      };
      saveHistory([entry, ...history].slice(0, 50)); // Keep last 50
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

  const clearHistory = () => {
    saveHistory([]);
    setSelectedEntry(null);
  };

  const viewHistoryEntry = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setResult(entry.result);
    setInput(entry.complaint);
    setShowHistory(false);
  };

  const activeResult = selectedEntry ? selectedEntry.result : result;
  const ticketCount = history.reduce(
    (sum, h) => sum + h.result.tickets.length,
    0
  );

  return (
    <main className="min-h-screen px-6 py-16 md:py-24 max-w-5xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs font-medium tracking-widest uppercase text-[var(--muted)]">
                Smart 311
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Triage
            </h1>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-md">
              Describe what&apos;s happening. We&apos;ll parse, route, and
              confirm.
            </p>
          </div>

          {/* Stats + History Toggle */}
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:flex items-center gap-4 text-xs text-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2"
              >
                <span className="flex items-center gap-1">
                  <Database size={10} />
                  {ticketCount} tickets
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={10} />
                  {history.length} reports
                </span>
              </motion.div>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                showHistory
                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <History size={12} />
              History
              {history.length > 0 && (
                <span className="bg-[var(--background)] text-[var(--foreground)] px-1.5 py-0.5 rounded text-[10px] font-mono">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-8 overflow-hidden"
          >
            <div className="border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium tracking-wide uppercase text-[var(--muted)]">
                  Past Submissions
                </span>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={10} />
                    Clear
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-[var(--muted)] py-4 text-center">
                  No submissions yet. Try reporting an issue above.
                </p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => viewHistoryEntry(entry)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                        selectedEntry?.id === entry.id
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{entry.complaint}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] opacity-60">
                            {new Date(entry.timestamp).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span className="text-[10px] opacity-60">
                            • {entry.result.tickets.length} ticket
                            {entry.result.tickets.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={12} className="opacity-40 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

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
        {activeResult && !loading && (
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
                {activeResult.citizenResponse}
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
                {activeResult.tickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
                    className={`rounded-lg p-4 space-y-2 border-l-[3px] border ${borderColorForPriority(ticket.priority)}`}
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

      {/* Empty State */}
      {!activeResult && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center gap-6 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <Zap size={12} />
              AI-powered routing
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={12} />
              Priority detection
            </span>
            <span className="flex items-center gap-1.5">
              <CircleDot size={12} />
              Multi-issue parsing
            </span>
          </div>
        </motion.div>
      )}
    </main>
  );
}

// ─── Priority Styling ────────────────────────────────────────────────────────

function borderColorForPriority(priority: string): string {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "border-l-red-500 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20";
    case "high":
      return "border-l-orange-500 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20";
    case "normal":
      return "border-l-blue-500 border-[var(--border)] bg-transparent";
    case "low":
      return "border-l-neutral-300 border-[var(--border)] bg-transparent";
    default:
      return "border-l-neutral-300 border-[var(--border)] bg-transparent";
  }
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = getPriorityConfig(priority);
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.classes}`}
    >
      {config.icon}
      {priority}
    </span>
  );
}

function getPriorityConfig(priority: string) {
  switch (priority.toLowerCase()) {
    case "urgent":
      return {
        classes:
          "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        icon: <AlertTriangle size={10} />,
      };
    case "high":
      return {
        classes:
          "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
        icon: <AlertTriangle size={10} />,
      };
    case "normal":
      return {
        classes:
          "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
        icon: null,
      };
    case "low":
      return {
        classes:
          "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
        icon: null,
      };
    default:
      return {
        classes:
          "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
        icon: null,
      };
  }
}
