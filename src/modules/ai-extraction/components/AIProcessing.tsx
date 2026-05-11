"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { useFlightStore } from "@/store/useFlightStore";
import { usePassengerStore } from "@/store/usePassengerStore";
import { useFareStore } from "@/store/useFareStore";
import toast from "react-hot-toast";

interface AIProcessingProps {
  onSuccess?: () => void;
}

export default function AIProcessing({ onSuccess }: AIProcessingProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setFlights } = useFlightStore();
  const { setPassengers } = usePassengerStore();
  const { setFare } = useFareStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Gemini is reading your ticket...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/extract-ticket", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract data from PDF");
      }

      const data = await response.json();

      // Update Stores
      if (data.flights) {
        setFlights(data.flights.map((f: any) => ({
          ...f,
          id: crypto.randomUUID(),
        })));
      }

      if (data.passengers) {
        setPassengers(data.passengers.map((p: any) => ({
          ...p,
          id: Date.now() + Math.random(),
        })));
      }

      if (data.fare) {
        setFare(data.fare);
      }

      toast.success("Ticket data extracted successfully!", { id: loadingToast });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("AI Extraction Error:", error);
      toast.error(error.message || "Something went wrong", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-brand-500/10 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">AI Auto-Fill</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            Upload PDF to extract passenger & flight data automatically.
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <input
            type="file"
            id="ai-pdf-upload"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
          <label
            htmlFor="ai-pdf-upload"
            className={`
              flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer
              ${isProcessing 
                ? "bg-gray-100 text-gray-400 dark:bg-white/5 cursor-not-allowed" 
                : "bg-brand-500 text-white hover:bg-brand-600 shadow-md active:scale-95"}
            `}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Reading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Extract PDF
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
