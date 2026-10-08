# SetQ motion direction

Motion follows the product story: equipment moves, a signal becomes evidence, and an operator chooses a next step. The established cream, walnut, sage and fine construction lines remain consistent.

## Applied

- **Equipment inspection.** Cards fade, lift and scale into place over 680 ms after the first valid machine projection. A finite critically damped follower smooths camera and resize updates. The stem follows the card's four-pixel idle float while its endpoint stays on the machine. Hover and focus hold the float. Cards close after about ten seconds without a countdown, with a Keep open control.
- **Usage through the day.** Every card includes an hourly graph with pointer and keyboard inspection. The three strength profiles sum to their authored active-minute totals. Other equipment uses dashed planning profiles.
- **Stack movement becomes a trace.** On a machine shows the sensor fixed above the stack. The mechanism, sensor gap, graph cursor, peak and cycle count share one clock. The graph retains a bounded rolling twelve seconds. It has a local Pause control and stops offscreen or when the document is hidden.
- **Benefit icons.** The activity bars grow from their baseline, the equipment icon makes a small mechanical movement, and the checklist resolves its checkmark as each icon enters the viewport. These are finite micro animations.
- **Clear decisions.** A recognisable weight-stack machine accompanies an activity panel; connected equipment leads to a team checklist; three distinct gym facades accompany location plots. Bars grow using height/y attributes, avoiding transformed SVG baselines and label overlap.
- **A signal takes shape.** A small sage dash travels along the floor diagram's existing construction guide. It travels for 2.5 seconds, rests for 3.8 seconds and runs only while visible.
- **Evidence resolves.** Workspace bars grow once to their authored heights and sparklines draw once. Pointer or keyboard interaction immediately completes a chart reveal. Mounted dashboard and assistant views receive their own finite entry.
- **A considered orbit.** Lower invitation ellipses draw on entry and respond slightly to native scroll. Dots drift by a few SVG units. The footer wordmark moves as one coherent object.
- **A physical overview.** Only the unattended gym canvas floats by at most 2.5 px. Controls stay stationary. Pointer entry, keyboard focus or an open picker holds it; a selection settles the canvas so model and annotation projection agree.

The introducing dot and floor-zone controls have been removed. Hardware inspection uses Sensor and On a machine; there is no casing/inside mode.

## Motion control and lifecycle

The founder requested removal of OS reduced-motion behavior. The website therefore uses a saved, explicit Pause motion control. That control settles decorative effects, the card entrance/follower and the installed stack; the functional ten-second timer still closes unpinned cards. There are no prefers-reduced-motion media gates in the shipped source.

`useSiteMotion({ rootRef, paused })` owns the DOM/SVG layer. IntersectionObserver gates visible loops and finite reveals. MutationObserver registers new chart views and releases removed ones. Hidden documents stop or settle motion. Cleanup disconnects observers/listeners, kills owned timelines and ScrollTriggers, and restores original styles and attributes.

Annotation animation and hardware playback have separate owners. The card's idle movement does not invalidate WebGL; the selected gym sleeps after camera framing settles. Hardware uses demand rendering, bounded history, 30 Hz telemetry updates and DPR capped at 1.5. Fonts, models and lighting resources remain local.

## Verified

The compiled site passed browser checks for intermediate annotation entry frames, smooth placement, keyboard hourly inspection, synchronized stack/graph values, local/global/offscreen pause and mobile bounds. Five actual-clock cases passed: default closure, replacement-asset deadline, pin/unpin reset, float/leader/visibility/manual control, and a 320 px card under an OS reduced-motion preference. Idle selected-gym WebGL draws stayed at zero while its DOM card floated.

The revised diagrams and benefit icons were visually inspected at 1440, 390 and 320 px, including baseline restoration after Pause. Their labels and chart bars remain separated after animation completes.

## Further directions

- A deliberate equipment-history scrubber with period and coverage labels.
- A day/evening lighting transition tied to a chosen reporting period.
- A brief scroll story through sensor signal, floor context and team action.
- Equipment-review breadcrumbs linking evidence to a focused review.

These need intentional interactions and dependable data. Movement alone should not manufacture occupancy, queues, selected weight or member identity.
