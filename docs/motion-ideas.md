# SetQ motion direction

The motion should feel like a considered physical operating model: signals arrive, evidence resolves, and the operator chooses a next step. It should retain the warm cream, brown, sage and fine construction lines already established. It should never suggest that authored example metrics are live or count changing values for decorative effect.

## Applied now

- **A signal takes shape.** One small sage dash travels along the diagram's existing right-hand construction guide from equipment through floor context toward the brief. It travels for 2.5 seconds, rests for 3.8 seconds, and runs only while visible. Existing solid surfaces still occlude the guide honestly; the outside guide leaves a visible journey between the planes.
- **Evidence resolves.** Existing sample chart bars grow once to their authored heights; sparklines draw once. No number changes. Pointer or keyboard interaction immediately completes a chart reveal so the usable chart is never kept behind an animation. Newly mounted dashboard/assistant views receive their own finite entry.
- **Small signals, steady operation.** The tiny introducing/status dot has a 2.5-second breathing half-cycle. It is decorative status texture, not a live telemetry claim.
- **A considered orbit.** The lower CTA's two ellipses draw on entry. Native scroll shifts their centres by only 12 SVG units across the entire section. The existing small orbit dots drift 4 units horizontally and 2 vertically over 4.8 seconds. The footer SetQ wordmark floats as one coherent object by 1.8px; letter alignment and geometry stay intact.
- **A physical overview.** Only the rendered gym canvas floats by at most 2.5px while visible and unattended; native controls, labels and annotation stay stationary. Pointer entry, keyboard focus or an open picker holds the canvas at its current position. Selecting equipment intentionally settles the canvas to zero so the focused model and its projected annotation agree. The WebGL camera and sample data are untouched. Global pause/reduced motion return the static render.

The annotation's separate cartoon float and ten-second dismissal are owned by `MachineAnnotation`, rather than coupled to this site motion hook.

## Promising future directions

- **Equipment history scrubber:** let an operator intentionally compare fixed periods, with a timeline and a visible coverage/source label. This needs a genuine interaction design and dependable data rather than an ambient loop.
- **Floor through the day:** an intentional day/evening toggle could shift studio lighting and the selected matched observation period. It should never manufacture occupancy or queues from movement data.
- **Device casing peel:** one deliberate scroll or click could separate the sensor casing, transducers and board with honest construction lines. Keep a compact assembled rest pose and explicit design-study status.
- **Layer-focused scroll story:** the operator could pause at signal, floor context and brief, with the chosen layer opening slightly. This needs a measured narrative range so the geometry stays legible; it should not hijack native scrolling.
- **Equipment review breadcrumbs:** a selected machine could connect to an authored review card through a visible source trail. The meaningful next action should lead the motion.

Magnetic CTAs are deferred because the current buttons already own hover transforms. Adding a second transform controller would create conflict for little product benefit. Headlines and outer scroll-reveal containers are intentionally left to their existing orchestrated entrance.

## Lifecycle and integration

`useSiteMotion({ rootRef, reducedMotion, paused })` is exported both named and default from `src/motion/useSiteMotion.js`; it imports its scoped stylesheet. Call it once with the existing `.site-shell` root ref. Parent owns the user-visible Pause motion button and `data-motion='running'|'paused'` state.

One IntersectionObserver gates the new loops and finite reveals. One child-list MutationObserver registers freshly mounted chart views and retires removed ones; it only watches `open` and `data-machine-selected` attributes, not animation styles. Document visibility stops/settles the records. Pause or reduced-motion prop changes disconnect observers/listeners, kill owned ScrollTriggers/timelines, remove the guide overlay and revert original styles/attributes. The hook adds no independent RAF, timer, scroll hijack, data refresh or WebGL redraw.

Diagnostic DOM attributes are visible for review: root `data-site-motion-engine` and `data-site-motion-active`; each owner `data-site-motion-state` (`running`, `held`, `settled`). These indicate decorative motion lifecycle, not equipment status.

The existing illustration entry/hover hooks and root reveal effects are separate owners. Parent should disable their motion when globally paused, e.g. pass `animate={!paused}` to illustrations or a combined reduced/paused preference to those existing owners. This hook does not overwrite their transforms.

## Verified in the integrated site

Observed the introducing dot change opacity/scale, the sage guide dash travel, and the footer drift in the actual browser. The guide reset to zero opacity offscreen; scrolling to the platform left zero new ambient loops active. Pause and OS reduced motion set the engine to settled with zero active loops and removed the pulse overlay; restoring motion recreated exactly one overlay. Nine dashboard tab replacements produced no page errors or duplicate overlays. The right-hand guide was visually inspected so the signal's path is visible between the opaque layers.

After separating render motion from layout, the canvas moved from `-0.1624px` to `-0.738px` while the frame retained `transform: none`. Native Cardio zone and Inspect equipment clicks succeeded without forcing or pre-hovering. Selecting Lat pulldown settled the canvas to an identity transform; its annotation remained aligned. No page errors were observed.

The overview render is deliberately separate from control layout. Native zone and Inspect equipment controls remain stable without forcing browser clicks or adjusting test coordinates.
