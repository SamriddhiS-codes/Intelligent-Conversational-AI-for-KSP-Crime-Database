import { Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VoiceInputButton({ isListening, supported, onClick }) {
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      className="relative w-10 h-10 shrink-0 rounded-full flex items-center justify-center hover:bg-highlight/50 transition-colors"
    >
      <AnimatePresence>
        {isListening && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-accent/40"
          />
        )}
      </AnimatePresence>
      <Mic
        className={`w-[18px] h-[18px] relative z-10 ${
          isListening ? "text-accent" : "text-ink-muted"
        }`}
        strokeWidth={1.75}
      />
    </button>
  );
}
