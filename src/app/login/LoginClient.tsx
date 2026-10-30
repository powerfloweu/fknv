"use client";
import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Hibás jelszó");
        setLoading(false);
      }
    } catch {
      setError("Hálózati hiba");
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--paper)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <form
        onSubmit={submit}
        style={{
          background: "white",
          borderRadius: 24,
          boxShadow: "0 8px 32px rgba(60,60,120,0.12)",
          padding: "40px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div aria-hidden="true" style={{
          width: 52, height: 52,
          background: "#eef2ff",
          color: "#4338ca",
          borderRadius: 14,
          margin: "0 auto 18px auto",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><Lock size={26} strokeWidth={1.75} /></div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#3730a3", marginBottom: 6 }}>
          Belépés
        </h1>
        <div style={{ fontSize: 14, color: "#52606d", marginBottom: 22 }}>
          A platform használatához jelszó szükséges.
        </div>

        <input
          type="password"
          aria-label="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Jelszó"
          autoFocus
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1.5px solid #c7d2fe",
            fontSize: 16,
            color: "#3730a3",
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <div style={{ color: "#dc2626", fontSize: 14, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "12px 18px",
            background: loading || !password
              ? "#e0e7ff"
              : "#4338ca",
            color: loading || !password ? "#a5b4fc" : "white",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 16,
            cursor: loading || !password ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "Belépés…" : "Belépés"}
        </button>
      </form>
    </main>
  );
}
