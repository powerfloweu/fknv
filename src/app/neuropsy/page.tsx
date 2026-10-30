import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function NeuropsyLandingPage() {
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
        boxShadow: '0 8px 32px rgba(139,92,246,0.18)',
        padding: '40px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        marginBottom: 24
      }}>
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
            background: '#6d28d9',
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
            padding: '11px 24px',
            background: 'white',
            color: '#6d28d9',
            border: '2px solid #6d28d9',
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
          <Stethoscope aria-hidden="true" size={18} strokeWidth={2} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />Klinikai esetelemzés (hipotézis-teszt) →
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
