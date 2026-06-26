import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("AI Extraction Error: GOOGLE_GENERATIVE_AI_API_KEY is not defined");
      return NextResponse.json(
        { error: "API configuration missing. Please check server logs." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Sending PDF to AI... Size: ${(buffer.length / 1024).toFixed(2)} KB`);

    const modelsList = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-3-flash",
      "gemini-3.5-flash"
    ];

    // ── OLD PROMPT (kept for reference) ──────────────────────────────────────
    // const prompt = `
    // You are reading a flight e-ticket PDF. Extract the booking data and return ONLY valid JSON matching the schema below.
    //
    // ━━━ HOW TO READ THE PNR ━━━
    // In this ticket, each flight section has a PNR label printed right next to it (e.g. "PNR: IPOYPC").
    // Read the ticket section by section. For each flight, look at the PNR label that is in the SAME section as that flight.
    // A round-trip ticket usually has TWO different PNRs:
    //   - One PNR for the outbound flights (e.g. city A → city B)
    //   - A DIFFERENT PNR for the return flights (e.g. city B → city A)
    // DO NOT assume all flights share the same PNR.
    // DO NOT copy the first PNR you see to every flight.
    // Each flight's "pnr" value must be the PNR label found in that flight's own section of the ticket.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //
    // Return ONLY this JSON structure:
    //
    // {
    //   "bookingDate": "Booking date exactly as written in the ticket. Do NOT add or guess the day of the week if it is not printed.",
    //   "pnr": "The first PNR that appears in the ticket.",
    //   "passengers": [
    //     {
    //       "name": "Full passenger name",
    //       "ticketNo": "E-ticket number",
    //       "baggage": "Check-in baggage allowance (e.g. 20 Kg)",
    //       "handBaggage": "Cabin/hand baggage allowance (e.g. 7 Kg)"
    //     }
    //   ],
    //   "flights": [
    //     {
    //       "airline": "Airline name",
    //       "flightNumber": "Flight number",
    //       "from": "Departure city name",
    //       "fromCode": "3-letter IATA departure airport code",
    //       "to": "Arrival city name",
    //       "toCode": "3-letter IATA arrival airport code",
    //       "departure": {
    //         "time": "HH:MM",
    //         "date": "Date exactly as written in the ticket. Do NOT add or guess the day of the week.",
    //         "airport": "Departure airport name",
    //         "terminal": "Departure terminal (empty string if not shown)"
    //       },
    //       "arrival": {
    //         "time": "HH:MM",
    //         "date": "Date exactly as written in the ticket. Do NOT add or guess the day of the week.",
    //         "airport": "Arrival airport name",
    //         "terminal": "Arrival terminal (empty string if not shown)"
    //       },
    //       "duration": "Flight duration (e.g. 3h 25m)",
    //       "pnr": "The PNR printed in THIS flight's own section of the ticket. Read it directly — do not copy from another flight's section.",
    //       "cabinClass": "Cabin class (e.g. Economy, Business)"
    //     }
    //   ],
    //   "fare": {
    //     "base": "Base fare amount",
    //     "tax": "Tax amount",
    //     "total": "Total amount paid"
    //   }
    // }
    // `;
    // ─────────────────────────────────────────────────────────────────────────

    const prompt = `
You are an expert at extracting flight booking information from airline e-ticket PDFs.

Your task is to read the PDF carefully and return ONLY valid JSON matching the schema below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT - FOLLOW THIS EXTRACTION PROCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Scan the ENTIRE PDF first.

2. Find EVERY flight section (flight card) in the document.

3. Process ONE flight section AT A TIME.

For EACH flight section:

• Read the airline
• Read the flight number
• Read the departure information
• Read the arrival information
• Read the duration
• Read the cabin class
• Read the PNR that is printed INSIDE THAT SAME FLIGHT SECTION ONLY

Do NOT use a PNR that belongs to another flight section.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PNR EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Many airline tickets contain multiple PNRs.

A round-trip itinerary commonly has:

Outbound flights
PNR: IPOYPC

Return flights
PNR: ETUALQ

Example:

WY298 → IPOYPC
WY609 → IPOYPC
WY604 → ETUALQ
WY291 → ETUALQ

This is CORRECT.

The following is WRONG:

WY298 → IPOYPC
WY609 → IPOYPC
WY604 → IPOYPC
WY291 → IPOYPC

Never copy the first PNR to every flight.

Each flight MUST receive ONLY the PNR printed in its own section.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract dates EXACTLY as printed.

Do NOT:

• calculate weekdays
• infer weekdays
• rewrite dates
• change formatting

If the ticket says

3 Oct 2026

return

3 Oct 2026

NOT

Sat, 3 Oct 2026

unless "Sat" actually appears in the ticket.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON.

Do not explain.

Do not add markdown.

Do not wrap in \`\`\`json.

Do not include comments.

If a field does not exist, return an empty string.

The top-level "pnr" field should contain ONLY the first PNR encountered in reading order.

The "flights[].pnr" field MUST contain the PNR from THAT specific flight section and MUST NOT automatically reuse the top-level PNR.

Schema:

{
  "bookingDate": "",
  "pnr": "",
  "passengers": [
    {
      "name": "",
      "ticketNo": "",
      "baggage": "",
      "handBaggage": ""
    }
  ],
  "flights": [
    {
      "airline": "",
      "flightNumber": "",
      "from": "",
      "fromCode": "",
      "to": "",
      "toCode": "",
      "departure": {
        "time": "",
        "date": "",
        "airport": "",
        "terminal": ""
      },
      "arrival": {
        "time": "",
        "date": "",
        "airport": "",
        "terminal": ""
      },
      "duration": "",
      "pnr": "",
      "cabinClass": ""
    }
  ],
  "fare": {
    "base": "",
    "tax": "",
    "total": ""
  }
}
`;

    let result = null;
    let lastError = null;
    let selectedModelName = "";

    for (const modelName of modelsList) {
      try {
        console.log(`Attempting ticket extraction using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: "application/pdf",
            },
          },
        ]);
        selectedModelName = modelName;
        console.log(`Successfully extracted ticket data using model: ${selectedModelName}`);
        break;
      } catch (error: any) {
        console.warn(`Model ${modelName} failed or limit hit:`, error.message || error);
        lastError = error;
      }
    }

    if (!result) {
      throw new Error(`All models in the chain failed. Last error: ${lastError?.message || lastError}`);
    }

    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Invalid JSON returned by AI", raw: responseText },
        { status: 500 }
      );
    }

    const jsonData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(jsonData);

  } catch (error: any) {
    console.error("AI Extraction Error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to extract data" },
      { status: 500 }
    );
  }
}