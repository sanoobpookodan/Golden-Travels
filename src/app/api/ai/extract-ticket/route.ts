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
        {
          error: "No file provided",
        },
        {
          status: 400,
        }
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

    const prompt = `
Extract structured flight booking data from this PDF ticket.

Return ONLY valid JSON.

Schema:

{
  "bookingDate": "Booking date/time EXACTLY as written in the ticket. If the ticket doesn't list the day of the week (e.g. Monday, Tue), DO NOT guess, calculate or add it. Just extract the raw date/time string from the ticket.",
  "pnr": "Airline PNR / Booking Reference / Record Locator (usually a 6-character alphanumeric code like AM48QZ or similar)",
  "passengers": [
    {
      "name": "Full name",
      "ticketNo": "Ticket/e-ticket number",
      "baggage": "Check-in baggage limit (e.g. 15 Kg)",
      "handBaggage": "Hand/Cabin baggage limit (e.g. 7 Kg)"
    }
  ],

  "flights": [
    {
      "airline": "Airline name",
      "flightNumber": "Flight number",

      "from": "Departure city",
      "fromCode": "3-letter airport code",

      "to": "Arrival city",
      "toCode": "3-letter airport code",

      "departure": {
        "time": "HH:MM",
        "date": "Departure date EXACTLY as written in the ticket. Do NOT guess, calculate, or add the day of the week if it is not explicitly written in the ticket.",
        "airport": "Airport name",
        "terminal": "Terminal"
      },

      "arrival": {
        "time": "HH:MM",
        "date": "Arrival date EXACTLY as written in the ticket. Do NOT guess, calculate, or add the day of the week if it is not explicitly written in the ticket.",
        "airport": "Airport name",
        "terminal": "Terminal"
      },

      "duration": "Xh Ym",

      "pnr": "Airline PNR/Booking Ref",

      "cabinClass": "Economy/Business/etc"
    }
  ],

  "fare": {
    "base": "Amount",
    "tax": "Amount",
    "total": "Amount"
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

    const jsonMatch =
      responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        {
          error: "Invalid JSON returned by AI",
          raw: responseText,
        },
        {
          status: 500,
        }
      );
    }

    const jsonData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(jsonData);

  } catch (error: any) {
    console.error(
      "AI Extraction Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to extract data",
      },
      {
        status: 500,
      }
    );
  }
}