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
      <span className="claude-credit__brand">
        Claude{" "}
        <img
          src={`${import.meta.env.BASE_URL}brand/claude-symbol.svg`}
          alt=""
          aria-hidden="true"
          width="18"
          height="18"
        />
      </span>
      <span className="claude-credit__copy">
        powered AI native gym operating system
      </span>
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
    body: "The leg press shows the highest active time in this period. Compare sustained activity across matching hours before making a capital decision.",
    note: "Active equipment time does not tell us how many members waited. Pair this evidence with your team’s observations.",
    action: "Create an equipment review",
    source: "Leg press · 7-day report",
    bars: [48, 52, 56, 59, 62, 67, 72],
  },
  {
    prompt: "Compare my locations.",
    intro: "Northside has the strongest equipment activity.",
    body: "Across your locations, Northside shows 56.2% active time, compared with 48% at Riverside and 56% at The Studio.",
    note: "Use matched opening hours and comparable equipment to make the comparison useful. Check coverage before carrying a decision across clubs.",
    action: "Prepare a location review",
    source: "Location overview · Comparable reporting periods",
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
    timer.current = setTimeout(() => {
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
    }, 550);
  };
  const item = examples[answer];
  return (
    <div className="intelligence-demo">
      <div className="assistant-nav">
        <span className="assistant-brand">
          <span className="q-glyph">Q</span> SetQ Intelligence
        </span>
        <span className="assistant-status">Operations intelligence</span>
      </div>
      <div className="assistant-credit">
        <ClaudeCredit compact />
        <span>Equipment evidence, in context</span>
      </div>
      <div className="prompt-chips" aria-label="Questions about your gym">
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
            <span /> Preparing your briefing
          </div>
        ) : (
          <>
            <span className="eyebrow">
              {custom ? "EQUIPMENT INSIGHT" : "YOUR OPERATING BRIEF"}
            </span>
            <h4>{item.intro}</h4>
            <p>{item.body}</p>
            <div className="assistant-evidence">
              <div>
                <span className="mono">
                  {answer === 2 ? "LOCATION COMPARISON" : "EQUIPMENT ACTIVITY"}
                </span>
                <span>Activity comparison</span>
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
              {followed ? "Review selected" : item.action}
            </button>
            {followed && (
              <small className="followup-feedback">
                Focus this review on the equipment evidence and your floor
                team’s observations.
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
          aria-label="Ask about your gym"
          disabled={!input.trim() || busy}
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
