import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "framer-motion";
import { Copy, Download, Check } from "lucide-react";
import SwayCanvas from "@/components/SwayCanvas";
import ParticleTitle from "@/components/ParticleTitle";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

function GrainOverlay() {
  return (
    <div className="grain-overlay" aria-hidden>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}

function CodeBlock({ code, onCopy }: { code: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };
  return (
    <div
      className="relative group rounded-xl px-4 py-3 font-mono text-sm"
      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)" }}
    >
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>{code}</pre>
      <button
        onClick={handleCopy}
        data-testid="button-copy-code"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
        title="Copy"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

type OS = "linux" | "macos" | "windows";

function Phase01Card({ index }: { index: number }) {
  const [os, setOs] = useState<OS>("linux");
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px" });
  const commands: Record<OS, string> = {
    linux: "curl -fsSL https://ollama.com/install.sh | sh",
    macos: "brew install ollama",
    windows: "Download from ollama.com",
  };
  const osLabels: { key: OS; label: string }[] = [
    { key: "linux", label: "Linux" },
    { key: "macos", label: "macOS" },
    { key: "windows", label: "Windows" },
  ];

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index}
      className="relative p-8"
      style={{
        borderRadius: "1.5rem",
        background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        backdropFilter: "blur(40px)",
        overflow: "hidden",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,100,0.4), transparent)" }}
      />
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, color: "#FFD764", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Phase 01</p>
      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#fff", marginBottom: "1.25rem" }}>Install Ollama</h3>

      <div className="flex gap-1 mb-4">
        {osLabels.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setOs(key)}
            data-testid={`button-os-${key}`}
            className="liquid-glass px-3 py-1 text-xs transition-all"
            style={{
              borderRadius: "9999px",
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 500,
              color: os === key ? "#FFD764" : "rgba(255,255,255,0.5)",
              borderBottom: os === key ? "1px solid #FFD764" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {os === "windows" ? (
        <div
          className="rounded-xl px-4 py-3 font-mono text-sm"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#FFD764", textDecoration: "underline" }}
          >
            Download from ollama.com
          </a>
        </div>
      ) : (
        <CodeBlock code={commands[os]} />
      )}
    </motion.div>
  );
}

function Phase02Card({ index }: { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index}
      className="relative p-8"
      style={{
        borderRadius: "1.5rem",
        background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        backdropFilter: "blur(40px)",
        overflow: "hidden",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,100,0.4), transparent)" }} />
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, color: "#FFD764", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Phase 02</p>
      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#fff", marginBottom: "0.5rem" }}>Download Gemma 4</h3>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
        Pulls the 4-billion parameter edge model. ~2.5GB download.
      </p>
      <CodeBlock code="ollama pull gemma4:e4b" />
      <p style={{ marginTop: "0.75rem", fontFamily: "'Barlow', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
        This is the model that runs your triage AI locally.
      </p>
    </motion.div>
  );
}

function Phase03Card({ index }: { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index}
      className="relative p-8"
      style={{
        borderRadius: "1.5rem",
        background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        backdropFilter: "blur(40px)",
        overflow: "hidden",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,100,0.4), transparent)" }} />
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, color: "#FFD764", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Phase 03</p>
      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#fff", marginBottom: "1.25rem" }}>Wake the Server</h3>
      <div className="flex flex-col gap-3 mb-4">
        <CodeBlock code={`cd tabib-clinic-server && python -m venv venv && source venv/bin/activate\npip install -r requirements.txt`} />
        <CodeBlock code="python main.py" />
      </div>
      <a
        href="/setup.sh"
        download
        data-testid="link-download-setup"
        className="liquid-glass inline-flex items-center gap-2 px-4 py-2 text-sm mb-3"
        style={{
          borderRadius: "0.75rem",
          border: "1px solid rgba(255,215,100,0.3)",
          color: "#FFD764",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        <Download size={14} />
        Download setup.sh
      </a>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
        Or run setup.bat on Windows.
      </p>
    </motion.div>
  );
}

function Phase04Card({ index }: { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index}
      className="relative p-8"
      style={{
        borderRadius: "1.5rem",
        background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        backdropFilter: "blur(40px)",
        overflow: "hidden",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,100,0.4), transparent)" }} />
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, color: "#FFD764", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Phase 04</p>
      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#fff", marginBottom: "1rem" }}>Community Connection</h3>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="pulse-dot w-2.5 h-2.5 rounded-full"
          style={{ background: "#22c55e", display: "inline-block", flexShrink: 0 }}
        />
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, color: "#22c55e", fontSize: "0.875rem" }}>Server is live</span>
      </div>

      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
        Your clinic is now discoverable by patients in your area.
      </p>
      <p
        dir="rtl"
        style={{
          fontFamily: "'Noto Sans Arabic', sans-serif",
          fontWeight: 400,
          color: "rgba(255,215,100,0.7)",
          fontSize: "0.9rem",
          marginBottom: "1.25rem",
        }}
      >
        عيادتك الآن متصلة بالمجتمع
      </p>

      <a
        href="http://localhost:8000/dashboard"
        data-testid="link-open-dashboard"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold"
        style={{
          background: "#FFD764",
          color: "#000",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Open Dashboard →
      </a>
    </motion.div>
  );
}

export default function ClinicSetup() {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const setupRef = useRef(null);
  const footerRef = useRef(null);
  const setupInView = useInView(setupRef, { margin: "-80px" });
  const footerInView = useInView(footerRef, { margin: "-80px" });

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, window.innerHeight * 0.6], [0, 45]);
  const heroOpacity = useTransform(scrollY, [0, window.innerHeight * 0.6], [1, 0]);

  const orbs = [
    { color: "rgba(255,215,100,0.18)", size: 300, x: "-10%", y: "-10%", duration: 10 },
    { color: "rgba(100,180,255,0.12)", size: 260, x: "80%", y: "-5%", duration: 14 },
    { color: "rgba(180,220,100,0.10)", size: 220, x: "-5%", y: "70%", duration: 12 },
    { color: "rgba(255,215,100,0.10)", size: 280, x: "75%", y: "65%", duration: 16 },
  ];

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff" }}>
      <GrainOverlay />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: "100vh" }}
      >
        <SwayCanvas />

        {/* Ambient orbs */}
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              left: orb.x,
              top: orb.y,
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Edge vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)" }}
        />
        {/* Legibility wash */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }}
        />

        {/* Hero content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className="section-badge liquid-glass mb-8 block px-6">
              {t("Guide · Introducing the medical server runtime.", "دليل · نقدم وقت تشغيل الخادم الطبي")}
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="hero-glow mb-6"
          >
            <ParticleTitle />
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.05rem",
              maxWidth: "520px",
              lineHeight: 1.6,
              marginBottom: "0.5rem",
            }}
          >
            {t(
              "Follow the steps below to plant your digital clinic. Takes about 15 minutes.",
              "اتبع الخطوات أدناه لتهيئة عيادتك الرقمية. يستغرق حوالي 15 دقيقة."
            )}
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            dir="rtl"
            style={{
              fontFamily: "'Noto Sans Arabic', sans-serif",
              fontWeight: 400,
              color: "rgba(255,215,100,0.6)",
              fontSize: "0.95rem",
              marginBottom: "2.5rem",
            }}
          >
            اتبع الخطوات أدناه لتهيئة عيادتك الرقمية
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="flex items-center gap-4 flex-wrap justify-center"
          >
            <a
              href="#setup"
              data-testid="link-begin-setup"
              className="liquid-glass-strong inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                border: "1px solid rgba(255,215,100,0.3)",
                color: "#FFD764",
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              {t("Begin Setup", "ابدأ الإعداد")}
            </a>
            <button
              data-testid="button-watch-demo"
              className="inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold transition-all hover:bg-white/5"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {t("Watch Demo", "شاهد العرض")}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* SETUP GUIDE */}
      <section
        id="setup"
        ref={setupRef}
        className="relative px-6 py-24"
        style={{ maxWidth: "72rem", margin: "0 auto" }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={setupInView ? "visible" : "hidden"}
          custom={0}
          className="text-center mb-16"
        >
          <span className="section-badge liquid-glass mb-6 block px-6">
            {t("Setup · Four phases to a living clinic.", "الإعداد · أربع مراحل لعيادة حية")}
          </span>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            {t("Your clinic,", "عيادتك،")}
            <br />
            {t("running in minutes.", "تعمل في دقائق.")}
          </h2>
        </motion.div>

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 28rem), 1fr))",
          }}
        >
          <Phase01Card index={0} />
          <Phase02Card index={1} />
          <Phase03Card index={2} />
          <Phase04Card index={3} />
        </div>
      </section>

      {/* FOOTER */}
      <footer
        ref={footerRef}
        className="py-16 text-center px-6"
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={footerInView ? "visible" : "hidden"}
          custom={0}
        >
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Tabib · <span style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>طبيب</span> — Offline-first medical triage for underserved communities.
          </p>
          <span
            style={{
              display: "inline-block",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#FFD764",
              margin: "0.5rem auto",
            }}
          />
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.875rem",
            }}
          >
            © 2026 Tabib Digital Care. Built for the places that need it most.
          </p>
        </motion.div>
      </footer>
    </div>
  );
}