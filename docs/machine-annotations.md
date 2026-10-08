# Equipment annotations

2026-10-08.

Every equipment item in the architectural scene is individually selectable: lat pulldown, dual cable station, chest press, two benches, dumbbell rack, two treadmills, stationary bike, two stretching stations and kettlebell set.

## Interaction and placement

Equipment IDs are attached to source geometry and retained as triangle intervals when geometry is merged by material. Picking therefore follows the actual rendered surfaces. The large zone collision volumes were removed; the visual geometry and its batching remain intact.

The annotation is a readable HTML surface with a subtle extruded edge, warm border and layered shadow. After its first valid projection it fades, lifts and scales into place over 680 ms. A finite critically damped follower smooths its position during camera and resize changes. A projected SVG stem and pin attach to the selected machine's actual head. The camera gently adjusts its view offset and scale to leave room for the card above the equipment. Closing returns to the overview. Projection and placement update without a React render on every frame.

Native `Inspect equipment` controls provide keyboard access. Selection announces the named asset. Keyboard selection focuses the card's close control, and Escape restores the inspector control. Clicking the same item, the background, or close dismisses the card. The former floor-zone buttons have been removed.

Camera movement is finite. The explicit Pause motion control uses the settled pose immediately. Offscreen scenes stop drawing. No page-height change occurs on selection; scenes have a fixed larger baseline so equipment remains visible beneath the annotation and its hourly graph.

The annotation's DOM surface has a slow four-pixel idle float while visible and unattended. The connector stretches with it while the machine pin stays fixed. Hover and keyboard interaction hold the float. Each card closes about ten seconds after it becomes visible, with no visible countdown; the `Keep open` pin makes dismissal controllable. Unpinning or selecting another asset starts a fresh deadline. Timeout closure preserves focus outside the card. Manual pause stops decorative motion without stopping the functional timer. The OS motion preference no longer gates the site, as requested. Camera framing remains finite and WebGL sleeps after settling.

## Data

`src/data/machines.js` stores authored examples. The three weight-stack concepts have recorded minutes, activity share, data coverage, seven-day activity, peak period and a short review insight. These match the corresponding sample workspace values.

Cardio, free weights and open-floor equipment have example footprints, review focus, last/next review and useful inspection notes. Their telemetry fields are unavailable rather than fabricated zero activity. This does not imply that the ultrasonic weight-stack design measures these other types of equipment. Footprints describe approximate illustrative geometry, not manufacturer specifications or installation clearances.

Each card now includes usage against time, with 06:00–22:00 hourly inspection. Three strength profiles sum exactly to their existing daily active-minute totals. Other assets use dashed planning profiles. Left/right arrows, Home and End inspect the graph; pointer selection gives the same readings. Repeated example disclaimers are omitted from the public page at the founder's request, while provenance remains in source and documentation.

## Verification

- Exact picking/framing math: 108 equipment/pose/size combinations.
- Browser: all twelve real canvas selections across 1440, 768, 390 and 320px.
- Final mobile visual checks: selected equipment remains visible, roughly 24px of stem clearance, no horizontal overflow or selection layout shift.
- Keyboard focus, Escape, close, background dismissal and resize projection verified.
- Annotation accessibility: twelve cases across desktop, tablet and phone, with no Axe A/AA violations detected.
- Focused, manually paused and offscreen scenes stop WebGL draws after settling.
- Existing full-site browser checks still pass.

Run `node scripts/qa-machines.mjs` and `node scripts/qa-annotation-a11y.mjs` against a running site. `SETQ_QA_URL` can select the published site. Test output and screenshots are retained in ignored `output/`.
