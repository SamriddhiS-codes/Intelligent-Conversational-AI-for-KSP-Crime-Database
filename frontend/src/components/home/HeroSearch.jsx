import { useEffect, useRef, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageToggle } from "./LanguageToggle";
import { VoiceInputButton } from "./VoiceInputButton";
import { useSpeechRecognition } from "../../lib/useSpeechRecognition";

const EXAMPLES = [
  "Find FIR KA-2025-01932",
  "Which districts had the most robberies last year?",
  "Show repeat offenders linked to extortion cases in Belagavi",
  "Predict which districts are at rising risk this month",
];

export function HeroSearch({ compact = false, onSubmit, autoFocus = false }) {
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("en");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef(null);

  const { isListening, supported, start, stop } = useSpeechRecognition(
    language,
    (transcript) => setValue(transcript)
  );

  useEffect(() => {
    if (compact) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % EXAMPLES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [compact]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    onSubmit(q);
    if (!compact) setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        layout
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`flex items-center gap-3 bg-card border border-border rounded-full shadow-soft transition-shadow focus-within:shadow-softLift ${
          compact ? "px-4 py-2" : "px-6 py-4"
        }`}
      >
        <Search
          className={`shrink-0 text-ink-muted ${compact ? "w-4 h-4" : "w-5 h-5"}`}
          strokeWidth={1.75}
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          lang={language}
          placeholder={
            compact ? "Ask another question…" : EXAMPLES[placeholderIndex]
          }
          className={`flex-1 bg-transparent outline-none text-ink placeholder:text-ink-muted ${
            compact ? "text-sm" : "text-lg"
          } ${language === "kn" ? "font-kannada" : ""}`}
        />
        {!compact && <LanguageToggle language={language} onChange={setLanguage} />}
        <VoiceInputButton
          isListening={isListening}
          supported={supported}
          onClick={() => (isListening ? stop() : start())}
        />
        <button
          type="submit"
          aria-label="Submit"
          className={`shrink-0 flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover transition-colors ${
            compact ? "w-8 h-8" : "w-11 h-11"
          }`}
        >
          <ArrowRight className={compact ? "w-4 h-4" : "w-5 h-5"} strokeWidth={2} />
        </button>
      </motion.div>
    </form>
  );
}
