import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function WorkspaceHeader({ prompt }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <p className="text-xs font-medium tracking-wide uppercase text-ink-muted mb-1">
        {t("workspace.eyebrow")}
      </p>
      <p className="text-xl text-ink font-medium leading-snug">{prompt}</p>
    </motion.div>
  );
}
