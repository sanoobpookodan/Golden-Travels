"use client";
import React, { useRef } from "react";
import { domToPng } from "modern-screenshot";
import jsPDF from "jspdf";
import TicketTemplate from "./TicketTemplate";
import Button from "@/components/ui/button/Button";
import { useFlightStore } from "@/store/useFlightStore";
import { usePassengerStore } from "@/store/usePassengerStore";
import { useFareStore } from "@/store/useFareStore";

export default function PdfGenerator() {
  const { flights } = useFlightStore();
  const { passengers } = usePassengerStore();
  const { fare } = useFareStore();
  const printRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const referenceId = React.useMemo(() => `GT${Math.floor(1000000 + Math.random() * 9000000)}`, []);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    const headerEl = headerRef.current;
    if (!element) return;

    try {
      // Capture full ticket content
      const imgData = await domToPng(element, { scale: 2 });

      // Capture header separately (for repeating on subsequent pages)
      let headerImgData: string | null = null;
      let headerHeightMm = 0;
      if (headerEl) {
        headerImgData = await domToPng(headerEl, { scale: 2 });
        headerHeightMm = (headerEl.offsetHeight * (190 / element.offsetWidth));
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth   = 210;
      const pageHeight  = 297;
      const margin      = 10;
      const headerGap   = 4; // gap between header and content on pages 2+
      const imgWidth    = pageWidth - margin * 2;
      const imgHeight   = (element.offsetHeight * imgWidth) / element.offsetWidth;

      // Page 1: full usable area (no repeated header)
      const page1Usable = pageHeight - margin * 2;

      // Pages 2+: less space because header takes the top
      const pageNUsable = page1Usable - headerHeightMm - headerGap;

      // ── Page 1 ──
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);

      // ── Calculate total pages needed ──
      // Page 1 shows [0 .. page1Usable] of content
      // Page 2 shows [page1Usable .. page1Usable + pageNUsable], etc.
      let contentConsumed = page1Usable;
      let page = 2;
      while (contentConsumed < imgHeight) {
        pdf.addPage();

        // Stamp the header at the top
        if (headerImgData) {
          pdf.addImage(headerImgData, "PNG", margin, margin, imgWidth, headerHeightMm);
        }

        // Where content starts on this page (below header)
        const contentStartY = margin + headerHeightMm + headerGap;

        // imgY: position the image so the correct slice appears at contentStartY
        // The image has already scrolled by `contentConsumed` mm
        const imgY = contentStartY - contentConsumed;
        pdf.addImage(imgData, "PNG", margin, imgY, imgWidth, imgHeight);

        contentConsumed += pageNUsable;
        page++;
      }

      // Build a clean filename from passenger names
      const buildFilename = () => {
        const cleanName = (name: string) =>
          name.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

        if (passengers.length === 0) {
          return `Ticket_${flights[0]?.flightNumber || "Booking"}`;
        }

        if (passengers.length === 1) {
          return `${cleanName(passengers[0].name) || "Passenger"}_ETicket`;
        }

        const firstName  = cleanName(passengers[0].name) || "Passengers";
        const extraCount = passengers.length - 1;
        const depDate    = (flights[0]?.departure?.date || "")
          .replace(/,/g, "").replace(/\s+/g, "_");
        return depDate
          ? `${firstName}_and_${extraCount}_more_${depDate}`
          : `${firstName}_and_${extraCount}_more`;
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
          headerRef={headerRef}
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
                pnr: f.pnr || "A74C7Z",
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
            date: new Date().toLocaleDateString("en-GB", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
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
