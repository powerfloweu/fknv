// Kiértékelés utáni jelölés egy válaszlehetőség mellett. Alakkal (pipa / x) és felolvasható
// szöveggel is jelzi az állapotot, így nem csak a háttérszínből derül ki, mi volt helyes.
export default function AnswerMark({
  correct,
  chosen,
  inheritColor = false,
}: {
  correct: boolean;
  chosen: boolean;
  // Színes háttéren (pl. FKI eredményoldal) a szöveg színét veszi át
  inheritColor?: boolean;
}) {
  if (!correct && !chosen) return null;
  const label = correct
    ? chosen ? "Helyes válasz, ezt jelölted" : "Helyes válasz, nem jelölted"
    : "Hibás, ezt jelölted";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        marginLeft: "auto",
        paddingLeft: 6,
        flexShrink: 0,
        alignSelf: "center",
        color: inheritColor ? "inherit" : correct ? "#15803d" : "#b91c1c",
      }}
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        {correct ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
