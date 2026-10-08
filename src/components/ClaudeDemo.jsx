import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Plus,
  FileText,
  Sparkles,
} from "lucide-react";

export function ClaudeCredit({ dark = false, compact = false }) {
  return (
    <span
      className={`claude-credit ${dark ? "dark" : ""} ${compact ? "compact" : ""}`}
    >
      <span>{compact ? "Claude models" : "Designed around Claude models"}</span>
      <img
        src={`${import.meta.env.BASE_URL}brand/anthropic.svg`}
        alt="Anthropic"
        width="85"
        height="16"
      />
    </span>
  );
}

const examples = [
  {
    prompt: "What needs my attention?",
    intro: "Here’s where I’d start this week.",
    body: "Leg press activity is up across the evening window. Before you expand that area, check the same hours over the next two weeks.",
    note: "Leg extension activity is lower than the other strength machines. A floor-position review could be more useful than an immediate replacement.",
    action: "Review the strength floor",
    source: "Equipment activity · Comparable observed hours",
    bars: [44, 59, 52, 66, 61, 78, 72],
  },
  {
    prompt: "Should I add another leg press?",
    intro: "The signal is worth watching. The purchase can wait.",
    body: "The leg press shows the highest active time in this sample. Compare sustained activity across matching hours before making a capital decision.",
    note: "Active equipment time does not tell us how many members waited. Pair this evidence with your team’s observations.",
    action: "Create an equipment review",
    source: "Leg press · Sample 7-day report",
    bars: [48, 52, 56, 59, 62, 67, 72],
  },
  {
    prompt: "Compare my locations.",
    intro: "Northside has the strongest equipment activity.",
    body: "Across this example, Northside shows 56.2% active time, compared with 48% at Riverside and 56% at The Studio.",
    note: "Use matched opening hours and comparable equipment to make the comparison useful. Check coverage before carrying a decision across clubs.",
    action: "Prepare a location review",
    source: "Location overview · Illustrative comparable periods",
    bars: [56.2, 48, 56],
  },
];
export default function ClaudeDemo() {
  const [answer, setAnswer] = useState(0),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [followed, setFollowed] = useState(false),
    [custom, setCustom] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const ask = (text, i) => {
    clearTimeout(timer.current);
    setBusy(true);
    setFollowed(false);
    setInput("");
    setCustom(i === undefined);
    timer.current = setTimeout(
      () => {
        setAnswer(
          i === undefined
            ? /leg|buy|purchase|machine/i.test(text)
              ? 1
              : /location|club|compare/i.test(text)
                ? 2
                : 0
            : i,
        );
        setBusy(false);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550,
    );
  };
  const item = examples[answer];
  return (
    <div className="intelligence-demo">
      <div className="assistant-nav">
        <span className="assistant-brand">
          <span className="q-glyph">Q</span> SetQ Intelligence
        </span>
        <span className="assistant-status">Product preview</span>
      </div>
      <div className="assistant-credit">
        <ClaudeCredit compact />
        <span>Integration in development</span>
      </div>
      <div className="prompt-chips" aria-label="Example questions">
        {examples.map((x, i) => (
          <button
            key={x.prompt}
            aria-pressed={answer === i && !busy}
            onClick={() => ask(x.prompt, i)}
          >
            {x.prompt}
            <ArrowUpRight size={13} />
          </button>
        ))}
      </div>
      <div
        className={`assistant-answer ${busy ? "thinking" : ""}`}
        aria-live="polite"
        aria-busy={busy}
      >
        {busy ? (
          <div className="thinking-label">
            <span />
            <span />
            <span /> Preparing a sample briefing
          </div>
        ) : (
          <>
            <span className="eyebrow">
              {custom ? "RELATED SAMPLE ANSWER" : "ILLUSTRATIVE BRIEFING"}
            </span>
            <h4>{item.intro}</h4>
            <p>{item.body}</p>
            <div className="assistant-evidence">
              <div>
                <span className="mono">
                  {answer === 2 ? "LOCATION COMPARISON" : "EQUIPMENT ACTIVITY"}
                </span>
                <span>Illustrative comparison</span>
              </div>
              <div className="evidence-bars">
                {item.bars.map((n, i) => (
                  <div key={i} style={{ height: `${n}%` }}>
                    <i />
                  </div>
                ))}
              </div>
              <div className="evidence-axis mono">
                {answer === 2 ? (
                  <>
                    <span>NORTHSIDE</span>
                    <span>RIVERSIDE</span>
                    <span>THE STUDIO</span>
                  </>
                ) : (
                  <>
                    <span>MON</span>
                    <span>SUN</span>
                  </>
                )}
              </div>
            </div>
            <p className="assistant-note">{item.note}</p>
            <span className="answer-source">
              <FileText size={13} />
              {item.source}
            </span>
            <button
              className={`followup-button ${followed ? "followed" : ""}`}
              onClick={() => setFollowed((v) => !v)}
            >
              {followed ? <Check size={14} /> : <Plus size={14} />}{" "}
              {followed ? "Added to this preview" : item.action}
            </button>
            {followed && (
              <small className="followup-feedback">
                Example follow-up added locally. No live task was created.
              </small>
            )}
          </>
        )}
      </div>
      <form
        className="assistant-input"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) ask(input.trim());
        }}
      >
        <label className="sr-only" htmlFor="sample-question">
          Try a question about your gym
        </label>
        <input
          id="sample-question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try a question about your gym…"
          maxLength={300}
        />
        <button
          aria-label="Show a related sample answer"
          disabled={!input.trim() || busy}
        >
          <ArrowUp size={18} />
        </button>
      </form>
      <p className="assistant-disclaimer">
        Interactive example with sample data and prepared answers.
      </p>
    </div>
  );
}
