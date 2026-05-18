"use client";
import Link from "next/link";
import { useState } from "react";

export type CaseStep = {
  question: string;
  options: string[];
  answer: number;       // 1-based
  explanation: string;
  info: string;         // new info revealed AFTER this step is answered
};

export type Case = {
  id: number;
  title: string;
  topicTag: string;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  source?: string;
  intro: string;
  steps: CaseStep[];
};

const diffLabel: Record<string, string> = { easy: "Könnyű", medium: "Közepes", hard: "Nehéz" };
const diffColor: Record<string, string> = { easy: "#16a34a", medium: "#ca8a04", hard: "#dc2626" };

export default function CaseClient({ cse }: { cse: Case }) {
  // selections[i] = 1-based index of user's choice for step i (or null)
  const [selections, setSelections] = useState<(number | null)[]>(
    () => cse.steps.map(() => null)
  );
  // revealed[i] = true if step i is "submitted" (user has clicked answer)
  const [revealed, setRevealed] = useState<boolean[]>(
    () => cse.steps.map(() => false)
  );

  const totalAnswered = revealed.filter(Boolean).length;
  const totalCorrect = revealed.reduce(
    (acc, r, i) => acc + (r && selections[i] === cse.steps[i].answer ? 1 : 0),
    0
  );
  const isFinished = totalAnswered === cse.steps.length;

  function selectAnswer(stepIdx: number, optionIdx: number) {
    if (revealed[stepIdx]) return;
    const newSel = [...selections];
    newSel[stepIdx] = optionIdx;
    setSelections(newSel);
  }

  function submitStep(stepIdx: number) {
    if (selections[stepIdx] == null) return;
    const newRev = [...revealed];
    newRev[stepIdx] = true;
    setRevealed(newRev);
  }

  function reset() {
    setSelections(cse.steps.map(() => null));
    setRevealed(cse.steps.map(() => false));
  }

  // Determine which step is "currently active": first unrevealed
  const activeStepIdx = revealed.findIndex((r) => !r);

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #ede9fe 0%, #f5f3ff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
    }}>
      {/* Top bar */}
      <div style={{ width: "100%", maxWidth: 860, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Link href="/neuropsy/eset" style={{ color: "#6d28d9", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #c4b5fd" }}>
          ← Esetek listája
        </Link>
        <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 500 }}>
          {totalAnswered} / {cse.steps.length} lépés · ✓ {totalCorrect}
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 6px 24px rgba(139,92,246,0.10)", padding: "24px", maxWidth: 860, width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "2px solid #ddd6fe" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#4c1d95", margin: 0 }}>
              <span style={{ color: "#7c3aed", marginRight: 6 }}>{cse.id}.</span>{cse.title}
            </h1>
            <span style={{ background: diffColor[cse.difficulty], color: "white", fontSize: 12, padding: "3px 9px", borderRadius: 999, fontWeight: 600, flexShrink: 0 }}>
              {diffLabel[cse.difficulty]}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 500 }}>{cse.topicTag}</div>
        </div>

        {/* Intro */}
        <div style={{ padding: "14px 16px", background: "#f5f3ff", border: "1.5px solid #ddd6fe", borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
            Kezdeti információk
          </div>
          <div style={{ fontSize: 15, color: "#4c1d95", lineHeight: 1.6 }}>
            {cse.intro}
          </div>
        </div>

        {/* Steps (accordion) */}
        {cse.steps.map((step, idx) => {
          const isRevealed = revealed[idx];
          const isActive = idx === activeStepIdx;
          const isFuture = idx > activeStepIdx;
          const userSel = selections[idx];
          const isCorrect = userSel === step.answer;

          if (isFuture) {
            // Closed/locked step
            return (
              <div key={idx} style={{
                padding: "12px 16px",
                background: "#f5f3ff",
                border: "1.5px dashed #c4b5fd",
                borderRadius: 10,
                marginBottom: 10,
                opacity: 0.5,
                fontSize: 13,
                color: "#7c3aed",
                fontWeight: 500,
              }}>
                🔒 {idx + 1}. lépés — válaszolj az előzőre a feloldáshoz
              </div>
            );
          }

          return (
            <div key={idx} style={{ marginBottom: 14 }}>
              <div style={{
                padding: "16px 18px",
                background: "white",
                border: isActive ? "2px solid #8b5cf6" : "1.5px solid #ddd6fe",
                borderRadius: 12,
                boxShadow: isActive ? "0 4px 14px rgba(139,92,246,0.12)" : "none",
              }}>
                {/* Step label */}
                <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                  {idx + 1}. lépés
                </div>

                {/* Question */}
                <div style={{ fontSize: 16, fontWeight: 600, color: "#4c1d95", marginBottom: 12, lineHeight: 1.4 }}>
                  {step.question}
                </div>

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  {step.options.map((opt, i) => {
                    const idx1 = i + 1;
                    const isSel = userSel === idx1;
                    const isAns = step.answer === idx1;
                    let bg = "#f9fafb", color = "#374151", border = "1.5px solid transparent";
                    if (!isRevealed) {
                      if (isSel) { bg = "#ede9fe"; color = "#4c1d95"; border = "1.5px solid #8b5cf6"; }
                    } else {
                      if (isAns) { bg = "#dcfce7"; color = "#166534"; border = "1.5px solid #16a34a"; }
                      else if (isSel) { bg = "#fee2e2"; color = "#991b1b"; border = "1.5px solid #dc2626"; }
                    }
                    return (
                      <button
                        key={i}
                        disabled={isRevealed}
                        onClick={() => selectAnswer(idx, idx1)}
                        style={{
                          textAlign: "left",
                          padding: "10px 14px",
                          background: bg,
                          color,
                          border,
                          borderRadius: 8,
                          cursor: isRevealed ? "default" : "pointer",
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        <b style={{ marginRight: 8 }}>{String.fromCharCode(65 + i)})</b>{opt}
                      </button>
                    );
                  })}
                </div>

                {/* Submit button (if not yet revealed) */}
                {!isRevealed && (
                  <button
                    onClick={() => submitStep(idx)}
                    disabled={userSel == null}
                    style={{
                      padding: "10px 20px",
                      background: userSel == null ? "#e0e7ff" : "linear-gradient(90deg,#8b5cf6,#a78bfa)",
                      color: userSel == null ? "#a5b4fc" : "white",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: userSel == null ? "not-allowed" : "pointer",
                    }}
                  >
                    Válasz beküldése
                  </button>
                )}

                {/* Feedback after reveal */}
                {isRevealed && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isCorrect ? "#16a34a" : "#dc2626", marginBottom: 6 }}>
                      {isCorrect ? "✓ Helyes!" : "✗ Nem helyes"}
                    </div>
                    <div style={{ padding: "10px 14px", background: "#ecfeff", border: "1px solid #c4b5fd", borderRadius: 8, fontSize: 13, color: "#5b21b6", lineHeight: 1.55 }}>
                      <b>Magyarázat:</b> {step.explanation}
                    </div>
                  </div>
                )}
              </div>

              {/* New info revealed AFTER step is answered */}
              {isRevealed && step.info && (
                <div style={{
                  marginTop: 10,
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                  border: "1.5px solid #c4b5fd",
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
                    Új információ
                  </div>
                  <div style={{ fontSize: 14, color: "#4c1d95", lineHeight: 1.6 }}>
                    {step.info}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Finished — summary + actions */}
        {isFinished && (
          <div style={{
            marginTop: 16,
            padding: "16px 18px",
            background: totalCorrect === cse.steps.length ? "#dcfce7" : "#fef3c7",
            border: `2px solid ${totalCorrect === cse.steps.length ? "#16a34a" : "#ca8a04"}`,
            borderRadius: 12,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: totalCorrect === cse.steps.length ? "#166534" : "#854d0e", marginBottom: 4 }}>
              Eset vége — {totalCorrect} / {cse.steps.length} helyes
            </div>
            <div style={{ fontSize: 13, color: "#5b21b6", marginBottom: 12 }}>
              {totalCorrect === cse.steps.length
                ? "Tökéletes klinikai gondolkodás!"
                : "Görgess vissza a magyarázatokra — érdemes lehet áttekinteni."}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={reset} style={{
                padding: "10px 18px",
                background: "white",
                color: "#6d28d9",
                border: "1.5px solid #c4b5fd",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}>
                Eset újrakezdése
              </button>
              <Link href="/neuropsy/eset" style={{
                padding: "10px 18px",
                background: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
                color: "white",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}>
                Új eset választása →
              </Link>
            </div>
          </div>
        )}

        {/* Source footer */}
        {cse.source && (
          <div style={{ marginTop: 16, fontSize: 11, color: "#94a3b8", fontStyle: "italic", lineHeight: 1.4 }}>
            Forrás: {cse.source}
          </div>
        )}
      </div>
    </main>
  );
}
