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
      padding: '24px 16px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 12px auto' }}>
          <ellipse cx="45" cy="35" rx="40" ry="28" fill="#a5b4fc" />
          <ellipse cx="30" cy="35" rx="16" ry="20" fill="#f0abfc" />
          <ellipse cx="60" cy="35" rx="16" ry="20" fill="#f0abfc" />
          <path d="M45 7 Q50 20 45 35 Q40 50 45 63" stroke="#6366f1" strokeWidth="2.5" fill="none" />
          <path d="M30 15 Q35 30 30 50" stroke="#6366f1" strokeWidth="2" fill="none" />
          <path d="M60 15 Q55 30 60 50" stroke="#6366f1" strokeWidth="2" fill="none" />
        </svg>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#3730a3', marginBottom: 6 }}>
          Tanuló- és Vizsgaplatform
        </h1>
        <div style={{ fontSize: 16, color: '#6366f1', fontWeight: 500 }}>
          Válassz tárgyat
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        maxWidth: 880,
        width: '100%',
        marginBottom: 24,
      }}>
        {/* Subject 1: Fejlődési kognitív idegtudomány */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          boxShadow: '0 8px 24px rgba(60,60,120,0.10)',
          padding: '28px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg,#6366f1,#a5b4fc)',
            borderRadius: 14,
            margin: '0 auto 14px auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 28,
          }}>🧠</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#3730a3', marginBottom: 6 }}>
            Fejlődési Kognitív Idegtudomány
          </h2>
          <div style={{ color: '#475569', fontSize: 14, marginBottom: 18, lineHeight: 1.5, flexGrow: 1 }}>
            Vizsgarendszer ~350 kérdéssel, próbavizsga és tanuló mód, blokk/téma/nehézség szerinti szűréssel.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/exam" style={{
              padding: '10px 18px',
              background: 'linear-gradient(90deg,#6366f1,#a5b4fc)',
              color: 'white', borderRadius: 10,
              fontWeight: 600, fontSize: 15,
              textDecoration: 'none',
            }}>
              Próbavizsga →
            </Link>
            <Link href="/study" style={{
              padding: '10px 18px',
              background: '#eef2ff',
              color: '#3730a3', borderRadius: 10,
              fontWeight: 600, fontSize: 15,
              textDecoration: 'none',
              border: '1.5px solid #c7d2fe',
            }}>
              Tanuló mód
            </Link>
          </div>
        </div>

        {/* Subject 2: Idegrendszer fejlődési zavarai */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          boxShadow: '0 8px 24px rgba(120,80,60,0.10)',
          padding: '28px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg,#f97316,#ec4899)',
            borderRadius: 14,
            margin: '0 auto 14px auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 28,
          }}>🧩</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#9a3412', marginBottom: 6 }}>
            Idegrendszer fejlődési zavarai és fejlesztésük
          </h2>
          <div style={{ color: '#475569', fontSize: 14, marginBottom: 18, lineHeight: 1.5, flexGrow: 1 }}>
            99 gyakorló kérdés 11 témakörben (IKZ, tanulási zavarok, ADHD, autizmus, koraszülöttség, stb.)
            és részletes tanulási segédlet.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/idegzavarok/kviz" style={{
              padding: '10px 18px',
              background: 'linear-gradient(90deg,#f97316,#fb923c)',
              color: 'white', borderRadius: 10,
              fontWeight: 600, fontSize: 15,
              textDecoration: 'none',
            }}>
              Gyakorló kvíz →
            </Link>
            <Link href="/idegzavarok/segedlet" style={{
              padding: '10px 18px',
              background: '#fdf2f8',
              color: '#9a3412', borderRadius: 10,
              fontWeight: 600, fontSize: 15,
              textDecoration: 'none',
              border: '1.5px solid #fbcfe8',
            }}>
              Tanulási segédlet
            </Link>
          </div>
        </div>
      </div>

      <div style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Tanulj, fejlődj, vizsgázz!
      </div>
    </main>
  );
}
