import { useEffect, useState } from "react";
import { Plus, MessageSquare, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getConversations } from "../../lib/api";
import { useWorkspace } from "../../context/WorkspaceContext";

function HistoryList({ onNavigate }) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const { conversationId, reset, loadConversation } = useWorkspace();

  const refresh = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return (
    <>
      <div className="p-3">
        <button
          onClick={() => { reset(); onNavigate?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          {t("workspace.newChat", { defaultValue: "New Chat" })}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wide px-2 mb-2">
          {t("workspace.historyLabel", { defaultValue: "History" })}
        </p>

        {loadingList && (
          <p className="text-xs text-ink-muted px-2">
            {t("workspace.loadingHistory", { defaultValue: "Loading..." })}
          </p>
        )}

        {!loadingList && conversations.length === 0 && (
          <p className="text-xs text-ink-muted px-2">
            {t("workspace.noHistory", { defaultValue: "No past conversations yet." })}
          </p>
        )}

        <div className="flex flex-col gap-0.5">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => { loadConversation(c.id); onNavigate?.(); }}
              className={`flex items-start gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                c.id === conversationId
                  ? "bg-highlight text-accent font-medium"
                  : "text-ink-muted hover:bg-highlight/50 hover:text-ink"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
              <span className="truncate">{c.title || "Untitled"}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function ChatHistorySidebar({ mobileOpen = false, onClose }) {
  return (
    <>
      {/* Desktop: static sidebar, unchanged, hidden below md */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-bg-secondary flex-col">
        <HistoryList />
      </aside>

      {/* Mobile: off-canvas drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <aside
          className={`absolute top-0 left-0 h-full w-64 bg-bg-secondary border-r border-border flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end px-3 pt-3">
            <button
              onClick={onClose}
              aria-label="Close history"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-highlight/50 text-ink-muted"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto -mt-3">
            <HistoryList onNavigate={onClose} />
          </div>
        </aside>
      </div>
    </>
  );
}
