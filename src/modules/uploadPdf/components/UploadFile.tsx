"use client";
import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path for stable version 3.11
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { useState } from "react";

export default function UploadFile() {
  const [pdf, setPdf] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdf(file);
      handleExtractText(file);
    }
  };

  const extractText = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ");
      }

      return text;
    } catch (error) {
      console.log(error, "error in UploadFile");
    }
  };

  const handleExtractText = async (file: File) => {
    const text = await extractText(file);
    const prompt = `
        Extract structured flight booking data from the text below.
        Return ONLY valid JSON. No explanation.
        Schema:
        {
        "passengers": [
            { "name": "", "ticketNo": "" }
        ],
        "flights": [
            {
            "from": "",
            "to": "",
            "departureTime": "",
            "arrivalTime": "",
            "departureDate": "",
            "arrivalDate": "",
            "airline": "",
            "flightNumber": "",
            "baggage": "",
            "status": ""
            }
        ],
        "fare": {
            "total": "",
            "base": "",
            "tax": ""
        }
        }
        TEXT:
        ${text}
        `;

    console.log(text);
  };

  return (
    <div className="relative max-w-sm">
      <Label required>Upload PDF</Label>
      <FileInput type="file" id="upload-pdf" accept=".pdf" onChange={handleFileChange} required />
    </div>
  );
}
