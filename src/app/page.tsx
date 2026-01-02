import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(60,60,120,0.12)',
        padding: '40px 32px 32px 32px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        marginBottom: 32
      }}>
        <div style={{ marginBottom: 24 }}>
          {/* Simple SVG brain illustration */}
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 12px auto' }}>
            <ellipse cx="45" cy="35" rx="40" ry="28" fill="#a5b4fc" />
            <ellipse cx="30" cy="35" rx="16" ry="20" fill="#f0abfc" />
            <ellipse cx="60" cy="35" rx="16" ry="20" fill="#f0abfc" />
            <path d="M45 7 Q50 20 45 35 Q40 50 45 63" stroke="#6366f1" strokeWidth="2.5" fill="none" />
            <path d="M30 15 Q35 30 30 50" stroke="#6366f1" strokeWidth="2" fill="none" />
            <path d="M60 15 Q55 30 60 50" stroke="#6366f1" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#3730a3', marginBottom: 10 }}>
          Fejlődési Kognitív Idegtudomány
        </h1>
        <div style={{ fontSize: 18, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          Vizsgarendszer & Tanulóplatform
        </div>
        <p style={{ color: '#334155', fontSize: 16, marginBottom: 24 }}>
          Fedezd fel az agy fejlődésének, kognitív funkcióinak és vizsgálati módszereinek világát!<br />
          Próbavizsga, tanulás, magyarázatok – minden egy helyen.
        </p>
        <Link
          href="/exam"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: 18,
            padding: '12px 32px',
            borderRadius: 12,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
            transition: 'background 0.2s'
          }}
        >
          Próbavizsga indítása &rarr;
        </Link>
      </div>
      <div style={{ color: '#64748b', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Kognitív idegtudomány – tanulj, fejlődj, vizsgázz!
      </div>
    </main>
  );
}
