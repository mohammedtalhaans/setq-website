# SetQ website copy

Version 1 · 2026-10-08. Final UI may tighten these lines while preserving claim boundaries in research-positioning.md.

## Navigation and brand

**Brand:** SetQ
**Links:** Platform · Intelligence · Hardware · FAQ
**Primary CTA:** Request a demo
**Secondary CTA:** Explore the platform

## 1. Hero

**Eyebrow:** The AI native operating system for gyms
**Headline:** Understand your floor. Decide what comes next.
**Body:** Connect your equipment, see the patterns and turn your next gym decision into a clearer one. SetQ brings floor intelligence and everyday operations into one considered workspace.
**Model attribution:** Designed around Claude models [adjacent authentic Anthropic logo]
**Status:** Early access · Product preview
**Primary CTA:** Request a demo
**Secondary CTA:** Explore the platform

**Small supporting line:** Built for the floor you have. Designed for the gym you're building.

Alternative headline A: **Your floor has a story. Put it to work.** More editorial; needs the category and explanatory body nearby.
Alternative headline B: **A clearer view of your gym. A better next decision.** Broad and accessible, with less distinctive rhythm.

Annotation: Lead with an operator outcome, then make the operating-system ambition tangible through equipment and a workspace. Avoid promising a complete administrative suite.

## 2. The operator's problem

**Eyebrow:** Beyond the check-in
**Heading:** The busiest hours tell only half the story.
**Body:** You know who comes through the door. Understanding what happens on the floor takes a closer look. See which equipment records the most activity, how patterns change through the week and where a review could make a difference.

**Three short promises:**

- **See the pattern.** Understand equipment activity across hours, days and locations.
- **Focus the review.** Bring attention to the machines and periods worth a closer look.
- **Plan with context.** Put floor data beside member feedback, equipment condition and investment priorities.

Annotation: Door entry versus equipment activity is a credible distinction. The site must not suggest identifying members from sensor telemetry.

## 3. Interactive floor intelligence

**Eyebrow:** Floor intelligence
**Heading:** The whole floor. In focus.
**Body:** From the morning session to the evening peak, explore how equipment activity changes and compare the machines that matter to your next decision.

**Preview label:** Interactive product preview · Sample data
**Site names:** SetQ Demo / Richmond · SetQ Demo / Carlton
**Period labels:** Today · 7 days · 30 days (only if each control changes the actual sample view consistently)
**Dashboard heading:** Floor overview
**Metric labels:** Activity share · Recorded activity · Equipment observed · Data coverage
**Metric explanation:** Activity share is time away from rest as a share of observed equipment time. It does not measure occupancy.
**Chart heading:** Activity through the day
**Table heading:** Equipment to review
**Table labels:** Equipment · Recorded activity · Peak period · Coverage
**Sample context:** Sample period: 1–7 October 2026. Illustrative figures, not a connected gym.
**Selection helper:** Select a machine to see its activity pattern.
**Coverage message:** Gaps remain visible so quiet periods and missing data stay distinct.

**Example machine detail:**

Leg press · Asset LP-01
Higher recorded activity in the evening window. Review alongside member feedback before deciding whether more capacity is needed.

**Example incomplete machine detail:**

Seated row · Asset SR-01
Coverage is incomplete in this sample period. A full-period comparison is unavailable.

Annotation: Make the dashboard earn its space with working filters and real selection state, then keep one compact definition available as help text. Never call activity share utilisation without defining it.

## 4. AI intelligence

**Eyebrow:** Intelligence, with context
**Heading:** Ask your gym a better question.
**Body:** Bring the question you would ask your operations team. The assistant experience is designed to connect floor evidence, explain the pattern and help you choose what to review next.

**Panel title:** Claude assistant [adjacent authentic Anthropic logo]
**Panel labels:** Product preview · Integration in development
**Input placeholder:** What would you like to understand about your floor?
**Submit:** Ask

**Suggested questions and sample answers:**

**Question:** What changed on the floor this week?
**Sample answer:** In this sample week, evening activity is concentrated on the leg press and cable station. The seated row has incomplete coverage, so I would leave it out of a full-week ranking. Start by reviewing the evening pattern with your floor team.
**Source chip:** Sample floor report · 1–7 Oct
**Action:** Add to review list

**Question:** What should I review before buying more equipment?
**Sample answer:** Start with the leg press: it records the strongest evening activity in this sample. That is a useful signal, but it does not tell us whether members are waiting. Check member feedback, floor observations and the cost of adding a second unit before committing.
**Source chip:** Leg press · Evening activity
**Action:** Open equipment review

**Question:** How do our locations compare?
**Sample answer:** Richmond shows more evening leg-press activity than Carlton in this sample period. Compare the same equipment, observed hours and dates before drawing a conclusion. I would review member feedback at each site before recommending a transfer.
**Source chip:** Sample location comparison
**Action:** Compare locations

**Question:** Prepare my weekly operations brief.
**Sample answer:** Review the evening leg-press pattern. Check the seated-row coverage gap. Compare cable-station activity across the two sample locations. Keep any equipment decision on hold until the floor team adds context.
**Source chip:** Sample weekly brief
**Action:** Save sample brief

**Sample response footer:** Illustrative response. No live model request is made in this preview.
**Unknown question response:** This preview includes a few example questions. Try one above to explore the intended workflow.
**Local action feedback:** Added to your sample review list.

Annotation: Show grounded investigation rather than an all-knowing chatbot. A visible sources row and a modest next action make the OS direction credible.

## 5. Equipment economics

**Eyebrow:** Every square metre matters
**Heading:** Invest in the floor your members use.
**Body:** Bring activity patterns into equipment planning. Compare the next purchase, a relocation or a change to the floor with the costs and assumptions that matter to your business.

**Card one:** Review before you replace.
Lower recorded activity is a starting point for a conversation. Check placement, member feedback and equipment condition before making a call.

**Card two:** Compare before you expand.
Review matching equipment across sites and periods. Put the evidence beside your floor plan and capital budget.

**Card three:** Make the assumptions visible.
Add your equipment costs and operating context to build an investment review you can explain.

**Optional interactive calculator:**
**Title:** What does this equipment cost per recorded activity hour?
**Inputs:** Purchase cost · Planned years of use · Annual upkeep · Annual recorded activity hours
**Result label:** Estimated cost per recorded activity hour
**Formula:** (purchase cost / planned years + annual upkeep) / annual recorded activity hours
**Result note:** Planning estimate from your inputs. Excludes financing, residual value, floor costs and membership revenue. Activity time is not occupancy or member value.
**Empty/invalid state:** Enter positive years and activity hours to calculate.

Annotation: Cost per activity hour can be a transparent illustrative planning tool. It cannot be labelled measured ROI or predicted savings.

## 6. Sensor / retrofit / privacy

**Eyebrow:** Small hardware. A clearer picture.
**Heading:** Start with the equipment you already have.
**Body:** SetQ's proposed sensor sits above a compatible weight stack and observes its movement. A compact retrofit approach brings the floor into view without making members wear another device.

**Three details:**

- **Equipment focused.** The sensor observes stack movement, not member identity.
- **No camera. No microphone.** Floor intelligence starts at the machine.
- **Fit comes first.** Installation suitability is reviewed for each machine and site.

**Model caption:** Proposed above-stack sensor design. Installation and performance are being validated.
**Link:** Explore the sensor

Annotation: The requested fixed downward ultrasonic geometry is a concept distinct from the legacy contact sensor. No battery-life or accuracy claim belongs here.

## 7. FAQ

**Heading:** A few things worth knowing.

**Is SetQ available now?**
SetQ is in development. We are speaking with gym owners and operators about early access and pilot opportunities. The website demonstrates the intended experience with sample data.

**Will it work with our equipment?**
The retrofit design starts with compatible weight-stack equipment. We will review your machines, mounting options and site before recommending a pilot.

**What does the sensor measure?**
The proposed ultrasonic sensor observes stack movement. Reports depend on the validated installation and measure. Movement alone does not identify members, measure occupancy, count queues or determine the weight lifted.

**Does it use cameras or identify members?**
The proposed equipment sensor uses no camera or microphone and does not identify members. It focuses on the machine.

**Is the AI assistant live?**
The assistant shown here is an interactive demonstration of the planned experience. Model integration is in development, and the preview uses illustrative answers.

**Does SetQ replace our membership software?**
The initial focus is equipment and floor operations: understanding activity, reviewing patterns and planning investment. Membership billing and access control are outside this preview's scope.

**How much will it cost?**
Pricing is being developed around installation scope and the needs of each gym. Request a demo to discuss your floor and pilot suitability.

## 8. Final CTA and footer

**Eyebrow:** Build your next gym decision on a clearer view
**Heading:** Let's talk about your floor.
**Body:** Tell us about your gym, the equipment decisions ahead and what you wish you could see more clearly.
**Primary CTA:** Request a demo
**Secondary contact:** founder@setq.com.au
**Supporting line:** Early-access conversations for gym owners and operators.

**Email subject:** SetQ demo request
**Email draft:**
Hello SetQ,

I'd like to learn more about a demo or early pilot.

Gym name:
Location / number of sites:
Equipment decision or question:

Name:
Contact details:

**CTA feedback if shown:** Your email app opens a draft addressed to founder@setq.com.au. Send it when you're ready.

**Footer:** SetQ · The AI native operating system for gyms
**Links:** Platform · Hardware · Request a demo
**Site:** setq.com.au
**Footer note:** Early-access product preview. Sample data throughout.

## Metadata

**Title:** SetQ — AI native operating system for gyms
**Description:** Understand your gym floor, explore equipment activity and plan what comes next. Discover SetQ's connected hardware and AI operations platform. Request an early-access demo.

## Conversion rationale

The primary CTA is a real conversation, consistent with prototype maturity and an equipment installation that requires a fit review. A working sample dashboard lets visitors understand the product before contacting the founder. The secondary exploration CTA stays within the page. There is no invented trial, account signup or automatic deployment promise.
