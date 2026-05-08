import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SwayCanvas from './SwayCanvas';
import AtmosphereCanvas from './AtmosphereCanvas';
import ParticleCanvas from './ParticleCanvas';
import ParticleTitle from './ParticleTitle';
import { ArrowUpRight, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, 45]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      style={{
        height: '100vh',
        background: '#000',
        overflow: 'hidden',
        position: 'relative',
        direction: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* Background layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <SwayCanvas />
        </motion.div>

        {/* Left black gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.20) 28%, transparent 52%)',
            zIndex: 1,
          }}
        />

        {/* Top/bottom gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.85) 100%)',
            zIndex: 1,
          }}
        />

        {/* Atmosphere motes */}
        <AtmosphereCanvas />

        {/* Sand dust particles */}
        <ParticleCanvas />
      </div>

      {/* Hero content */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 2rem 0 3rem',
          maxWidth: '64rem',
          y: contentY,
          opacity: contentOpacity,
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '2rem' }}
        >
          <span
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 400,
              fontSize: '0.8rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,215,100,0.7)',
              borderBottom: '1px solid rgba(255,215,100,0.35)',
              paddingBottom: '0.2rem',
            }}
          >
            Powered by Gemma 4 · مدعوم بـ جيما ٤
          </span>
        </motion.div>

        {/* Particle title canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
          style={{ marginBottom: '2rem', marginTop: '0.5rem' }}
        >
          <ParticleTitle />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: language === 'ar' ? "'Noto Sans Arabic', sans-serif" : "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.65,
            maxWidth: '36rem',
            marginBottom: '2.5rem',
          }}
        >
          {language === 'en'
            ? "Offline-first Arabic medical triage for underserved MENA communities. Private, local, and in your language."
            : "فرز طبي أولي باللغة العربية يعمل بدون إنترنت للمجتمعات المحرومة في الشرق الأوسط وشمال أفريقيا. خاص، محلي، وبلغتك."}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}
        >
          <button
            onClick={() => setLocation('/for-clinics')}
            className="liquid-glass-strong"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              color: '#fff',
              fontFamily: language === 'ar' ? "'Noto Sans Arabic', sans-serif" : "'Barlow', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(255,215,100,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
            {language === 'en' ? "Install for Your Clinic" : "تثبيت لعيادتك"}
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </button>
          
          <button
            onClick={() => setLocation('/')}
            className="liquid-glass-strong"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              color: '#1a1a1a',
              background: '#FFD764',
              fontFamily: language === 'ar' ? "'Noto Sans Arabic', sans-serif" : "'Barlow', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(255,215,100,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
            {language === 'en' ? "Use as Patient" : "استخدم كمريض"}
            <Smartphone size={16} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => window.open('https://github.com/tejasprasad2008-afk/Tabib.git', '_blank')}
            className="liquid-glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: language === 'ar' ? "'Noto Sans Arabic', sans-serif" : "'Barlow', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 400,
              cursor: 'pointer',
              transition: 'transform 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
            }}
          >
            {language === 'en' ? "View on GitHub" : "عرض على GitHub"}
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontFamily: language === 'ar' ? "'Noto Sans Arabic', sans-serif" : "'Barlow', sans-serif", fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
          {language === 'en' ? "Scroll" : "التمرير"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(255,215,100,0.5), transparent)' }}
        />
      </motion.div>
    </section>
  );
}
