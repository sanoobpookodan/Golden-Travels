"use client";
import React, { useRef } from "react";
import { domToPng } from "modern-screenshot";
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
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const innerWidth = pageWidth - margin * 2;
      const headerGap = 4;

      // 2. Capture header once
      const headerImg = await domToPng(headerEl, { scale: 2 });
      const headerHeight = (headerEl.offsetHeight * innerWidth) / headerEl.offsetWidth;

      let currentY = margin;
      const sectionGap = 2; // small gap between captured sections

      const addNewPage = () => {
        pdf.addPage();
        pdf.addImage(headerImg, "PNG", margin, margin, innerWidth, headerHeight);
        currentY = margin + headerHeight + headerGap;
      };

      // Start first page with header
      pdf.addImage(headerImg, "PNG", margin, margin, innerWidth, headerHeight);
      currentY = margin + headerHeight + headerGap;

      // 3. Capture and place each section
      for (const section of sections) {
        const sectionImg = await domToPng(section, { scale: 2 });
        const sectionHeight = (section.offsetHeight * innerWidth) / section.offsetWidth;

        // Check if section fits on current page. 
        // If it's taller than the remaining space BUT fits on a fresh page, move to new page.
        const usableHeight = pageHeight - margin;
        if (currentY + sectionHeight > usableHeight) {
          addNewPage();
        }

        pdf.addImage(sectionImg, "PNG", margin, currentY, innerWidth, sectionHeight);
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

      <div style={{ position: "fixed", left: "-9999px", top: "-9999px", zIndex: -1, pointerEvents: "none" }}>
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
              pnr: booking.pnr || f.pnr || "A74C7Z",
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
