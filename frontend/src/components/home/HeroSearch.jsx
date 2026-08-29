import { useEffect, useRef, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";
import { VoiceInputButton } from "./VoiceInputButton";
import { useSpeechRecognition } from "../../lib/useSpeechRecognition";

export function HeroSearch({ compact = false, onSubmit, autoFocus = false }) {
  const { t, i18n } = useTranslation();
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef(null);

  const language = i18n.language === "kn" ? "kn" : "en";

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("ksp_lang", lang);
  };

  const { isListening, supported, start, stop } = useSpeechRecognition(
    language,
    (transcript) => setValue(transcript)
  );

  const examples = t("hero.examples", { returnObjects: true });

  useEffect(() => {
    if (compact) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % examples.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [compact, examples.length]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    onSubmit(q);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        layout
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 bg-card border border-border rounded-full shadow-soft transition-shadow focus-within:shadow-softLift ${
          compact ? "px-3 sm:px-4 py-2" : "px-4 sm:px-6 py-3 sm:py-4"
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
            compact ? t("hero.placeholderCompact") : examples[placeholderIndex]
          }
          className={`flex-1 min-w-[80px] bg-transparent outline-none text-ink placeholder:text-ink-muted ${
            compact ? "text-sm" : "text-base sm:text-lg"
          } ${language === "kn" ? "font-kannada" : ""}`}
        />
        {!compact && (
          <div className="order-4 sm:order-none w-full sm:w-auto flex justify-center sm:block">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>
        )}
        <VoiceInputButton
          isListening={isListening}
          supported={supported}
          onClick={() => (isListening ? stop() : start())}
        />
        <button
          type="submit"
          aria-label="Submit"
          className={`shrink-0 flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover transition-colors ${
            compact ? "w-8 h-8" : "w-9 h-9 sm:w-11 sm:h-11"
          }`}
        >
          <ArrowRight className={compact ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} strokeWidth={2} />
        </button>
      </motion.div>
    </form>
  );
}
