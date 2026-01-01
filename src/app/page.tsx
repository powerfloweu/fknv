export default function Home() {
  return (
    <main>
      <h1 style={{ fontSize: 32, color: 'red', textAlign: 'center', marginTop: 40 }}>
        Üdvözöl a Fejlődési Kognitív Idegtudomány Vizsgarendszer!<br />
        (Ez a főoldal Vercel deploy teszt.)
      </h1>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <a href="/exam">Próbavizsga indítása &rarr;</a>
      </div>
    </main>
  );
}
