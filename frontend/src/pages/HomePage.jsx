import { motion, AnimatePresence } from "framer-motion";
import { HeroSearch } from "../components/home/HeroSearch";
import { QuickActions } from "../components/home/QuickActions";
import { useWorkspace } from "../context/WorkspaceContext";
import { WorkspacePage } from "./WorkspacePage";

export function HomePage() {
  const { workspace, loading, error, ask } = useWorkspace();

  if (workspace) return <WorkspacePage />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6">
      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-ink-muted text-sm">
              Generating your investigation workspace…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-4xl font-semibold text-ink mb-2 tracking-tight">
              KSP Intelligence AI
            </h1>
            <p className="text-ink-muted mb-10">
              AI-powered Investigation Workspace
            </p>

            <div className="w-full max-w-2xl mb-4">
              <HeroSearch onSubmit={ask} autoFocus />
            </div>
            {error && <p className="text-xs text-[#8A4A3E] mb-8">{error}</p>}

            <div className="mt-10">
              <QuickActions onSelect={ask} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
