import { createContext, useContext, useState, useCallback } from "react";
import { runQuery, getConversation } from "../lib/api";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [chatEntries, setChatEntries] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const ask = useCallback(
    async (question) => {
      setLoading(true);
      setError(null);
      setPrompt(question);
      try {
        const data = await runQuery(question, history, conversationId);
        const entry = { question, data: { ...data, question, askedAt: new Date().toISOString() } };

        setWorkspace({ ...data, question, askedAt: new Date().toISOString() });
        setChatEntries((prev) => [...prev, entry]);
        setHistory((h) => [
          ...h,
          { role: "user", content: question },
          { role: "assistant", content: data.summary || data.message },
        ]);
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }
      } catch (err) {
        setError(
          err?.response?.data?.detail || "Something went wrong reaching the AI service."
        );
      } finally {
        setLoading(false);
      }
    },
    [history, conversationId]
  );

  const reset = useCallback(() => {
    setWorkspace(null);
    setChatEntries([]);
    setHistory([]);
    setPrompt("");
    setError(null);
    setConversationId(null);
  }, []);

  const loadConversation = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const convo = await getConversation(id);
      const msgs = convo.messages || [];

      const entries = [];
      const apiHistory = [];
      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];
        apiHistory.push({ role: m.role, content: m.content });
        if (m.role === "user") {
          const next = msgs[i + 1];
          const data = next?.response_data || { message: next?.content, summary: next?.content };
          entries.push({
            question: m.content,
            data: { ...data, question: m.content, askedAt: m.created_at },
          });
        }
      }

      setChatEntries(entries);
      setHistory(apiHistory);
      setWorkspace(entries.length ? entries[entries.length - 1].data : null);
      setConversationId(id);
      setPrompt("");
    } catch (err) {
      setError("Couldn't load that conversation.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        history, chatEntries, workspace, prompt, loading, error,
        conversationId, ask, reset, loadConversation,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);