# Fejlődési Kognitív Idegtudomány Vizsgáztató Webapp

Ez a projekt egy Next.js alapú webalkalmazás, amely egy 200 kérdéses kérdésbankot tartalmaz (easy/medium/hard blokkok), minden kérdéshez 1 perces időzítővel, valamint próbavizsga funkcióval (90 kérdés). A projekt készen áll Vercel deployra.

## Fő funkciók
- 200 kérdéses kérdésbank (easy, medium, hard)
- 1 perces időzítő minden kérdéshez
- Próbavizsga: 90 véletlenszerű kérdés
- Modern Next.js + Tailwind CSS frontend

## Fejlesztés
- `npm run dev` – fejlesztői szerver indítása
- `npm run build` – buildelés
- `npm run start` – production szerver indítása

## Deploy
A projekt könnyen deployolható Vercelre.

## TODO
- Kérdésbank implementálása
- Vizsgaváz logika
- UI fejlesztés
- Tesztelés

---

Kérdés vagy javaslat esetén nyugodtan jelezz!

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
