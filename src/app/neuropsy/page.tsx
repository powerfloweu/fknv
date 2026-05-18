import Link from "next/link";

export default function NeuropsyLandingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #ede9fe 0%, #f5f3ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(139,92,246,0.18)',
        padding: '40px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        marginBottom: 24
      }}>
        <div style={{ marginBottom: 16 }}>
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 12px auto' }}>
            <ellipse cx="45" cy="35" rx="40" ry="28" fill="#c4b5fd" />
            <ellipse cx="30" cy="35" rx="16" ry="20" fill="#ddd6fe" />
            <ellipse cx="60" cy="35" rx="16" ry="20" fill="#ddd6fe" />
            <path d="M45 7 Q50 20 45 35 Q40 50 45 63" stroke="#6d28d9" strokeWidth="2.5" fill="none" />
            <path d="M30 15 Q35 30 30 50" stroke="#6d28d9" strokeWidth="2" fill="none" />
            <path d="M60 15 Q55 30 60 50" stroke="#6d28d9" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#6d28d9', marginBottom: 8 }}>
          Neuropszichológia
        </h1>
        <p style={{ color: '#475569', fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
          10 témakör — neuropszichológia területei, Lurija, orientáció, neglekt, afázia,
          apraxia és agnózia, memória és demencia, figyelem és végrehajtó funkciók,
          neuropszichológiai tesztek, klinikai esetelemzés.
        </p>

        <Link
          href="/neuropsy/tanulas"
          style={{
            display: 'block',
            marginBottom: 12,
            padding: '13px 24px',
            background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
            color: 'white',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 17,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(139,92,246,0.25)'
          }}
        >
          Tanuló mód
        </Link>
        <Link
          href="/neuropsy/vizsga"
          style={{
            display: 'block',
            marginBottom: 12,
            padding: '13px 24px',
            background: 'linear-gradient(90deg, #7c3aed 0%, #9333ea 100%)',
            color: 'white',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 17,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(124,58,237,0.25)'
          }}
        >
          Vizsga indítása →
        </Link>

        <Link
          href="/neuropsy/eset"
          style={{
            display: 'block',
            padding: '13px 24px',
            background: 'white',
            color: '#6d28d9',
            border: '2px solid #8b5cf6',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 17,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(139,92,246,0.18)'
          }}
        >
          🩺 Klinikai esetelemzés (hipotézis-teszt) →
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
