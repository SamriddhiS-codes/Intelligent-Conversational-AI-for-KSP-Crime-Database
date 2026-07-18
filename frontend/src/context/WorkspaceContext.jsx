import { createContext, useContext, useState, useCallback } from "react";
import { runQuery } from "../lib/api";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [history, setHistory] = useState([]);       // [{role, content}] for API
  const [chatEntries, setChatEntries] = useState([]); // [{question, data}] for UI
  const [workspace, setWorkspace] = useState(null);   // latest result
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ask = useCallback(
    async (question) => {
      setLoading(true);
      setError(null);
      setPrompt(question);
      try {
        const data = await runQuery(question, history);
        const entry = { question, data: { ...data, question, askedAt: new Date().toISOString() } };

        setWorkspace({ ...data, question, askedAt: new Date().toISOString() });
        setChatEntries((prev) => [...prev, entry]);
        setHistory((h) => [
          ...h,
          { role: "user", content: question },
          { role: "assistant", content: data.summary || data.message },
        ]);
      } catch (err) {
        setError(
          err?.response?.data?.detail || "Something went wrong reaching the AI service."
        );
      } finally {
        setLoading(false);
      }
    },
    [history]
  );

  const reset = useCallback(() => {
    setWorkspace(null);
    setChatEntries([]);
    setHistory([]);
    setPrompt("");
    setError(null);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ history, chatEntries, workspace, prompt, loading, error, ask, reset }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
