import Link from "next/link";

export default function KognitivLandingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #d1fae5 0%, #ecfeff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(16,185,129,0.18)',
        padding: '40px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        marginBottom: 24
      }}>
        <div style={{ marginBottom: 16 }}>
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 12px auto' }}>
            <ellipse cx="45" cy="35" rx="40" ry="28" fill="#a7f3d0" />
            <ellipse cx="30" cy="35" rx="16" ry="20" fill="#bbf7d0" />
            <ellipse cx="60" cy="35" rx="16" ry="20" fill="#bbf7d0" />
            <path d="M45 7 Q50 20 45 35 Q40 50 45 63" stroke="#047857" strokeWidth="2.5" fill="none" />
            <path d="M30 15 Q35 30 30 50" stroke="#047857" strokeWidth="2" fill="none" />
            <path d="M60 15 Q55 30 60 50" stroke="#047857" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#047857', marginBottom: 8 }}>
          Kognitív pszichológia mesterfokon
        </h1>
        <p style={{ color: '#475569', fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
          13 témakör — arcészlelés, érzelmek, figyelmi torzítások, mentális kép,
          séma, reprezentáció, pszicholingvisztika, elmefilozófia, multimédia-tanulás,
          tudat/tudattalan, neuropszichoanalízis, neuroedukáció, mesterséges intelligencia és megismerés.
        </p>

        <Link
          href="/kognitiv/tanulas"
          style={{
            display: 'block',
            marginBottom: 12,
            padding: '13px 24px',
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 17,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(16,185,129,0.25)'
          }}
        >
          Tanuló mód
        </Link>
        <Link
          href="/kognitiv/vizsga"
          style={{
            display: 'block',
            padding: '13px 24px',
            background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)',
            color: 'white',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 17,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(13,148,136,0.25)'
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
      <div style={{ color: '#475569', fontSize: 14, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Tanulj, fejlődj, vizsgázz!
      </div>
    </main>
  );
}
