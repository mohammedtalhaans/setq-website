# Final verification

2026-10-08 · Tested the compiled production build locally before publication.

- Production build and HTML pre-render succeeded. Headlines, copy, SVGs and contact information are present in shipped HTML before JavaScript runs.
- Playwright browser pass: zero page errors, zero same-origin failed responses.
- All three gym zones, six machine selections, equipment rankings, location selection and actual CSV download verified.
- Assistant sample question selection, custom-question routing, site-specific evidence labels and local follow-up state verified. No live model request is made.
- Assembled/inside hardware states verified in actual WebGL. Original model bounds unchanged after 63% file-size reduction.
- Enquiry form fields, native modal focus/Escape, FAQ expansion, model attribution and privacy dialog verified. The email draft points to founder@setq.com.au; no test enquiry was sent.
- No horizontal overflow at 1440, 1024, 768, 390 or 320px.
- Mobile navigation and reduced-motion behaviour verified.
- Axe WCAG 2 A/AA and WCAG 2.1 AA: zero detected violations on the page or open enquiry dialog. This is an automated check, not a certification.
- Independent artifact and source audits covered SVG clipping, real entry/hover motion, logo geometry, model fit, fallback images, palette, claims, resource cleanup, offscreen rendering and model-loading failure.
- npm audit: zero reported vulnerabilities in production and complete dependency tree after removing the one-time model optimization CLI.
- No external font, HDR or tracking requests. Font assets are local. Large 3D code is split into lazy modules; hardware/model loading waits until near the viewport. Static/hidden scenes do not keep an idle render loop running.

Research, design and artifact work used the user-requested GPT-6.1 Sol agents at High effort. Their outputs were reviewed, integrated and refined rather than accepted without inspection.

Generated test evidence is in the ignored `output/` directory. Re-run `npm run test:browser` against a running local or published site using `SETQ_QA_URL`.
