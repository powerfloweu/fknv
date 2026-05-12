import Link from "next/link";

export default function IdegzavarokLandingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #fef3c7 0%, #fce7f3 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(120,80,60,0.12)',
        padding: '40px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        marginBottom: 24
      }}>
        <div style={{ marginBottom: 16 }}>
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 12px auto' }}>
            <ellipse cx="45" cy="35" rx="40" ry="28" fill="#fbcfe8" />
            <ellipse cx="30" cy="35" rx="16" ry="20" fill="#fde68a" />
            <ellipse cx="60" cy="35" rx="16" ry="20" fill="#fde68a" />
            <path d="M45 7 Q50 20 45 35 Q40 50 45 63" stroke="#b45309" strokeWidth="2.5" fill="none" />
            <path d="M30 15 Q35 30 30 50" stroke="#b45309" strokeWidth="2" fill="none" />
            <path d="M60 15 Q55 30 60 50" stroke="#b45309" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>
          Idegrendszer fejlődési zavarai és fejlesztésük
        </h1>
        <p style={{ color: '#475569', fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
          11 témakör — IKZ, tanulási zavarok, ADHD, autizmus, koraszülöttség,
          szenzoros integráció, kommunikáció, fejlesztés és intervenció.
        </p>

        <Link
          href="/idegzavarok/tanulas"
          style={{
            display: 'block',
            marginBottom: 12,
            padding: '13px 24px',
            background: 'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)',
            color: 'white',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 17,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(236,72,153,0.18)'
          }}
        >
          Tanuló mód
        </Link>
        <Link
          href="/idegzavarok/vizsga"
          style={{
            display: 'block',
            padding: '13px 24px',
            background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
            color: 'white',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 17,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(249,115,22,0.18)'
          }}
        >
          Vizsga indítása →
        </Link>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: 20,
            color: '#64748b',
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          ← Tárgyválasztó
        </Link>
      </div>
      <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Tanulj, fejlődj, vizsgázz!
      </div>
    </main>
  );
}
