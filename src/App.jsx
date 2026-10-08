import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Plus,
  Minus,
  Check,
  X,
  Menu,
  ArrowDown,
  Radio,
  ShieldCheck,
  Cable,
  Layers,
  MoveUpRight,
} from "lucide-react";
import DemoDashboard from "./components/DemoDashboard.jsx";
import ClaudeDemo, { ClaudeCredit } from "./components/ClaudeDemo.jsx";
import {
  SensorFloorBrief,
  EquipmentIllustration,
  OperationsIllustration,
  PortfolioIllustration,
  SetQIcon,
} from "./components/Illustrations.jsx";
const GymScene = lazy(() => import("./components/GymScene.jsx"));
const HardwareScene = lazy(() => import("./components/HardwareScene.jsx"));
gsap.registerPlugin(ScrollTrigger);

function Logo({ className = "" }) {
  return (
    <span className={`setq-wordmark ${className}`} role="img" aria-label="SetQ">
      <span aria-hidden="true">Set</span>
      <svg viewBox="0 0 47 48" aria-hidden="true">
        <path
          d="M22.5 4C11.7 4 3 12.7 3 23.5S11.7 43 22.5 43c3.7 0 7.1-1 10-2.8l8 7.8 6.5-6.6-7.9-7.8a19.4 19.4 0 0 0 2.9-10.1C42 12.7 33.3 4 22.5 4Zm0 9a10.5 10.5 0 1 1 0 21 10.5 10.5 0 0 1 0-21Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof matchMedia === "function"
      ? matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const cb = () => setReduced(m.matches);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  }, []);
  return reduced;
}

class SceneBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="scene-placeholder">
        <SetQIcon name="portfolio" size={60} />
        <p>A clearer view of your floor.</p>
        <small>The interactive 3D view is unavailable on this device.</small>
      </div>
    ) : (
      this.props.children
    );
  }
}

function ContactDialog({ dialogRef }) {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [gym, setGym] = useState(""),
    [sites, setSites] = useState("1 location"),
    [goal, setGoal] = useState("Understand equipment activity");
  const buildDraft = () =>
    `Hello SetQ,\n\nI'd like to book a demo or discuss an early-access pilot.\n\nName: ${name}\nEmail: ${email}\nGym: ${gym}\nLocations: ${sites}\nI'd like to: ${goal}\n\nPlease get in touch.\n`;
  const [prepared, setPrepared] = useState(false);
  const send = (e) => {
    e.preventDefault();
    window.location.href = `mailto:founder@setq.com.au?subject=${encodeURIComponent("SetQ demo request — " + gym)}&body=${encodeURIComponent(buildDraft())}`;
    setPrepared(true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildDraft());
      setPrepared(true);
    } catch {
      const url = URL.createObjectURL(
        new Blob([buildDraft()], { type: "text/plain" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "setq-demo-request.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
  return (
    <dialog
      ref={dialogRef}
      className="contact-dialog"
      aria-labelledby="contact-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current.close();
      }}
    >
      <div className="dialog-content">
        <button
          className="dialog-close"
          onClick={() => dialogRef.current.close()}
          aria-label="Close demo enquiry"
        >
          <X size={22} />
        </button>
        <Logo />
        <span className="eyebrow">LET’S TALK ABOUT YOUR FLOOR</span>
        <h2 id="contact-title">
          A better next step.
          <br />
          <em>Starts with a conversation.</em>
        </h2>
        <p>
          Tell us a little about your gym. We’ll explore where SetQ could fit
          and what an early pilot could look like.
        </p>
        <form onSubmit={send}>
          <div className="form-row">
            <label>
              Your name
              <input
                autoComplete="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
              />
            </label>
            <label>
              Work email
              <input
                autoComplete="email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@yourgym.com"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Gym name
              <input
                autoComplete="organization"
                name="gym"
                required
                value={gym}
                onChange={(e) => setGym(e.target.value)}
                placeholder="Your gym"
              />
            </label>
            <label>
              Number of locations
              <select value={sites} onChange={(e) => setSites(e.target.value)}>
                <option>1 location</option>
                <option>2–5 locations</option>
                <option>6+ locations</option>
                <option>Planning a new gym</option>
              </select>
            </label>
          </div>
          <label>
            What would you like to explore?
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option>Understand equipment activity</option>
              <option>Plan equipment investment</option>
              <option>Compare multiple locations</option>
              <option>Explore the AI operating system</option>
              <option>Become an early-access partner</option>
            </select>
          </label>
          <button className="button primary full" type="submit">
            Prepare my demo enquiry <ArrowUpRight size={18} />
          </button>
          <p className="form-note">
            Opens an email draft to{" "}
            <a href="mailto:founder@setq.com.au">founder@setq.com.au</a>. Your
            details stay in your browser until you send.
          </p>
          {prepared && (
            <div className="form-feedback" role="status">
              <Check size={16} />
              <span>
                Your enquiry is ready. Send it from your email app, or{" "}
                <button type="button" onClick={copy}>
                  copy the request
                </button>
                .
              </span>
            </div>
          )}
        </form>
      </div>
    </dialog>
  );
}

function PrivacyDialog({ dialogRef }) {
  return (
    <dialog
      ref={dialogRef}
      className="privacy-dialog"
      aria-labelledby="privacy-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current.close();
      }}
    >
      <div className="dialog-content">
        <button
          className="dialog-close"
          onClick={() => dialogRef.current.close()}
          aria-label="Close privacy information"
        >
          <X size={22} />
        </button>
        <span className="eyebrow">SETQ · WEBSITE PRIVACY</span>
        <h2 id="privacy-title">
          A considered approach
          <br />
          <em>to your information.</em>
        </h2>
        <p>
          This product preview does not use tracking cookies, third-party
          analytics, or a connected gym feed. Example equipment data and
          assistant responses are illustrative.
        </p>
        <p>
          The enquiry form prepares an email in your own email app. The site
          does not upload or store the details you type. If you send your
          enquiry, SetQ will use the information to respond and discuss your
          gym’s needs.
        </p>
        <p>
          The proposed equipment sensor focuses on stack movement and does not
          identify members. Data handling for a future pilot will be agreed
          before installation.
        </p>
        <a className="text-link" href="mailto:founder@setq.com.au">
          Questions? founder@setq.com.au <ArrowUpRight size={15} />
        </a>
      </div>
    </dialog>
  );
}

const faqs = [
  [
    "Who is SetQ for?",
    "Gym owners, operators, and teams who want a clearer view of their equipment and a better basis for everyday and investment decisions. From a single club to a growing group.",
  ],
  [
    "Will it work with the equipment we already have?",
    "The retrofit design starts with compatible weight-stack equipment. We’ll review your machines, mounting options, and site before recommending an early pilot.",
  ],
  [
    "Does it use cameras or identify members?",
    "The proposed sensor observes equipment movement. It uses no camera or audio recording and does not identify members. It does not measure occupancy, queues, or the weight someone has selected.",
  ],
  [
    "Does SetQ replace our membership software?",
    "SetQ’s initial focus is equipment intelligence, floor operations, and planning. It is designed to sit alongside the tools you already use. Billing and access control are outside the current preview.",
  ],
  [
    "Can we use the platform today?",
    "SetQ is in development and we’re opening conversations about early access. This site shows the intended product experience with sample data. The Claude model integration is also in development; the assistant here uses prepared example answers.",
  ],
  [
    "How is pricing structured?",
    "Pilot scope and pricing will depend on your floor, compatible equipment, and operating needs. Book a demo and we’ll work through those details together.",
  ],
];

function Accordion() {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-list">
      {faqs.map(([q, a], i) => (
        <div className={`faq-item ${open === i ? "open" : ""}`} key={q}>
          <h3>
            <button
              aria-expanded={open === i}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {q}
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </button>
          </h3>
          <div id={`faq-${i}`} hidden={open !== i}>
            <p>
              {a}
              {i === 4 && <ClaudeCredit compact />}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Hardware({ reducedMotion }) {
  const ref = useRef(),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setReady(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="hardware-display">
      <div className="hardware-stage">
        <SceneBoundary>
          {ready ? (
            <Suspense
              fallback={
                <div className="scene-placeholder">
                  <SetQIcon name="sensor" size={60} />
                  <small>Preparing the hardware view</small>
                </div>
              }
            >
              <HardwareScene reducedMotion={reducedMotion} />
            </Suspense>
          ) : (
            <div className="scene-placeholder">
              <SetQIcon name="sensor" size={60} />
            </div>
          )}
        </SceneBoundary>
      </div>
      <div className="hardware-bottomline">
        <span className="mono">SMALL FOOTPRINT. BIGGER PICTURE.</span>
        <a
          href="https://mohammedtalhaans.github.io/setq-hardware/"
          target="_blank"
          rel="noreferrer"
        >
          Explore the full 3D study <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const pageRef = useRef(),
    contactRef = useRef(),
    privacyRef = useRef();
  const reducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false),
    [activeZone, setActiveZone] = useState("strength"),
    [selectedMachine, setSelectedMachine] = useState(null);
  const openContact = () => {
    setMenuOpen(false);
    contactRef.current.showModal();
  };
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .fromTo(
            ".hero-copy > *",
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.085 },
            0.1,
          )
          .fromTo(
            ".hero-scene-frame",
            { opacity: 0 },
            { opacity: 1, duration: 1.2 },
            0.3,
          )
          .fromTo(
            ".hero-footnote",
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.8 },
            0.8,
          );
        gsap.utils.toArray("[data-reveal]").forEach((el) =>
          gsap.fromTo(
            el,
            { y: 24, opacity: 0.15 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            },
          ),
        );
        gsap.utils.toArray("[data-draw]").forEach((el) => {
          const length = el.getTotalLength();
          gsap.fromTo(
            el,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.8,
              ease: "power2.inOut",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            },
          );
        });
      },
      pageRef,
    );
    return () => mm.revert();
  }, []);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const zones = {
    strength: {
      label: "Strength floor",
      caption: "A little signal. A clearer decision.",
      metric: "Equipment → insight",
    },
    cardio: {
      label: "Cardio zone",
      caption: "One considered view of your space.",
      metric: "An illustrative gym",
    },
    recovery: {
      label: "Open floor",
      caption: "Plan the space around the equipment.",
      metric: "A view of the whole floor",
    },
  };
  return (
    <div ref={pageRef} className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#" className="brand-link" aria-label="SetQ home">
          <Logo />
        </a>
        <nav className={menuOpen ? "open" : ""} aria-label="Main navigation">
          <a href="#platform" onClick={() => setMenuOpen(false)}>
            Platform
          </a>
          <a href="#intelligence" onClick={() => setMenuOpen(false)}>
            Intelligence
          </a>
          <a href="#hardware" onClick={() => setMenuOpen(false)}>
            Hardware
          </a>
          <a href="#approach" onClick={() => setMenuOpen(false)}>
            Our approach
          </a>
        </nav>
        <div className="header-actions">
          <button className="button header-demo" onClick={openContact}>
            Book a demo <ArrowUpRight size={15} />
          </button>
          <button
            className="menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero section-wide" aria-labelledby="hero-title">
          <div className="hero-topline">
            <span>
              <i /> INTRODUCING SETQ
            </span>
            <span>EARLY ACCESS · BUILT FOR GYM OPERATORS</span>
          </div>
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow hero-category">
                THE AI NATIVE OPERATING SYSTEM FOR GYMS
              </span>
              <h1 id="hero-title">
                Your gym,
                <br />
                <em>one step ahead.</em>
              </h1>
              <p>
                Turn equipment activity into clearer decisions, smarter spaces,
                and a more connected operation.
              </p>
              <div className="hero-buttons">
                <button className="button primary" onClick={openContact}>
                  Book a demo <ArrowUpRight size={17} />
                </button>
                <a className="button text-button" href="#platform">
                  Explore SetQ <ArrowDown size={16} />
                </a>
              </div>
              <ClaudeCredit />
              <span className="hero-small">
                Built for the floor you have.
                <br />
                Designed for the gym you’re building.
              </span>
            </div>
            <div
              className="hero-scene-frame"
              data-machine-selected={selectedMachine ? "true" : "false"}
            >
              <div className="scene-toplabel">
                <span className="mono">A FEEL FOR YOUR FLOOR.</span>
                <span className="compass" aria-hidden="true">
                  N <MoveUpRight size={14} />
                </span>
              </div>
              <SceneBoundary>
                <Suspense
                  fallback={
                    <div className="scene-placeholder">
                      <SetQIcon name="portfolio" size={60} />
                      <span>A feel for your floor.</span>
                    </div>
                  }
                >
                  <GymScene
                    activeZone={activeZone}
                    onZoneChange={setActiveZone}
                    onMachineSelectionChange={setSelectedMachine}
                    reducedMotion={reducedMotion}
                  />
                </Suspense>
              </SceneBoundary>
              <div className="scene-floating-label" hidden={!!selectedMachine}>
                <span className="signal-icon">
                  <Radio size={15} />
                </span>
                <div>
                  <span className="mono">{zones[activeZone].metric}</span>
                  <span>{zones[activeZone].caption}</span>
                </div>
              </div>
              <div className="scene-bottom">
                <div
                  className="zone-select"
                  aria-label="Explore the illustrative gym"
                >
                  {Object.entries(zones).map(([id, zone]) => (
                    <button
                      key={id}
                      aria-pressed={activeZone === id}
                      onClick={() => setActiveZone(id)}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
                <span className="scene-caption">
                  Illustrative gym · Click equipment to inspect
                </span>
              </div>
            </div>
          </div>
          <div className="hero-footnote">
            <span>
              <span className="line-cross" /> FLOOR INTELLIGENCE, MEET BUSINESS
              INSTINCT.
            </span>
            <a href="#platform">
              Step inside <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <section className="perspective section-pad" id="approach">
          <div className="perspective-heading" data-reveal>
            <span className="eyebrow">BEYOND THE CHECK-IN</span>
            <h2>
              You know who comes through the door.
              <br />
              <em>Now understand what happens next.</em>
            </h2>
          </div>
          <div className="perspective-columns">
            <div data-reveal>
              <SetQIcon name="portfolio" size={42} />
              <h3>See the patterns.</h3>
              <p>
                Understand which equipment works hardest, and how activity
                changes through the day.
              </p>
            </div>
            <div data-reveal>
              <SetQIcon name="equipment" size={42} />
              <h3>Make room for better.</h3>
              <p>
                Bring real floor context to your next equipment purchase,
                reposition, or expansion.
              </p>
            </div>
            <div data-reveal>
              <SetQIcon name="brief" size={42} />
              <h3>Give your team clarity.</h3>
              <p>
                Turn observations into focused reviews and a clearer plan for
                the week ahead.
              </p>
            </div>
          </div>
        </section>
        <section className="platform-section section-pad" id="platform">
          <div className="section-heading" data-reveal>
            <div>
              <span className="eyebrow">YOUR FLOOR. YOUR DECISIONS.</span>
              <h2>
                More than a dashboard.
                <br />
                <em>A better operating picture.</em>
              </h2>
            </div>
            <p>
              From one machine to your next location, bring the details that
              matter into one considered workspace.
            </p>
          </div>
          <div data-reveal>
            <DemoDashboard />
          </div>
          <div className="workspace-caption">
            <span>
              Go ahead. Change the view, select a machine, explore the detail.
            </span>
            <span className="mono">SAMPLE DATA · DESIGNED EXPERIENCE</span>
          </div>
        </section>
        <section className="intelligence-section section-pad" id="intelligence">
          <div className="intelligence-grid">
            <div className="intelligence-copy" data-reveal>
              <span className="eyebrow">
                INTELLIGENCE WITH A SENSE OF PLACE
              </span>
              <h2>
                Less time
                <br /> finding answers.
                <br />
                <em>More time acting.</em>
              </h2>
              <p>
                Ask the question you would ask your operations team. Get the
                pattern, the context, and a useful next step.
              </p>
              <ClaudeCredit dark />
              <div className="intelligence-principles">
                <div>
                  <span className="line-cross" />
                  <h3>Grounded in your floor.</h3>
                  <p>Equipment evidence brings context to the conversation.</p>
                </div>
                <div>
                  <span className="line-cross" />
                  <h3>Built for your judgement.</h3>
                  <p>
                    Clear sources and visible assumptions. You make the call.
                  </p>
                </div>
                <div>
                  <span className="line-cross" />
                  <h3>Ready for the next question.</h3>
                  <p>From a weekly brief to a considered equipment review.</p>
                </div>
              </div>
            </div>
            <div data-reveal>
              <ClaudeDemo />
            </div>
          </div>
          <svg
            className="intelligence-flow"
            viewBox="0 0 1400 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              data-draw
              d="M-20 70C160 70 240 10 410 30S740 105 930 40 1220 50 1420 15"
              fill="none"
              stroke="#b1bda1"
              strokeWidth=".8"
            />
            <path
              d="M-20 90C230 60 210 40 430 48S830 94 970 54 1220 66 1420 30"
              fill="none"
              stroke="#9a876f"
              strokeWidth=".5"
            />
          </svg>
        </section>
        <section className="decisions-section section-pad">
          <div className="section-heading" data-reveal>
            <div>
              <span className="eyebrow">EVERY SQUARE METRE HAS POTENTIAL</span>
              <h2>
                For the decisions
                <br />
                <em>that shape your gym.</em>
              </h2>
            </div>
            <p>
              The next machine. The right floor layout. The bigger picture
              across your clubs. Give every decision a little more perspective.
            </p>
          </div>
          <div className="decision-cards">
            <article data-reveal>
              <div className="decision-visual">
                <EquipmentIllustration />
              </div>
              <span className="eyebrow">EQUIPMENT PLANNING</span>
              <h3>Invest with intent.</h3>
              <p>
                Compare sustained activity before you buy, replace, or move a
                machine. Put the evidence beside your budget and member
                feedback.
              </p>
              <a href="#platform">
                Explore equipment planning <ArrowUpRight size={15} />
              </a>
            </article>
            <article data-reveal>
              <div className="decision-visual">
                <OperationsIllustration />
              </div>
              <span className="eyebrow">EVERYDAY OPERATIONS</span>
              <h3>Find your team’s focus.</h3>
              <p>
                Keep changes, coverage gaps, and equipment reviews in view. Give
                your team a shared starting point for the next shift.
              </p>
              <a href="#intelligence">
                Explore the daily brief <ArrowUpRight size={15} />
              </a>
            </article>
            <article data-reveal>
              <div className="decision-visual">
                <PortfolioIllustration />
              </div>
              <span className="eyebrow">ONE CLUB TO MANY</span>
              <h3>Grow with perspective.</h3>
              <p>
                Compare matching equipment across locations. Carry better floor
                decisions from your first club to your next.
              </p>
              <a href="#platform">
                Explore your operating picture <ArrowUpRight size={15} />
              </a>
            </article>
          </div>
        </section>
        <section className="connected-section section-pad">
          <div className="connected-visual" data-reveal>
            <SensorFloorBrief />
          </div>
          <div className="connected-copy" data-reveal>
            <span className="eyebrow">A SMALL SIGNAL. A BIGGER PICTURE.</span>
            <h2>
              From the floor
              <br />
              <em>to the next move.</em>
            </h2>
            <p>
              SetQ connects the physical rhythm of your gym with the decisions
              you make every day.
            </p>
            <div className="connected-steps">
              <div>
                <span className="step-dot" />
                <h3>Sense the equipment.</h3>
                <p>Small sensors observe movement on compatible machines.</p>
              </div>
              <div>
                <span className="step-dot" />
                <h3>Understand the pattern.</h3>
                <p>Activity and coverage come together in your workspace.</p>
              </div>
              <div>
                <span className="step-dot" />
                <h3>Make the next move.</h3>
                <p>
                  Review the evidence. Ask a question. Choose what comes next.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="hardware-section section-pad" id="hardware">
          <div className="hardware-copy" data-reveal>
            <span className="eyebrow">HARDWARE THAT KNOWS ITS PLACE</span>
            <h2>
              Small by design.
              <br />
              <em>Thoughtful by nature.</em>
            </h2>
            <p>
              Your gym already has a floor worth understanding. Our compact
              ultrasonic sensor concept is designed to bring compatible
              equipment into view.
            </p>
            <div className="hardware-features">
              <div>
                <ShieldCheck size={20} />
                <span>
                  Equipment focused.
                  <small>No cameras. No member wearables.</small>
                </span>
              </div>
              <div>
                <Cable size={20} />
                <span>
                  A considered retrofit.
                  <small>Start with the equipment you have.</small>
                </span>
              </div>
              <div>
                <Layers size={20} />
                <span>
                  Made for a connected floor.
                  <small>Individual nodes. One operating picture.</small>
                </span>
              </div>
            </div>
            <button className="text-link" onClick={openContact}>
              Discuss your floor’s fit <ArrowUpRight size={16} />
            </button>
            <p className="hardware-caption">
              Proposed design. Installation and performance are being validated.
            </p>
          </div>
          <div data-reveal>
            <Hardware reducedMotion={reducedMotion} />
          </div>
        </section>
        <section className="faq-section section-pad">
          <div data-reveal>
            <span className="eyebrow">A FEW THINGS WORTH KNOWING</span>
            <h2>
              A clearer view.
              <br />
              <em>From the start.</em>
            </h2>
            <p>
              Still have a question?
              <br />
              We’d love to talk about your gym.
            </p>
            <a className="text-link" href="mailto:founder@setq.com.au">
              Talk to the founder <ArrowUpRight size={15} />
            </a>
          </div>
          <div data-reveal>
            <Accordion />
          </div>
        </section>
        <section className="closing-section section-pad" data-reveal>
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS ON THE FLOOR</span>
          <h2>
            A sharper operation.
            <br />
            <em>A gym that moves forward.</em>
          </h2>
          <p>Let’s see what SetQ could unlock for your gym.</p>
          <button className="button primary" onClick={openContact}>
            Book a demo <ArrowUpRight size={18} />
          </button>
          <span className="closing-note">
            Early-access conversations for gym owners and operators.
          </span>
          <svg
            className="closing-orbit"
            viewBox="0 0 900 400"
            aria-hidden="true"
          >
            <ellipse
              cx="450"
              cy="210"
              rx="410"
              ry="130"
              fill="none"
              stroke="#c7bda9"
              strokeWidth=".7"
            />
            <ellipse
              cx="450"
              cy="210"
              rx="340"
              ry="95"
              fill="none"
              stroke="#dbd2c3"
              strokeWidth=".7"
            />
            <circle cx="69" cy="260" r="5" fill="#889775" />
            <circle cx="790" cy="162" r="3" fill="#594431" />
          </svg>
        </section>
      </main>
      <footer className="site-footer section-pad">
        <div className="footer-top">
          <div>
            <Logo />
            <p>
              A feel for your floor.
              <br />A head for your business.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <span className="eyebrow">EXPLORE</span>
              <a href="#platform">Platform</a>
              <a href="#intelligence">Intelligence</a>
              <a href="#hardware">Hardware</a>
            </div>
            <div>
              <span className="eyebrow">SAY HELLO</span>
              <a href="mailto:founder@setq.com.au">
                founder@setq.com.au <ArrowUpRight size={12} />
              </a>
              <button onClick={openContact}>
                Book a demo <ArrowUpRight size={12} />
              </button>
              <span>Built for ambitious gym operators.</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SetQ</span>
          <span>EARLY ACCESS · PRODUCT PREVIEW</span>
          <button onClick={() => privacyRef.current.showModal()}>
            Privacy
          </button>
          <a href="#">
            Back to top <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
      <ContactDialog dialogRef={contactRef} />
      <PrivacyDialog dialogRef={privacyRef} />
    </div>
  );
}
