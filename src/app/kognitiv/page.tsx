import Link from "next/link";

export default function KognitivLandingPage() {
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
        boxShadow: '0 8px 32px rgba(16,185,129,0.18)',
        padding: '40px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        marginBottom: 24
      }}>
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
            background: '#047857',
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
            padding: '11px 24px',
            background: 'white',
            color: '#047857',
            border: '2px solid #047857',
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
