"use client";
import React, { useRef } from "react";
import { domToJpeg } from "modern-screenshot";
import jsPDF from "jspdf";
import TicketTemplate from "./TicketTemplate";
import Button from "@/components/ui/button/Button";
import { useFlightStore } from "@/store/useFlightStore";
import { usePassengerStore } from "@/store/usePassengerStore";
import { useFareStore } from "@/store/useFareStore";
import { useBookingStore } from "@/store/useBookingStore";

export default function PdfGenerator() {
  const { flights } = useFlightStore();
  const { passengers } = usePassengerStore();
  const { fare } = useFareStore();
  const { booking } = useBookingStore();
  const printRef = useRef<HTMLDivElement>(null);

  const referenceId = React.useMemo(() => `GT${Math.floor(1000000 + Math.random() * 9000000)}`, []);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      // 1. Identify all sections to capture
      const headerEl = element.querySelector("[data-pdf-header]") as HTMLElement;
      const sections = Array.from(element.querySelectorAll("[data-pdf-section]")) as HTMLElement[];

      if (!headerEl) return;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const innerWidth = pageWidth - margin * 2;
      const headerGap = 4;

      // Load watermark logo with low opacity
      let watermark: { dataUrl: string; w: number; h: number; x: number; y: number } | null = null;
      try {
        const loadImg = (src: string) => {
          return new Promise<{ dataUrl: string; width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.globalAlpha = 0.08; // subtle opacity for watermark
                ctx.drawImage(img, 0, 0);
                resolve({
                  dataUrl: canvas.toDataURL("image/png"),
                  width: img.width,
                  height: img.height,
                });
              } else {
                reject(new Error("Canvas context error"));
              }
            };
            img.onerror = () => reject(new Error("Failed to load: " + src));
            img.src = src;
          });
        };

        let watermarkImg;
        try {
          watermarkImg = await loadImg(window.location.origin + "/assets/images/logo.png");
        } catch {
          // fallback to pdfLogo.jpeg
          watermarkImg = await loadImg(window.location.origin + "/assets/images/pdfLogo.jpeg");
        }

        const w = 120; // standard width in mm
        const h = w * (watermarkImg.height / watermarkImg.width);
        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;
        watermark = { dataUrl: watermarkImg.dataUrl, w, h, x, y };
      } catch (e) {
        console.error("Watermark logo load failed, generating PDF without it.", e);
      }

      // 2. Capture header once
      const headerImg = await domToJpeg(headerEl, { scale: 2, quality: 0.75, backgroundColor: '#ffffff', width: 780 });
      const headerHeight = (headerEl.offsetHeight * innerWidth) / headerEl.offsetWidth;

      let currentY = margin;
      const sectionGap = 2; // small gap between captured sections

      const addNewPage = () => {
        pdf.addPage();
        pdf.addImage(headerImg, "JPEG", margin, margin, innerWidth, headerHeight);
        currentY = margin + headerHeight + headerGap;
      };

      // Start first page with header
      pdf.addImage(headerImg, "JPEG", margin, margin, innerWidth, headerHeight);
      currentY = margin + headerHeight + headerGap;

      // 3. Capture and place each section
      for (const section of sections) {
        const sectionImg = await domToJpeg(section, { scale: 2, quality: 0.75, backgroundColor: '#ffffff', width: 780 });
        const sectionHeight = (section.offsetHeight * innerWidth) / section.offsetWidth;

        // Check if section fits on current page. 
        // If it's taller than the remaining space BUT fits on a fresh page, move to new page.
        const usableHeight = pageHeight - margin;
        if (currentY + sectionHeight > usableHeight) {
          addNewPage();
        }

        pdf.addImage(sectionImg, "JPEG", margin, currentY, innerWidth, sectionHeight);
        currentY += sectionHeight + sectionGap;
      }

      // Build filename
      const buildFilename = () => {
        const cleanName = (name: string) => name.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        if (!passengers.length) return `Ticket_${flights[0]?.flightNumber || "Booking"}`;
        if (passengers.length === 1) return `${cleanName(passengers[0].name)}_ETicket`;
        const firstName = cleanName(passengers[0].name);
        const depDate = (flights[0]?.departure?.date || "").replace(/,/g, "").replace(/\s+/g, "_");
        return `${firstName}_and_${passengers.length - 1}_more${depDate ? "_" + depDate : ""}`;
      };

      // Draw watermark on top of all pages
      if (watermark) {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.addImage(watermark.dataUrl, "PNG", watermark.x, watermark.y, watermark.w, watermark.h);
        }
      }

      pdf.save(`${buildFilename()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleDownloadPdf}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Download E-Ticket (PDF)
        </Button>
      </div>

      <div style={{ position: "absolute", left: "-9999px", top: "0px", width: "860px", zIndex: -1, pointerEvents: "none" }}>
        <TicketTemplate
          ref={printRef}
          flights={flights.length > 0
            ? flights.map((f: any) => ({
              airline: f.airline || "Airline",
              flightNumber: f.flightNumber || "F-000",
              from: f.from || "Origin",
              to: f.to || "Destination",
              departure: {
                time: f.departure?.time || "00:00",
                date: f.departure?.date || "Date",
                airport: f.departure?.airport || "Airport",
                terminal: f.departure?.terminal,
              },
              arrival: {
                time: f.arrival?.time || "00:00",
                date: f.arrival?.date || "Date",
                airport: f.arrival?.airport || "Airport",
                terminal: f.arrival?.terminal,
              },
              duration: f.duration || "0h 0m",
              pnr: f.pnr || booking.pnr || "",
              cabinClass: f.fareType || "Economy"
            }))
            : []
          }
          passengers={passengers.length > 0
            ? passengers.map((p: any) => ({
              name: p.name || "Passenger Name",
              ticketNo: p.ticketNo || "Ticket Number",
              baggage: p.baggage || "15 Kg",
              handBaggage: p.handBaggage || "7kg"
            }))
            : []
          }
          bookingDetails={{
            date: booking.bookingDate || new Date().toLocaleDateString("en-GB", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
            referenceId: referenceId
          }}
          gstDetails={{
            name: "GOLDEN TRAVELS",
            no: "32GSDPM8932C1ZT",
            address: "16/580C KIZHISSERI KERALA",
            email: "MKFAHIZ@GMAIL.COM",
            phone: "8089794927"
          }}
          fareDetails={fare}
        />
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-center text-gray-500 text-sm">PDF generation will capture the exact layout shown in the template.</p>
      </div>
    </div>
  );
}
