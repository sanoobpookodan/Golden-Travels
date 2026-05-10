"use client";
import React, { useRef } from "react";
import { domToPng } from "modern-screenshot";
import jsPDF from "jspdf";
import TicketTemplate from "./TicketTemplate";
import Button from "@/components/ui/button/Button";
import { useFlightStore } from "@/store/useFlightStore";
import { usePassengerStore } from "@/store/usePassengerStore";

export default function PdfGenerator() {
  const { flights } = useFlightStore();
  const { passengers } = usePassengerStore();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const imgData = await domToPng(element, {
        scale: 2,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // 10mm margin
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;

      let heightLeft = imgHeight;
      let position = margin; // Start with top margin

      // Add the first page
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - (margin * 2));

      // If content is longer than one page, add more pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - (margin * 2));
      }

      pdf.save(`Ticket_${flights[0]?.flightNumber || "Booking"}.pdf`);
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

      <div className="overflow-hidden h-0 w-0 opacity-0 pointer-events-none">
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
                pnr: f.pnr || "A74C7Z",
                cabinClass: f.fareType || "Economy"
              }))
            : [{
                airline: "Indigo",
                flightNumber: "6E-2124",
                from: "Kochi",
                fromCode: "COK",
                to: "Bangalore",
                toCode: "BLR",
                departure: { time: "10:30", date: "Wed, 08 Apr, 2026", airport: "Cochin International Airport", terminal: "T1" },
                arrival: { time: "11:45", date: "Wed, 08 Apr, 2026", airport: "Kempegowda Int'l Airport", terminal: "T2" },
                duration: "1h 15m",
                pnr: "A74C7Z",
                cabinClass: "Economy"
              }]
          }
          passengers={passengers.length > 0 
            ? passengers.map((p: any) => ({
                name: p.name || "Passenger Name",
                ticketNo: p.ticketNo || "Ticket Number",
                baggage: p.baggage || "15 Kg",
                handBaggage: p.handBaggage || "7kg"
              }))
            : [{
                name: "MR. GUEST PASSENGER",
                ticketNo: "6E-226387",
                baggage: "15 Kg",
                handBaggage: "7kg"
              }]
          }
          bookingDetails={{
            date: new Date().toLocaleDateString("en-GB", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
            referenceId: `GT${Math.floor(1000000 + Math.random() * 9000000)}`
          }}
          gstDetails={{
            name: "GOLDEN TRAVELS",
            no: "32GSDPM8932C1ZT",
            address: "16/580C KIZHISSERI KERALA",
            email: "MKFAHIZ@GMAIL.COM",
            phone: "8089794927"
          }}
          fareDetails={{
            base: "2,533.00",
            tax: "1,092.70",
            misc: "1,600.00",
            total: "5,225.70"
          }}
        />
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-center text-gray-500 text-sm">PDF generation will capture the exact layout shown in the template.</p>
      </div>
    </div>
  );
}
