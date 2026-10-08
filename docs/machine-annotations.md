# Equipment annotations

2026-10-08.

Every equipment item in the architectural scene is individually selectable: lat pulldown, dual cable station, chest press, two benches, dumbbell rack, two treadmills, stationary bike, two stretching stations and kettlebell set.

## Interaction and placement

Equipment IDs are attached to source geometry and retained as triangle intervals when geometry is merged by material. Picking therefore follows the actual rendered surfaces. The large zone collision volumes were removed; the visual geometry and its batching remain intact.

The annotation is a readable HTML surface with a subtle extruded edge, warm border and layered shadow. A projected SVG stem and pin attach to the selected machine's actual head. The camera gently adjusts its view offset and scale to leave room for the card above the equipment. Closing returns to the overview. Resize, camera motion and content measurement update the projection without a React render on every frame.

Native `Inspect equipment` controls provide keyboard access. Selection announces the named asset. Keyboard selection focuses the card's close control, and Escape restores the inspector control. Clicking the same item, the background, or close dismisses the card. Choosing a different zone clears an incompatible selection.

Camera and mechanical movement are finite. Reduced motion uses the settled pose immediately. Offscreen scenes stop drawing. No page-height change occurs on selection; narrow screens have a fixed larger baseline scene so the equipment remains visible beneath the annotation.

Update: the annotation's DOM surface now has a slow four-pixel idle float while visible and unattended. The connector stretches with it while the machine pin stays fixed. Hover and keyboard interaction hold the float. Each card closes about ten seconds after it becomes visible; a countdown ring and `Keep open` pin make that behaviour controllable. Unpinning or selecting another asset starts a fresh deadline. Timeout closure preserves focus outside the card, and reduced motion/user pause stop decorative motion without stopping the functional timer. Camera framing remains finite and WebGL sleeps after settling.

## Data

`src/data/machines.js` stores authored examples. The three weight-stack concepts have recorded minutes, activity share, data coverage, seven-day activity, peak period and a short review insight. These match the corresponding sample workspace values.

Cardio, free weights and open-floor equipment have example footprints, review focus, last/next review and useful inspection notes. Their telemetry fields are unavailable rather than fabricated zero activity. This does not imply that the ultrasonic weight-stack design measures these other types of equipment. Footprints describe approximate illustrative geometry, not manufacturer specifications or installation clearances.

## Verification

- Exact picking/framing math: 108 equipment/pose/size combinations.
- Browser: all twelve real canvas selections across 1440, 768, 390 and 320px.
- Final mobile visual checks: selected equipment remains visible, roughly 24px of stem clearance, no horizontal overflow or selection layout shift.
- Keyboard focus, Escape, close, background dismissal, zone changes and resize projection verified.
- Annotation accessibility: twelve cases across desktop, tablet and phone, with no Axe A/AA violations detected.
- Focused, reduced-motion and offscreen scenes stop WebGL draws after settling.
- Existing full-site browser checks still pass.

Run `node scripts/qa-machines.mjs` and `node scripts/qa-annotation-a11y.mjs` against a running site. `SETQ_QA_URL` can select the published site. Test output and screenshots are retained in ignored `output/`.
