export default function Footer() {
  return (
    <footer
      style={{
        background: '#000',
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            marginBottom: '0.875rem',
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            Tabib
          </span>
          <span
            style={{
              fontFamily: "'Noto Sans Arabic', sans-serif",
              fontWeight: 300,
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.45)',
              marginLeft: '0.2rem',
            }}
          >
            · طبيب
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.30)',
            marginBottom: '2.5rem',
          }}
        >
          Offline-first Arabic medical triage. Powered by Gemma 4.
        </p>

        {/* Links */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          {['Privacy', 'GitHub', 'Documentation', 'Contact'].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.28)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)',
            marginBottom: '2rem',
          }}
        />

        {/* Copyright */}
        <p
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.20)',
            letterSpacing: '0.04em',
          }}
        >
          © 2026 Tabib. Open source. Built for good.
        </p>
      </div>
    </footer>
  );
}
