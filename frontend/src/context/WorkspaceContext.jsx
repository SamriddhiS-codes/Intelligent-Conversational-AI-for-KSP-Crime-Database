import { createContext, useContext, useState, useCallback } from "react";
import { runQuery } from "../lib/api";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [history, setHistory] = useState([]); // [{role, content}]
  const [workspace, setWorkspace] = useState(null); // latest /query response
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
        setWorkspace({ ...data, question, askedAt: new Date().toISOString() });
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
    setPrompt("");
    setError(null);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ history, workspace, prompt, loading, error, ask, reset }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
