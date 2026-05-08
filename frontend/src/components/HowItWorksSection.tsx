import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const STEPS = [
  {
    num: '01',
    title: 'Describe Your Symptoms',
    titleAr: 'صف أعراضك',
    desc: 'Speak or type in Arabic or English. Tabib understands your natural language without requiring medical terminology.',
  },
  {
    num: '02',
    title: 'AI Triage Assessment',
    titleAr: 'تقييم ذكاء اصطناعي',
    desc: 'Gemma 4 analyzes your symptoms and provides a color-coded urgency assessment: emergency, see a doctor, or home care.',
  },
  {
    num: '03',
    title: 'Clinic Connection',
    titleAr: 'الاتصال بالعيادة',
    desc: 'If needed, Tabib notifies clinic staff directly — a real doctor sees your summary before you even reach the desk.',
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      style={{
        background: '#000',
        padding: '10rem 1.5rem 14rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ken Burns background image */}
      <motion.img
        src="/section3-bg.jpg"
        alt=""
        animate={{
          scale: [1.06, 1.12, 1.06],
          x: ['0%', '-2%', '0%'],
          y: ['0%', '-1.5%', '0%'],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          transformOrigin: 'center center',
          zIndex: 0,
        }}
      />

      {/* Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.75) 10%, rgba(0,0,0,0.4) 20%, transparent 38%, transparent 72%, rgba(0,0,0,0.6) 88%, black 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, black 0%, transparent 18%, transparent 82%, black 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.38)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        ref={ref}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '64rem',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ marginBottom: '1.5rem' }}
        >
          <span className="section-badge">How It Works · كيف يعمل</span>
        </motion.div>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.92,
            color: '#fff',
            marginBottom: '1.75rem',
          }}
        >
          Simple. Private.
          <br />
          Yours.
        </motion.h2>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.7,
            maxWidth: '44rem',
            margin: '0 auto 5rem',
          }}
        >
          Describe your symptoms in Arabic or English. Tabib triages your concern with AI, then connects you to a real clinic if needed — all without your data ever leaving the room.
        </motion.p>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            textAlign: 'left',
          }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              custom={3 + i}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              style={{
                padding: '1.75rem',
                borderRadius: '1.25rem',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,215,100,0.10)',
                boxShadow: '0 1px 0 rgba(255,215,100,0.06) inset, 0 16px 48px rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,215,100,0.5)',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                }}
              >
                Step {step.num}
              </div>
              <div
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: '1.25rem',
                  color: '#fff',
                  marginBottom: '0.35rem',
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.9rem',
                  color: 'rgba(255,215,100,0.55)',
                  marginBottom: '0.75rem',
                }}
              >
                {step.titleAr}
              </div>
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.65,
                }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
