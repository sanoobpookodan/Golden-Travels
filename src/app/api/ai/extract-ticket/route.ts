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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Extract structured flight booking data from this PDF ticket.

Return ONLY valid JSON.

Schema:

{
  "passengers": [
    {
      "name": "Full name",
      "ticketNo": "Ticket/e-ticket number"
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
        "date": "Day, DD Mon, YYYY",
        "airport": "Airport name",
        "terminal": "Terminal"
      },

      "arrival": {
        "time": "HH:MM",
        "date": "Day, DD Mon, YYYY",
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
    "misc": "Amount",
    "total": "Amount"
  }
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
    ]);

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