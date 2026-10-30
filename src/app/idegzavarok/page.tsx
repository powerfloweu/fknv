import Link from "next/link";

export default function IdegzavarokLandingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--paper)',
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
            background: '#c2410c',
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
            padding: '11px 24px',
            background: 'white',
            color: '#c2410c',
            border: '2px solid #c2410c',
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
            marginTop: 12,
            padding: '10px 12px',
            color: '#52606d',
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          ← Tárgyválasztó
        </Link>
      </div>
    </main>
  );
}
