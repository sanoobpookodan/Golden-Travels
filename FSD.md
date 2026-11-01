# Golden Travels — Functional Specification Document

**Document status:** As-is specification based on repository inspection  
**Application:** Golden Travels ticket processing and e-ticket preparation web app  
**Date:** 1 November 2026

## 1. Purpose

Golden Travels is an internal browser-based tool for turning an airline ticket PDF into a customer-ready e-ticket PDF. A staff user uploads a ticket, lets an AI service extract booking information, reviews and edits the extracted values, and downloads a formatted ticket. The application also provides read-only company, GST, and travel-information pages.

This document describes behavior visible in the current codebase. It does not treat the draft education/course data models and older structure notes in the repository as implemented features.

## 2. Scope

### In scope

- Staff sign-in and client-side access gating.
- Upload and preview of one airline ticket PDF at a time.
- AI-assisted extraction of booking, passenger, flight, and fare data.
- Manual review, correction, addition, and removal of passenger and flight rows.
- Editing booking reference/date and fare values.
- Generation and local download of a branded, multi-page A4 e-ticket PDF.
- Read-only display of company details, GST details, and travel guidance.

### Out of scope in the current implementation

- Flight search, booking, ticket issuance, payment collection, or airline/GDS integration.
- Persistent booking records, user management, roles, or an audit trail.
- Editing company/GST/travel guidance in an admin interface.
- Customer accounts, customer-facing booking portal, email delivery, or cloud document storage.
- The course, student, instructor, blog, cart, and enrollment concepts in `db_structure.js` and planning notes; these are not backed by current application routes or workflows.

## 3. Users and access

| User | Current capabilities |
|---|---|
| Travel staff / operator | Sign in, process a ticket, edit the extracted details, download the e-ticket, and view reference pages. |

The sign-in form validates email format and requires a password. The active credential check compares against `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `src/constants/data.ts`; it does not call an authentication server. A successful sign-in writes the user object to browser `localStorage`. The root layout wraps all routes with `AuthGuard`, which redirects unauthenticated users to `/auth/login`.

## 4. Navigation and pages

| Route | Page purpose |
|---|---|
| `/` | Main PDF management workflow and ticket PDF download. |
| `/auth/login` | Sign-in form. |
| `/about` | Read-only company identity/contact details. |
| `/gst-details` | Read-only GST registration and contact details. |
| `/information` | Read-only travel/check-in guidance. |
| Other paths | Catch-all route returns not found. |

The authenticated application shell contains a sidebar with Upload PDF, About, GST Details, and Information links, plus shared header/theme/layout components.

## 5. Primary user journey

1. Staff opens the application and signs in with the configured administrator credentials.
2. Staff selects a PDF file. The UI accepts PDF files up to 15 MB and can display an in-page preview.
3. The browser posts the file as multipart form data to `POST /api/ai/extract-ticket`.
4. The server sends the PDF to Google Gemini using the configured `GOOGLE_GENERATIVE_AI_API_KEY`. It tries configured models in sequence until one succeeds and asks the model for structured ticket data.
5. The response is parsed as JSON and returned to the browser. Flight rows, passenger rows, booking reference/date, and fare are placed into client-side Zustand stores.
6. Staff reviews and edits the populated fields, including departure and arrival terminal and connection waiting time after each flight. They may add/remove passenger or flight rows and correct values manually. Terminal or connection duration values that cannot be determined from the ticket remain blank and are not inferred.
7. The fare total is recalculated from base fare plus taxes when either component changes. The total field remains editable in the current UI.
8. Staff selects **Download E-Ticket (PDF)**. The app renders the ticket template to images, places its sections in an A4 PDF, applies a logo watermark when available, and downloads the result in the browser.

If extraction fails, the upload component shows an error and offers retry for the selected file. Extracted data is not persisted by the application; navigating away or refreshing can lose the working booking data.

## 6. Functional requirements

### Authentication and navigation

- **F-01** The system shall present a sign-in form with email and password fields.
- **F-02** The system shall validate that email is present and syntactically valid, and that password is present.
- **F-03** The system shall accept only the configured administrator email/password pair and show success or invalid-credentials feedback.
- **F-04** On successful sign-in, the system shall store the signed-in user in browser `localStorage` and navigate to `/`.
- **F-05** The system shall check local sign-in state before rendering the authenticated application shell and redirect an unauthenticated user to `/auth/login`.
- **F-06** The application shall expose navigation to the PDF workflow and read-only About, GST Details, and Information pages.

### Ticket upload and AI extraction

- **F-07** The system shall allow selection of a PDF ticket file from the user’s device.
- **F-08** The system shall reject files that are not PDFs and files larger than 15 MB, with user-visible feedback.
- **F-09** The system shall allow the selected PDF to be previewed in an embedded viewer and allow the preview to be hidden.
- **F-10** The system shall submit the selected PDF to the server extraction endpoint and show a processing state while awaiting a response.
- **F-11** The extraction service shall request these logical fields where present: booking date and PNR; passenger name, ticket number, baggage and hand baggage; flight airline, number, origin/destination, departure/arrival date, time, airport/terminal, duration, PNR, cabin class, and connection waiting time after a flight; and fare base, tax, and total.
- **F-12** The system shall populate the editable forms from returned extraction data, assigning client-side row identifiers as needed.
- **F-13** The system shall show a useful error and allow retry after network, configuration, provider, or parse failures.
- **F-14** If the response omits booking date, the client currently uses the current date as a fallback; if booking PNR is omitted, it falls back to the first flight PNR and then an empty value.

### Data review and editing

- **F-15** The system shall display passenger rows with name, ticket number, check-in baggage, and hand baggage fields.
- **F-16** The system shall allow staff to add and remove passenger rows and edit values in existing rows.
- **F-17** The system shall display flight rows with origin, destination, duration, flight number, PNR, checked baggage, departure date/time/terminal, arrival date/time/terminal, and connection waiting time after the flight.
- **F-18** The system shall allow staff to add and remove flight rows and edit values in existing rows, including departure/arrival terminal values and connection waiting time.
- **F-19** The system shall preserve extracted departure/arrival terminal values and connection waiting time when mapping AI results into editable flight records. If no terminal is present or a connection duration cannot be determined reliably, the corresponding value shall be blank; the system shall not infer it.
- **F-20** The system shall allow staff to edit booking PNR and booking date.
- **F-21** The system shall allow staff to edit base fare, taxes/fees, and total in INR. When base or taxes change, total shall be recalculated as their sum.
- **F-22** The working data shall remain available across the workflow while the page remains loaded. Current state is held in browser memory and is not saved to a server or durable browser store.

### E-ticket generation

- **F-23** The system shall generate an A4 portrait PDF from the current passenger, flight, booking, and fare data.
- **F-24** The generated document shall include the Golden Travels header/branding, itinerary, passenger/ticket details, company GST details, fare breakdown, important information, and closing message.
- **F-25** For each flight, the generated document shall display departure and arrival terminal labels and values when supplied. When a flight has a subsequent connected leg and a waiting time is available, the document shall display that duration between the flight and its connection. Blank values shall not produce placeholder text.
- **F-26** The system shall repeat the ticket header on additional pages and place content sections on subsequent pages when needed.
- **F-27** The system shall attempt to apply a low-opacity logo watermark, with a fallback logo asset.
- **F-28** The system shall download the generated PDF locally with a filename derived from passenger and/or flight information.

### Reference information

- **F-27** About shall display company name, address, email, phone, and image from local constants.
- **F-28** GST Details shall display GST name, registration number, address, email, and phone from local constants.
- **F-29** Information shall display the configured airport arrival, check-in closing, carry-on baggage, identification, and airline PNR guidance.

## 7. Data model

The active ticket workflow uses these client-side data groups:

| Entity | Fields represented |
|---|---|
| Booking | PNR/reference, booking date. |
| Passenger | Name, ticket number, checked baggage, hand baggage, client-side ID. |
| Flight | Origin, destination, departure/arrival details, duration, airline, flight number, flight PNR, cabin/fare type, baggage, status and client-side ID. |
| Fare | Base amount, taxes/fees, total (displayed in INR). |
| Company/GST | Company name, GST number, address, email, phone, branding image. |

There is no active application database schema or persistence layer for these records. `db_structure.js` contains sample education-site entities and is not the schema used by the implemented travel workflow.

## 8. Business rules and processing

- Only one source PDF is processed at a time in the current upload interface.
- Maximum source PDF size is 15 MB.
- Model extraction is best-effort; extracted values are intended to be checked and corrected by staff before producing a customer document.
- Individual flight PNR values can be represented separately from the booking-level PNR.
- Fare total is calculated from base plus tax when those values change; rounding/formatting uses two decimal places and Indian number formatting in the UI.
- Company/GST details and important-information text are supplied by application constants; ticket generation currently uses explicit company/GST values in the generator component.
- A generated reference ID is created in the browser for the rendered document and is not recorded in a server-side system.

## 9. External systems and interfaces

| Interface | Purpose | Current implementation |
|---|---|---|
| `POST /api/ai/extract-ticket` | Accept PDF and return extracted JSON. | Next.js route; uses Google Generative AI SDK and server environment key. |
| Google Gemini API | Read ticket PDF and extract structured details. | Model fallback sequence is configured in route code. Provider availability, quotas, and returned values affect extraction. |
| Browser local storage | Keep signed-in user marker. | Key `user`; no server-side session validation. |
| Browser PDF download | Deliver generated ticket to staff. | PDF is assembled client-side using jsPDF and DOM-to-image rendering. |

No external booking, payment, CRM, airline, email, or database interface is implemented in the inspected workflow.

## 10. Non-functional requirements and constraints

- **Platform:** Next.js 15 App Router, React 19, TypeScript, browser-based responsive interface.
- **Usability:** Workflow should support manual correction after AI extraction; processing and error states are shown during extraction.
- **Performance:** Extraction time depends on PDF size and the configured AI provider/models. PDF generation captures each template section in the browser.
- **Security:** The AI key is read by the server route. Authentication currently relies on hard-coded credentials and client-controlled local storage, so it is suitable only as a prototype/internal demonstration and does not provide robust authorization.
- **Privacy:** Ticket PDFs are sent to the configured AI provider. The app does not implement retention controls, consent messaging, or a server-side deletion policy in the inspected code.
- **Reliability:** AI JSON parsing and model availability can fail; the UI surfaces errors and provides retry. No persistent draft recovery is implemented.
- **Accessibility/compatibility:** Standard form controls and responsive layout are used; formal accessibility and browser compatibility requirements are not specified in the repository.

## 11. Known gaps and risks found in the current code

These are implementation observations, not assumptions about desired future behavior:

1. `IS_DEV` is set to `true`, and development credentials are prefilled in the sign-in form. Credentials are defined in source constants; there is no backend authentication service.
2. The root layout applies `AuthGuard` to all routes, including `/auth/login`. This may prevent the login page from rendering for a signed-out user or cause redirect behavior that should be resolved and confirmed.
3. `src/proxy.ts` redirects a separate `/sasas/:path*` matcher to `/login`; the configured matcher and destination do not align with the actual `/auth/login` route.
4. Extraction response data is parsed from model-generated JSON without schema validation before it is returned. Provider output may be incomplete or malformed.
5. The extraction route accepts a multipart `file` but does not enforce the UI’s PDF type or 15 MB size restriction on the server. API callers can bypass client checks.
6. Several UI mappings use permissive `any` typing, and extraction values may not match the state shape exactly; review is required before generating a ticket.
7. Fare total is described as auto-calculated but remains directly editable, so manually entered totals can diverge until base/tax changes trigger recalculation.
8. The About and GST pages are read-only local constants, and the generator has its own hard-coded GST values. These sources can drift apart.
9. Booking records, uploaded source files, and generated PDFs are not stored or auditable. The output exists as a local download only.
10. The sign-in page links to routes such as password reset and sign-up that are not present in the listed application routes.

## 12. Assumptions and decisions to confirm

- The primary target user is an internal travel agent/operator rather than an end customer.
- A human operator is expected to verify every extracted field before downloading a customer-facing ticket.
- Static company/GST/information values are intentionally fixed for the current prototype.
- The current FSD records observed behavior; requirements for future persistence, role separation, security hardening, customer delivery, and audit history need product decisions.

## 13. Acceptance criteria for the documented core workflow

1. An authorized operator can sign in and reach the PDF management page.
2. A valid PDF no larger than 15 MB can be selected, previewed, and submitted for extraction.
3. Successful extraction populates booking, passenger, flight, and fare forms; failed extraction displays an error and supports retry.
4. The operator can correct extracted fields, including departure and arrival terminals and connection waiting times, add or remove passenger/flight rows, and see fare total update from base plus taxes.
5. The operator can download a readable A4 e-ticket PDF containing the current data and company/GST/travel information; populated terminals are labeled beside their airports, and connection waiting times appear between connected flight legs.
6. About, GST Details, and Information pages show the configured static reference data.

---

**Source basis:** Application routes and components under `src/app`, `src/modules`, `src/store`, `src/constants`, `src/layout`, and the AI extraction API route. Items explicitly called out as risks should be validated in a running environment before relying on this document as a release specification.
