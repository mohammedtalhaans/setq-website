import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/site-motion.css";

gsap.registerPlugin(ScrollTrigger);

/** Decorative DOM/SVG motion only. Equipment values, camera and outer reveals stay untouched. */
export function useSiteMotion({
  rootRef,
  reducedMotion = false,
  paused = false,
}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.siteMotionEngine =
      paused || reducedMotion ? "settled" : "running";
    root.dataset.siteMotionActive = "0";
    if (paused || reducedMotion) return;

    const records = new Map();
    const seen = new WeakSet();
    let disposed = false;
    let queued = false;

    const updateCount = () => {
      root.dataset.siteMotionActive = String(
        [...records.values()].filter((record) => record.running && record.loop)
          .length,
      );
    };
    const sync = (record) => {
      const allowed = record.visible && !document.hidden;
      const held = allowed && Boolean(record.hold?.());
      const running = allowed && !held;
      if (allowed && record.resetWhenHeld?.()) record.loop?.pause(0);
      if (record.running === running && record.held === held) return;
      record.running = running;
      record.held = held;
      record.owner.dataset.siteMotionState = running
        ? "running"
        : held
          ? "held"
          : "settled";
      if (record.loop) {
        if (running) record.loop.play();
        else if (held)
          record.loop.pause(); // Never move a clickable canvas under the pointer.
        else record.loop.pause(0);
      }
      if (record.once) {
        if (running && !record.played) {
          record.played = true;
          record.once.restart();
        } else if (!running && record.played) record.once.progress(1).pause();
      }
      if (record.scroll) {
        if (running) {
          record.scroll.enable(false, true);
          record.scroll.update();
        } else {
          record.scroll.disable(false, false);
          record.scrollTween.progress(0.5).pause();
        }
      }
      updateCount();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const record = records.get(entry.target);
          if (!record) continue;
          record.visible = entry.isIntersecting;
          sync(record);
        }
      },
      { threshold: 0.12 },
    );

    const register = (owner, build) => {
      if (!owner || seen.has(owner)) return;
      seen.add(owner);
      let controls;
      const localContext = gsap.context(() => {
        controls = build();
      }, owner);
      const record = {
        owner,
        localContext,
        visible: false,
        running: false,
        held: false,
        played: false,
        ...controls,
      };
      records.set(owner, record);
      owner.dataset.siteMotionState = "settled";
      record.scroll?.disable(false, false);
      record.scrollTween?.progress(0.5).pause();
      observer.observe(owner);
      return record;
    };
    const completeForInteraction = (owner, record) => {
      const complete = () => {
        record.played = true;
        record.once?.progress(1).pause();
      };
      owner.addEventListener("focusin", complete);
      owner.addEventListener("pointerenter", complete);
      record.removeListeners = () => {
        owner.removeEventListener("focusin", complete);
        owner.removeEventListener("pointerenter", complete);
      };
    };

    const scan = () => {
      if (disposed) return;
      // Released chart/assistant views must release their animation and observer too.
      for (const [owner, record] of records) {
        if (
          root.contains(owner) &&
          (!record.target || owner.contains(record.target))
        )
          continue;
        observer.unobserve(owner);
        record.localContext.revert();
        record.removeListeners?.();
        record.dispose?.();
        delete owner.dataset.siteMotionState;
        records.delete(owner);
        seen.delete(owner);
      }
      for (const chart of root.querySelectorAll(".bar-chart, .evidence-bars")) {
        const bars = [...chart.children].filter((node) =>
          chart.classList.contains("bar-chart")
            ? node.tagName === "BUTTON"
            : node.tagName === "DIV",
        );
        if (!bars.length || seen.has(chart)) continue;
        const record = register(chart, () => ({
          once: gsap.fromTo(
            bars,
            { scaleY: 0.05 },
            {
              scaleY: 1,
              transformOrigin: "50% 100%",
              duration: 0.7,
              stagger: 0.022,
              ease: "power3.out",
              paused: true,
              immediateRender: false,
            },
          ),
        }));
        completeForInteraction(chart, record);
      }
      for (const svg of root.querySelectorAll(".sparkline")) {
        const path = svg.querySelector("path");
        if (!path || seen.has(svg)) continue;
        const length = path.getTotalLength();
        register(svg, () => ({
          once: gsap.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.15,
              ease: "power2.inOut",
              paused: true,
              immediateRender: false,
            },
          ),
        }));
      }
      for (const diagram of root.querySelectorAll(".setq-layer-diagram")) {
        const guide = diagram.querySelector("[data-site-motion-guide]");
        if (!guide || seen.has(diagram)) continue;
        register(diagram, () => {
          const pulse = guide.cloneNode(false);
          pulse.removeAttribute("data-site-motion-guide");
          pulse.setAttribute("class", "setq-site-signal");
          pulse.setAttribute("aria-hidden", "true");
          const length = guide.getTotalLength();
          pulse.style.strokeDasharray = `14 ${length + 16}`;
          pulse.style.strokeDashoffset = "14";
          pulse.style.opacity = "0";
          guide.after(pulse);
          const loop = gsap.timeline({
            paused: true,
            repeat: -1,
            repeatDelay: 3.8,
          });
          loop
            .set(pulse, { strokeDashoffset: 14, opacity: 0 })
            .to(pulse, { opacity: 0.78, duration: 0.3 }, 0)
            .to(
              pulse,
              {
                strokeDashoffset: -length,
                duration: 2.5,
                ease: "power1.inOut",
              },
              0.05,
            )
            .to(pulse, { opacity: 0, duration: 0.45 }, 2.2);
          return { loop, dispose: () => pulse.remove() };
        });
      }
      for (const owner of root.querySelectorAll(
        ".hero-topline, .hardware-status",
      )) {
        const dot = owner.querySelector("i");
        if (dot)
          register(owner, () => ({
            loop: gsap.fromTo(
              dot,
              { opacity: 0.58, scale: 0.92 },
              {
                opacity: 1,
                scale: 1.1,
                duration: 2.5,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                paused: true,
                immediateRender: false,
              },
            ),
          }));
      }
      for (const orbit of root.querySelectorAll(".closing-orbit")) {
        const ellipses = [...orbit.querySelectorAll("ellipse")];
        const dots = [...orbit.querySelectorAll("circle")];
        const section = orbit.closest(".closing-section");
        if (!ellipses.length || !section || seen.has(orbit)) continue;
        register(orbit, () => {
          const once = gsap.timeline({ paused: true });
          ellipses.forEach((ellipse, index) => {
            const length = ellipse.getTotalLength();
            once.fromTo(
              ellipse,
              { strokeDasharray: length, strokeDashoffset: length },
              {
                strokeDashoffset: 0,
                duration: 1.8,
                ease: "power2.inOut",
                immediateRender: false,
              },
              index * 0.18,
            );
          });
          const loop = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
          dots.forEach((dot, index) =>
            loop.to(
              dot,
              {
                attr: {
                  cx: +dot.getAttribute("cx") + (index ? -4 : 4),
                  cy: +dot.getAttribute("cy") + (index ? 2 : -2),
                },
                duration: 4.8,
                ease: "sine.inOut",
              },
              0,
            ),
          );
          const scrollTween = gsap.fromTo(
            ellipses,
            { attr: { cy: 204 } },
            {
              attr: { cy: 216 },
              duration: 1,
              ease: "none",
              paused: true,
              immediateRender: false,
            },
          );
          const scroll = ScrollTrigger.create({
            trigger: section,
            animation: scrollTween,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          });
          return { once, loop, scroll, scrollTween };
        });
      }
      for (const mark of root.querySelectorAll(".footer-top .setq-wordmark")) {
        register(mark, () => ({
          loop: gsap.to(mark, {
            y: -1.8,
            duration: 4.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
          }),
        }));
      }
      // Only the rendered canvas floats. Labels, card and native controls remain stationary.
      for (const frame of root.querySelectorAll(".hero-scene-frame")) {
        if (seen.has(frame)) continue;
        const canvas = frame.querySelector(".gym-scene canvas");
        if (!canvas) continue;
        let pointerInside = frame.matches(":hover");
        const record = register(frame, () => ({
          target: canvas,
          loop: gsap.to(canvas, {
            y: -2.5,
            duration: 3.7,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
          }),
          hold: () =>
            pointerInside ||
            frame.dataset.machineSelected === "true" ||
            Boolean(frame.querySelector("details[open]")) ||
            frame.contains(document.activeElement),
          resetWhenHeld: () => frame.dataset.machineSelected === "true",
        }));
        const enter = () => {
          pointerInside = true;
          sync(record);
        };
        const leave = () => {
          pointerInside = false;
          sync(record);
        };
        const focus = () =>
          queueMicrotask(() => {
            if (!disposed) sync(record);
          });
        frame.addEventListener("pointerenter", enter);
        frame.addEventListener("pointerleave", leave);
        frame.addEventListener("focusin", focus);
        frame.addEventListener("focusout", focus);
        record.removeListeners = () => {
          frame.removeEventListener("pointerenter", enter);
          frame.removeEventListener("pointerleave", leave);
          frame.removeEventListener("focusin", focus);
          frame.removeEventListener("focusout", focus);
        };
      }
      updateCount();
    };
    const mutation = new MutationObserver(() => {
      for (const record of records.values()) if (record.hold) sync(record);
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        scan();
      });
    });
    mutation.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-machine-selected", "open"],
    });
    const visibility = () => {
      for (const record of records.values()) sync(record);
    };
    document.addEventListener("visibilitychange", visibility);
    scan();

    return () => {
      disposed = true;
      mutation.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      for (const record of records.values()) {
        record.localContext.revert();
        record.removeListeners?.();
        record.dispose?.();
        delete record.owner.dataset.siteMotionState;
      }
      records.clear();
      root.dataset.siteMotionEngine = "settled";
      root.dataset.siteMotionActive = "0";
    };
  }, [rootRef, reducedMotion, paused]);
}

export default useSiteMotion;
