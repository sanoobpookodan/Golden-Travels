"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFlightStore } from "@/store/useFlightStore";
import { usePassengerStore } from "@/store/usePassengerStore";
import { useFareStore } from "@/store/useFareStore";
import toast from "react-hot-toast";

interface AIProcessingProps {
  onSuccess?: () => void;
}

function getErrorMessage(status?: number): string {
  const statusMessages: Record<number, string> = {
    401: "Authentication failed. Invalid API configuration.",
    404: "AI service configuration error. Model not found.",
    429: "Request limit exceeded. Please wait a moment and try again.",
    500: "Internal server error while processing your request.",
    503: "AI service is currently busy. Please try again in a few seconds.",
  };
  if (status && statusMessages[status]) return statusMessages[status];
  return "Something went wrong while processing the PDF.";
}

export default function AIProcessing({ onSuccess }: AIProcessingProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setFlights } = useFlightStore();
  const { setPassengers } = usePassengerStore();
  const { setFare } = useFareStore();

  // Clean up blob URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    const loadingToast = toast.loading("Gemini is reading your ticket...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      let response: Response;
      try {
        response = await fetch("/api/ai/extract-ticket", {
          method: "POST",
          body: formData,
        });
      } catch {
        throw new Error("Network issue while contacting AI service. Please try again.");
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status));
      }

      const data = await response.json();

      if (data.flights) {
        setFlights(
          data.flights.map((f: any) => ({
            ...f,
            id: crypto.randomUUID(),
            from: f.from ?? "",
            to: f.to ?? "",
            airline: f.airline ?? "",
            flightNumber: f.flightNumber ?? "",
            departure: {
              date: f.departure?.date ?? "",
              time: f.departure?.time ?? "",
              airport: f.departure?.airport ?? "",
            },
            arrival: {
              date: f.arrival?.date ?? "",
              time: f.arrival?.time ?? "",
              airport: f.arrival?.airport ?? "",
            },
          }))
        );
      }

      if (data.passengers) {
        setPassengers(
          data.passengers.map((p: any) => ({
            ...p,
            id: Date.now() + Math.random(),
            name: p.name ?? "",
            ticketNo: p.ticketNo ?? "",
            baggage: p.baggage ?? "Kg",
            handBaggage: p.handBaggage ?? "Kg",
          }))
        );
      }

      if (data.fare) {
        setFare({
          base: data.fare.base ?? "0.00",
          tax: data.fare.tax ?? "0.00",
          misc: data.fare.misc ?? "0.00",
          total: data.fare.total ?? "0.00",
        });
      }

      toast.success("Ticket data extracted successfully!", { id: loadingToast });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const msg = error.message || "Something went wrong while processing the PDF.";
      console.error("AI Extraction Error:", error);
      setErrorMsg(msg);
      toast.error(msg, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a valid PDF file.");
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a PDF under 15MB.`);
      setSelectedFile(file); // still store it to show the error
      toast.error("File exceeds 15MB limit");
      return;
    }

    // Store file + create preview URL
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setShowPreview(false);

    // Reset input so the same file can trigger onChange again if needed
    event.target.value = "";

    await processFile(file);
  };

  const handleRetry = async () => {
    if (!selectedFile || selectedFile.size > MAX_FILE_SIZE) return;
    await processFile(selectedFile);
  };

  const handleClearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowPreview(false);
    setErrorMsg(null);
  };

  const isFileTooLarge = selectedFile && selectedFile.size > MAX_FILE_SIZE;

  return (
    <div className="space-y-3">
      {/* ── Top bar ── */}
      <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-4">

          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-brand-500/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Title + status */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">AI Auto-Fill</h3>

            {errorMsg ? (
              <p className="text-red-500 dark:text-red-400 text-xs mt-0.5 flex items-start gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </p>
            ) : selectedFile ? (
              <p className="text-green-600 dark:text-green-400 text-xs mt-0.5 flex items-center gap-1 truncate">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{selectedFile.name}</span>
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Upload PDF to extract passenger &amp; flight data automatically.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Preview toggle — only shown when a file is loaded and valid */}
            {selectedFile && previewUrl && !isFileTooLarge && (
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {showPreview ? "Hide" : "Preview"}
              </button>
            )}

            {/* Retry — only shown when there's a failed attempt with a valid file */}
            {selectedFile && errorMsg && !isFileTooLarge && (
              <button
                onClick={handleRetry}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            )}

            {/* Clear file */}
            {selectedFile && !isProcessing && (
              <button
                onClick={handleClearFile}
                className="flex items-center gap-1 px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Main upload / extract button */}
            <div className="relative">
              <input
                ref={inputRef}
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
                  flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer
                  ${isProcessing || isFileTooLarge
                    ? "bg-gray-100 text-gray-400 dark:bg-white/5 cursor-not-allowed border border-gray-200 dark:border-gray-800"
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
                    {isFileTooLarge ? "Limit Exceeded" : selectedFile ? "Change PDF" : "Extract PDF"}
                  </>
                )}
              </label>
            </div>

          </div>
        </div>
      </div>

      {/* ── PDF Preview Panel ── */}
      {showPreview && previewUrl && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-white/[0.05] border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              {selectedFile?.name}
            </span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-[500px] bg-white"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
}
