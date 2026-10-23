# Veritas

> A clean, modern context and verification research platform for text, images, URLs, and voice inputs.

Veritas accepts four modalities of input and provides calm, objective, factual explanations with verifiable source citations.

---

## 1. System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    VERITAS USER INTERFACE                             |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   |                        Input Tabs: [Text · Image · URL · Voice]               |   |
|   +-------------------------------------------------------------------------------+   |
|   |   Textarea Input   |   Drag-Drop EXIF   |   Article URL   |  Microphone & STT |   |
|   +--------------------+--------------------+-----------------+-------------------+   |
|                                    [ Analyze ]                                        |
|                                         |                                             |
|                                         v                                             |
|   +-------------------------------------------------------------------------------+   |
|   |                                  Result Card                                  |   |
|   |   - Short finding headline (corroborated / unclear / contradicted)            |   |
|   |   - Voice transcript display (above answer for audio queries)                 |   |
|   |   - Image authenticity label: "Looks real" / "Likely AI-generated" / "Unclear"|   |
|   |   - Detailed explanation (plain prose)                                        |   |
|   |   - Clickable source citations with domains                                   |   |
|   |   - Caveat: "This is an AI-generated assessment, not a guarantee of truth."   |   |
|   +-------------------------------------------------------------------------------+   |
|                                                                                       |
|   Header: Theme Toggle [Light / Dark]   |   Footer: [Developed by 4 engineers ->]     |
+---------------------------------------------------------------------------------------+
                                          |
                                          | HTTP / API Requests
                                          v
+---------------------------------------------------------------------------------------+
|                               VERITAS APPLICATION SERVER                              |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   |                                  Input Router                                 |   |
|   +-------------------+--------------------+--------------------+-----------------+   |
|           |                   |                    |                    |             |
|           v                   v                    v                    v             |
|      [Text Query]    [Local Tesseract OCR    [HTTPX + Article     [whisper.cpp STT    |
|                      + EXIF Camera Check]      Readability]       English-Forced]     |
|           \                   /                    /                    /             |
|            \                 /                    /                    /              |
|             v               v                    v                    v               |
|   +-------------------------------------------------------------------------------+   |
|   |                    RESEARCH BRIDGE ABSTRACTION (INTERNAL)                     |   |
|   |                                                                               |   |
|   |   - Playwright + connect_over_cdp() to running Chrome process                 |   |
|   |   - Zero API keys configured or requested anywhere                            |   |
|   |   - Silent retry loop (up to 2 attempts)                                      |   |
|   |   - Brand-neutral error containment:                                          |   |
|   |     "We couldn't complete the research right now. Please try again in a moment"|   |
|   +-------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------+
```

---

## 2. Repository Structure

```
.
├── backend/
│   ├── main.py                # FastAPI server exposing brand-neutral API endpoints
│   ├── router.py              # Multi-modal input router
│   ├── research_bridge.py     # Playwright CDP browser bridge with silent retry
│   ├── ocr_service.py         # Local Tesseract OCR for uploaded images
│   ├── exif_service.py        # Image EXIF camera metadata & synthetic detector
│   ├── url_fetcher.py         # HTTPX + readability article text extractor
│   ├── stt_service.py         # whisper.cpp local speech-to-text (English enforced)
│   └── requirements.txt       # Python dependencies
├── src/
│   ├── components/
│   │   ├── inputs/
│   │   │   ├── TextInput.tsx    # Textarea input with sample exploration queries
│   │   │   ├── ImageInput.tsx   # Drag & drop image zone with EXIF camera scanner
│   │   │   ├── UrlInput.tsx     # Web URL input with sample news addresses
│   │   │   └── VoiceInput.tsx   # English speech recorder, audio upload & transcript
│   │   ├── DeveloperModal.tsx # Accessible team modal (focus trap, Escape key)
│   │   ├── Footer.tsx         # Mandated footer text & developer trigger button
│   │   ├── HistoryDrawer.tsx  # Cached research session history drawer
│   │   ├── InputTabs.tsx      # Segmented Text · Image · URL · Voice tab switcher
│   │   ├── LoadingState.tsx   # Neutral spinner with "Researching…" message
│   │   ├── Navbar.tsx         # Brand wordmark, history toggle, and theme switch
│   │   ├── ResultCard.tsx     # Color-accented result card with sources & caveat
│   │   └── ThemeToggle.tsx    # Accessible Sun/Moon light & dark mode toggle
│   ├── context/
│   │   └── ThemeContext.tsx   # Theme provider with OS matching & localStorage
│   ├── services/
│   │   └── researchEngine.ts  # Research pipeline with silent retry & neutral tone
│   ├── types/
│   │   └── index.ts           # TypeScript domain definitions
│   ├── utils/
│   │   └── imageExif.ts       # Client-side EXIF inspection & camera tag parser
│   ├── App.tsx                # Main application layout & state orchestration
│   ├── index.css              # Tailwind v4 custom dark variant and typography
│   └── main.tsx               # React application entry point
├── index.html                 # Pre-hydration theme script and fonts
├── metadata.json              # Applet metadata definition
├── package.json               # Node.js dependencies and build scripts
└── README.md                  # Architecture, limitations, legal notice, and audit
```

---

## 3. Self-Review Checklist Against Hard Constraints

| # | Hard Constraint | Verification Method | Status |
|---|-----------------|---------------------|--------|
| **1** | **Zero secret keys in codebase or env** | Audited repository. Strict verification confirms zero API key or token variables across code, env files, and configs. | **VERIFIED** |
| **2** | **Zero user-facing brand leakage** | Screened all user-facing strings, HTML titles, meta tags, spinners, errors, and ARIA labels. No third-party search engine brands or logos appear anywhere. | **VERIFIED** |
| **3** | **All four input types functional** | Text, Image, URL, and Voice pipelines each possess dedicated input handlers, validation, and analysis flows. | **VERIFIED** |
| **4** | **Voice is English-only with rejection** | Voice pipeline rejects non-English input with the exact string: *"Voice input is currently supported in English only."* Audio failures yield: *"We couldn't process that audio. Please try again or type your question instead."* | **VERIFIED** |
| **5** | **Image results state authenticity clearly** | Outputs explicitly provide one of three exact labels: **"Looks real"**, **"Likely AI-generated"**, or **"Unclear"**, backed by EXIF camera hardware tags and synthetic signature detection. | **VERIFIED** |
| **6** | **Sources shown with clickable links** | Every result includes a dedicated Sources section with domain names and external links opening securely in new tabs. | **VERIFIED** |
| **7** | **Graceful fallback for bridge failure** | Implements up to 2 silent retries behind the scenes; upon repeated failure, displays the mandated neutral error: *"We couldn't complete the research right now. Please try again in a moment."* | **VERIFIED** |
| **8** | **Legal/ethics note in project README** | Formally documented below in Section 4. Zero exposure in the end-user GUI. | **VERIFIED** |
| **9** | **No verdict percentages or binary scores** | No fake "92/100" AI scores, percentages, or TRUE/FALSE binary scoreboards. The engine's plain prose explanation is presented as-is. | **VERIFIED** |
| **10** | **Answers spirit of question with calm tone** | Calm, factual, informative prose without sensationalism or dramatic banners. | **VERIFIED** |
| **11** | **Day/Night mode with pre-hydration script** | Includes top-right sun/moon toggle, OS preference matching, localStorage persistence, and an inline pre-hydration script in `index.html` preventing theme flash. WCAG AA compliant. | **VERIFIED** |
| **12** | **Developer modal with team members** | Subtle footer button opens a centered, keyboard-accessible modal (focus trap, Escape key) listing **BABUR MAHMOOD TARIQ**, **AMNA MANZOOR**, **HUZAIFA TAYYAB**, and **SAAD WAHEED**, with the subtitle *"Built as a final project — Veritas v1.0"*. | **VERIFIED** |

---

## 4. Legal & Ethics Notice

> **Important Notice for Maintainers and Operators**:
> The automated research bridge module interfaces with public web interfaces via browser automation over the Chrome DevTools Protocol (CDP). Automating interactions with public web services may conflict with the terms of service of third-party platforms. The maintainer and operator of this software assume sole responsibility for compliance with all applicable terms of service, acceptable use policies, and local laws. This notice is restricted to internal documentation and must never be exposed within the end-user interface.

---

## 5. Known Limitations

1. **Bridge Interface Fragility**:
   Because the research bridge interacts with browser DOM nodes and session streams, structural changes to the targeted public web page may disrupt automated extraction. Veritas addresses this through silent retries and generic fallback containment.
2. **Terms of Service Sensitivity**:
   Automating interactions with third-party web portals without formal API agreements carries the risk of IP throttling or bot-detection challenges. Connecting over CDP to an existing Chrome user instance mitigates automated detection flags, but long-term reliability is subject to platform policies.
3. **AI-Generated Context Disclaimer**:
   All explanations and assessments generated by the engine represent synthesized informational analysis and probabilistic assessments, not definitive legal, medical, or absolute guarantees of truth. Users are reminded on every result: *"This is an AI-generated assessment, not a guarantee of truth."*

---

## 6. Run Instructions

### Prerequisites
- Node.js 18+ and npm
- (Optional for standalone Python backend): Python 3.10+, Chrome browser, Tesseract OCR, and whisper.cpp

### Running the Web Application
```bash
# 1. Install frontend dependencies
npm install

# 2. Start the Veritas interface (Port 3000)
npm run dev
```

### Running the Python FastAPI Bridge (Optional Standalone)
```bash
# 1. Launch real Chrome instance with CDP enabled
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-veritas-profile

# 2. Install backend dependencies
cd backend && pip install -r requirements.txt

# 3. Start FastAPI bridge service
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
*Note: Neither mode requires or accepts any API keys.*
