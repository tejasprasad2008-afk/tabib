import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <motion.div
        className="liquid-glass flex items-center justify-between px-6 h-14 w-full"
        style={{ borderRadius: "9999px", maxWidth: "56rem" }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontSize: "1.125rem",
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ color: "#ffffff" }}>Tabib</span>
          <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 0.4rem" }}>·</span>
          <span
            style={{
              color: "#FFD764",
              fontFamily: "'Noto Sans Arabic', sans-serif",
              fontStyle: "normal",
              fontWeight: 400,
            }}
          >
            طبيب
          </span>
        </span>

        <button
          onClick={toggleLanguage}
          data-testid="button-language-toggle"
          className="liquid-glass px-4 py-1.5 text-sm font-medium transition-all hover:bg-white/10"
          style={{
            borderRadius: "9999px",
            fontFamily:
              language === "ar"
                ? "'Noto Sans Arabic', sans-serif"
                : "'Barlow', sans-serif",
            fontWeight: 500,
            color: "#FFD764",
            fontSize: "0.8125rem",
            letterSpacing: "0.02em",
          }}
        >
          {language === "en" ? "عربي" : "EN"}
        </button>
      </motion.div>
    </div>
  );
}