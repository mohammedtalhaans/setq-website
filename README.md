# SetQ

Premium marketing site for SetQ, the AI native operating system for gyms. Built as its own repository, separate from the hardware prototype and gym-tracker software.

![SetQ brand and architectural gym](public/social-preview.png)

[Open SetQ](https://setq.com.au/) · [GitHub Pages preview](https://mohammedtalhaans.github.io/setq-website/)

**Brand/domain:** SetQ · setq.com.au
**Demo enquiries:** founder@setq.com.au

## Run

Node 24 or newer.

```powershell
npm ci
npm run dev
```

Local site: http://127.0.0.1:13073/.

```powershell
npm run build
npm run preview
```

Build output is `dist/`, suitable for any static host. Fonts, models, illustrations and runtime assets are served locally; no CDN, tracking scripts, live gym service or API keys are required.

## Experience

- Original architectural gym scene: merged equipment geometry, warm materials, finite weight-stack motion and an original distance/smoothstep signal shader. Click any of its twelve equipment items for a smoothly anchored data card with an hourly usage graph; the camera frames the selected machine beneath its annotation.
- Interactive workspace: machine selection, equipment rankings and location comparisons.
- Assistant preview: prepared answers, evidence charts, source labels and local example follow-ups.
- Original SVG illustrations with GSAP motion. Clear machine, operations checklist and location figures explain the three decision areas; benefit icons animate on scroll.
- CAD-derived sensor assembly with 36 × 29 × 11 mm enclosure dimensions and an installed-machine view. A continuous weight-stack animation and rolling graph share the same clock, with stack travel, sensor distance, peak travel and cycle readings.
- Branded enquiry dialog: prepares an email to the founder. It does **not** submit to a nonexistent backend or claim an email was sent. Visitors send from their own mail application.
- Mobile navigation, native focus-trapping dialogs, keyboard controls, a saved manual motion control and WebGL fallbacks.

Machine annotations include activity, coverage, trends and peak periods for the three weight-stack machines, and useful inventory/review records for the other equipment. Hourly strength profiles sum to the existing daily totals; other equipment has dashed planning profiles. `Inspect equipment` provides keyboard access; Escape, the close button or the scene background returns to the overview. The hourly graph also supports pointer and arrow-key inspection.

Cards fade, lift and scale into place, then follow the machine projection with a finite damped transition. They gently float and close about ten seconds after appearing, without a visible countdown. `Keep open` pins a card; allowing auto-close starts a fresh ten seconds. Automatic dismissal stays functional when decorative motion is paused. A saved `Pause motion` preference settles the experience. The website deliberately uses that explicit control rather than the OS motion preference, as requested by the founder.

Visible-only motion adds a travelling diagram signal, authored chart reveals, benefit-icon micro animations, a subtle gym-render float, and an orbital demo invitation. Controls remain steady. The installed sensor animation collects a bounded rolling twelve-second history; its mechanism, distance and graph remain synchronized. See `docs/motion-ideas.md` for applied touches and future concepts.

## Product scope

The public site presents an early-access product, with Australian availability and installation demand supplied by the founder. Dashboard figures, locations, assistant responses and follow-ups are authored demonstration content; there is no live model or equipment API. The website omits repeated example labels at the founder's request. The installation animation shows nominal enclosure dimensions and a 550 mm rest gap with 0–300 mm stack travel. These are visual design values, not a claim of validated sensor performance. Equipment movement is not occupancy, queue length, member identity or selected weight. There are no fabricated customer names, testimonials, measured returns or integrations.

See `.agents/product-marketing.md`, `docs/research-positioning.md` and `docs/copy.md` for the claim boundaries and source-backed positioning.

## Verification

```powershell
npx playwright install chromium
npm run test:browser
```

Start the preview first. Set `SETQ_QA_URL` to run against a published site. QA covers actual WebGL views, workspace controls, ranking order, assistant state, FAQ, enquiry fields/Escape, privacy dialog, mobile navigation and responsive overflow. Axe checks the page and enquiry dialog. Results are written to ignored `output/`.

`node scripts/capture.mjs` captures desktop/mobile previews from the local site. `docs/verification.md` records final validation.

`node scripts/qa-motion.mjs` verifies real ten-second timing, pin/reset behaviour, bubble/connector motion, pause/resume, saved preference, mobile bounds and idle WebGL work. `node scripts/qa-redesign.mjs` verifies annotation entry frames and hourly keyboard inspection, dimension labels, synchronized stack/graph readings, rolling history and local/global/offscreen pause.

## Hosting and setq.com.au

Production is hosted on Cloudflare Pages at **https://setq.com.au/**. The `setq-website` project builds this repository's `main` branch automatically with `npm run build`, output directory `dist`, `NODE_VERSION=24` and `SETQ_PUBLIC_URL=https://setq.com.au/`. Its provider preview is https://setq-website.pages.dev/.

The domain remains registered at Namecheap; Cloudflare manages DNS. Both apex and `www` point to the Pages project with HTTPS enabled. An active 301 rule redirects `www` to the apex and preserves paths and query strings. GitHub Pages remains a separate preview, published by the existing workflow.

Lark Mail hosts `mohammedansari@setq.com.au` as the primary mailbox and `founder@setq.com.au` as a shared role inbox accessible to the same owner through Other Accounts. MX, SPF and 2048-bit DKIM are configured. DMARC starts in monitoring mode (`p=none`). Delivery between these two inboxes was verified in both directions; this is not an external deliverability test.

## Research and provenance

- `docs/design-direction.md`: direction chosen before implementation.
- `docs/research-3d.md`: actual reference imagery, material decisions and scene performance.
- `docs/research-motion.md`: Recent, CollectUI, X resource library, Hairline, motion resources and logo provenance.
- `docs/research-positioning.md`: gym-operator needs and precise claims.
- `docs/brand.md`: SetQ mark, palette, voice and usage.
- `docs/assets.md`: exact model source, geometry-preserving optimization and brand attribution.
- `THIRD_PARTY_NOTICES.md`: third-party software/fonts and trademark identification.

All SetQ illustrations and gym geometry are original. Research references inform composition and interaction; their artworks and websites were not copied. Claude's authentic symbol identifies the model technology and does not imply a partnership or endorsement. The requested product line reads "Claude [symbol] powered AI native gym operating system". Implementation and data provenance are recorded here and in the project documents.
