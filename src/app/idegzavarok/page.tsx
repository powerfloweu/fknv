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
        maxWidth: 560,
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
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>
          Idegrendszer fejlődési zavarai és fejlesztésük
        </h1>
        <div style={{ fontSize: 16, color: '#b45309', fontWeight: 500, marginBottom: 22 }}>
          Gyakorló kvíz és tanulási segédlet
        </div>
        <p style={{ color: '#334155', fontSize: 15, marginBottom: 26, lineHeight: 1.5 }}>
          11 témakör: fejlődési pszichopatológia, etiológia, IKZ, tanulási zavarok,
          szenzoros integráció, koraszülöttség, nyelv és kommunikáció, ADHD,
          autizmus, fejlesztés és intervenció, átfogó kérdések.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            href="/idegzavarok/kviz"
            style={{
              display: 'inline-block',
              padding: '14px 24px',
              background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
              color: 'white',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 17,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(249,115,22,0.18)'
            }}
          >
            Gyakorló kvíz indítása →
          </Link>
          <Link
            href="/idegzavarok/segedlet"
            style={{
              display: 'inline-block',
              padding: '14px 24px',
              background: 'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)',
              color: 'white',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 17,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(236,72,153,0.18)'
            }}
          >
            Tanulási segédlet megnyitása →
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 4,
              padding: '10px 20px',
              background: '#f1f5f9',
              color: '#3730a3',
              borderRadius: 10,
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
              border: '1.5px solid #cbd5e1'
            }}
          >
            ← Vissza a tárgyválasztóhoz
          </Link>
        </div>
      </div>
      <div style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Tanulj, gyakorolj, készülj a vizsgára!
      </div>
    </main>
  );
}
