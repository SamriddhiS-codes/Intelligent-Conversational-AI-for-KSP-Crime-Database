import { useEffect, useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { getConversations } from "../../lib/api";
import { useWorkspace } from "../../context/WorkspaceContext";

export function ChatHistorySidebar() {
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
  }, [conversationId]);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-bg-secondary flex flex-col">
      <div className="p-3">
        <button
          onClick={reset}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wide px-2 mb-2">
          History
        </p>

        {loadingList && <p className="text-xs text-ink-muted px-2">Loading...</p>}

        {!loadingList && conversations.length === 0 && (
          <p className="text-xs text-ink-muted px-2">No past conversations yet.</p>
        )}

        <div className="flex flex-col gap-0.5">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
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
    </aside>
  );
}