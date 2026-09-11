# SATQUERY AI — AI AUDIT TRAIL ONLY

Implement **ONLY the AI Audit Trail feature** for the existing SatQuery AI geospatial analysis workspace.

Do **not** redesign, replace, or substantially modify the existing map, left sidebar, right AI assistant, upload flow, evidence view, or overall design system. The Audit Trail should integrate naturally into the existing application.

The Audit Trail is a **critical differentiating feature** of SatQuery AI. It must make the AI's observable workflow transparent and verifiable without exposing private chain-of-thought reasoning.

---

## 1. AUDIT TRAIL LOCATION

Place a **collapsible horizontal panel across the bottom of the main geospatial analysis workspace**.

It should sit above the very bottom edge of the application and remain visually associated with the central map.

### Collapsed state

Display a compact bar containing:

**AI AUDIT TRAIL**

`Input → Intent → Data → Tool → Analysis → Evidence → Answer`

On the right:

**Status:** `Analysis completed · 6 steps`

Button:

**View Full Audit Trail**

Use the existing SatQuery AI dark GIS design language.

The collapsed bar should be prominent enough to discover but should not obstruct the satellite map.

---

# 2. EXPANDED AUDIT TRAIL

When the user clicks **View Full Audit Trail**, expand the panel upward.

Create a professional, high-information-density audit interface.

Header:

**AI AUDIT TRAIL**

Subheading:

`Observable record of the analysis performed by SatQuery AI`

Right-side controls:

* `Collapse`
* `Export Audit` (visual UI only if export functionality does not already exist)
* timestamp
* status badge: `COMPLETED`

Below the header, display a connected six-step timeline.

---

# 3. SIX-STEP AUDIT TIMELINE

Connect all six steps using a thin cyan/teal progress line.

Each completed step should have a check icon.

Every step must be clickable.

Clicking a step expands its technical details.

Collapsed cards should show:

* Step number
* Step title
* Short description
* Status
* timestamp/duration where appropriate

Expanded cards should reveal additional technical information.

---

## STEP 01 — QUERY INTERPRETATION

Label:

`STEP 01`

Title:

**Interpret Query**

Content:

`Detected a request for temporal urban change analysis.`

Tag:

`CHANGE DETECTION`

Status:

`Completed`

Expanded technical details:

* Query type: Temporal comparison
* Objective: Urban change detection
* Time range: Jan 2024 → Jan 2026
* Requested region: Prayagraj / Ganges Basin
* Analysis intent: Identify significant changes in built-up area

IMPORTANT:

Do not display hidden reasoning or chain-of-thought.

Only show the structured intent that the system extracted from the user's request.

---

# STEP 02 — INPUT INSPECTION

Label:

`STEP 02`

Title:

**Inspect Data**

Content:

`2 GeoTIFF images detected`

Show dataset cards:

### Optical_Cartosat.tif

* Sensor: OPTICAL
* Capture: Jan 2024
* Resolution: 0.8 m
* Format: GeoTIFF
* Metadata: Validated

### SAR_RISAT.tif

* Sensor: SAR
* Capture: Jan 2026
* Resolution: 3 m
* Format: GeoTIFF
* Metadata: Validated

Also display:

`AOI: Prayagraj, India`

Expanded technical information can include:

* coordinate reference system
* acquisition dates
* spatial resolution
* sensor type
* file format
* geographic coverage
* metadata validation status

Do not fabricate excessive metadata if it is not available from the application state.

---

# STEP 03 — TOOL SELECTION

Label:

`STEP 03`

Title:

**Select Analysis Tool**

Display a highlighted tool card:

**ChangeDetection_V2**

Status badge:

`TOOL SELECTED`

Reason:

`Multi-temporal imagery detected.`

Expanded information:

* Analysis category: Change Detection
* Input: Multi-temporal satellite imagery
* Temporal comparison: Jan 2024 vs Jan 2026
* Output: Spatial change map
* Evidence type: Detected spatial changes

The UI should visually communicate that the AI selected the appropriate geospatial analysis tool.

Do NOT expose internal reasoning.

Use concise structured explanations such as:

`Selected because the available inputs contain imagery from different acquisition dates.`

---

# STEP 04 — MODEL EXECUTION

Label:

`STEP 04`

Title:

**Run Analysis**

Display:

**Model: ChangeDetection_V2**

Metrics:

* Area processed: `142 km²`
* Processing status: `Completed`

Show a clear status indicator:

✓ `Analysis completed`

If the application supports an active processing state, this same component should support:

`Processing...`

with a progress indicator.

Once completed, transition to:

`Completed`

Expanded technical information:

* Model: ChangeDetection_V2
* Processing area: 142 km²
* Input datasets: 2
* Output: Change detection raster/vector evidence
* Execution status: Completed

---

# STEP 05 — EVIDENCE

Label:

`STEP 05`

Title:

**Spatial Evidence Generated**

Display the key results:

**Built-up Area**
`+14.2%`

**Expansion Zones**
`3 detected`

**Model Confidence**
`94%`

Include a small thumbnail preview of the generated change-detection map.

The thumbnail should visually resemble the actual map evidence:

* satellite imagery background
* highlighted change regions
* cyan detection polygons/overlays

Add a button:

**View Evidence on Map**

Clicking this should synchronize with the main map and highlight the detected regions.

Expanded details:

* Evidence type: Spatial change detection
* Detected regions: 3
* Built-up change: +14.2%
* Confidence: 94%
* Source model: ChangeDetection_V2

---

# STEP 06 — RESPONSE

Label:

`STEP 06`

Title:

**Answer Generated**

Display the AI result:

> “Significant urban expansion was detected between January 2024 and January 2026.”

Status:

**Verified with spatial evidence**

Also display:

`Confidence: 94%`

Include a small reference indicating:

`Evidence: 3 detected expansion zones`

Expanded information:

* Answer type: Natural-language summary
* Supporting evidence: Spatial change detection
* Evidence regions: 3
* Confidence: 94%
* Verification status: Spatial evidence available

---

# 4. VISUAL TIMELINE

The six steps must feel like a single trace rather than six unrelated cards.

Use:

`01 ✓`
│
`02 ✓`
│
`03 ✓`
│
`04 ✓`
│
`05 ✓`
│
`06 ✓`

with a thin cyan/teal connecting line.

Completed steps:

* check icon
* subtle cyan highlight
* completed status

Current/selected step:

* stronger border
* subtle cyan glow
* expanded technical details

Do not use excessive neon effects.

---

# 5. INTERACTION BEHAVIOR

The Audit Trail must be interactive.

### Clicking a step

Expand/collapse that step.

### Clicking "View Evidence on Map"

* Collapse or minimize the audit panel if necessary.
* Highlight the relevant evidence on the central map.
* Synchronize the right AI panel with the selected evidence.
* Visually indicate which audit step produced the evidence.

### Clicking an evidence region

The selected evidence should correspond to:

`STEP 05 — Spatial Evidence Generated`

and visually highlight that relationship.

### Clicking "Collapse"

Return to the compact bottom audit bar.

---

# 6. AUDIT TRAIL DATA MODEL

Structure the implementation so the UI is driven by structured audit events rather than hard-coded visual elements.

Conceptually use an audit-event structure similar to:

```text
AuditEvent
- id
- stepNumber
- category
- title
- description
- status
- timestamp
- duration
- metadata
- evidence
```

Example categories:

```text
QUERY_INTERPRETATION
INPUT_INSPECTION
TOOL_SELECTION
MODEL_EXECUTION
EVIDENCE_GENERATION
ANSWER_GENERATION
```

This should make it possible to replace the sample values with real analysis events later.

---

# 7. AUDIT TRAIL PRINCIPLE

The Audit Trail must answer five questions clearly:

**1. What data did the AI use?**

Show the datasets, sensors, dates, resolution and AOI.

**2. What analysis did it choose?**

Show:

`Change Detection`

**3. What model/tool ran?**

Show:

`ChangeDetection_V2`

**4. What evidence was produced?**

Show:

* +14.2% built-up area
* 3 expansion zones
* spatial evidence map
* 94% confidence

**5. How was the final answer supported?**

Show:

`Verified with spatial evidence`

---

# 8. IMPORTANT — NO CHAIN OF THOUGHT

This is an **auditability feature, not a reasoning transcript**.

Never display:

* hidden chain-of-thought
* private internal reasoning
* internal deliberations
* speculative thoughts
* raw model reasoning
* statements such as "I considered X but rejected Y"

Instead display only **observable, structured system actions**, such as:

`2 datasets detected`

`Temporal imagery identified`

`ChangeDetection_V2 selected`

`142 km² processed`

`3 spatial change zones generated`

`94% confidence`

This distinction should be visually and semantically clear.

---

# 9. DESIGN REQUIREMENTS

Match the existing SatQuery AI design system:

* Deep navy / near-black background
* Dark GIS panels
* Cyan/teal used primarily for active states
* Thin borders
* Rounded 10–14px cards
* Professional scientific typography
* High information density
* Minimal glassmorphism
* Subtle shadows
* No excessive gradients
* No generic SaaS dashboard styling
* No decorative sci-fi effects

The audit trail should feel like something that could realistically be used by:

* satellite analysts
* researchers
* urban planners
* disaster-management agencies
* intelligence analysts
* GIS professionals

---

# 10. RESPONSIVE STATES

Support at least these states:

### COLLAPSED

`AI AUDIT TRAIL`

`Input → Intent → Data → Tool → Analysis → Evidence → Answer`

`Analysis completed · 6 steps`

`View Full Audit Trail`

### EXPANDED

Full six-step timeline with expandable cards.

### STEP EXPANDED

One selected audit event shows technical metadata and evidence.

### PROCESSING

Some steps completed while the current step displays:

`Processing...`

### COMPLETED

All six steps show checkmarks and the final answer/evidence relationship.

### ERROR

If analysis fails, the affected step should show:

`Failed`

with a concise observable error description.

Do not expose internal stack traces or private reasoning.

---

# 11. FINAL UX GOAL

The user should be able to look at the Audit Trail and immediately understand:

**Question**
↓
**Intent identified**
↓
**Satellite data inspected**
↓
**Analysis tool selected**
↓
**Model executed**
↓
**Spatial evidence generated**
↓
**Answer produced**

The feature should communicate:

**“I can see exactly what data SatQuery AI used, what analysis it ran, what evidence it produced, and why the final result is supported.”**

Implement this Audit Trail as a polished, production-quality component integrated into the existing SatQuery AI workspace.

Do not spend effort redesigning any other screen.
Focus the implementation entirely on the **AI Audit Trail UI, interactions, state handling, and structured audit-event architecture**.
