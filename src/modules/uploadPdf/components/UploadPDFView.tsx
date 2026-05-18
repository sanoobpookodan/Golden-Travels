"use client";
import { useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PassengerDetailsForm from "./PassengerDetailsForm";

import { flightDetails, passengerDetails } from "@/constants/db";
import { useFlightStore } from "@/store/useFlightStore";
import { usePassengerStore } from "@/store/usePassengerStore";
import FlightDetailsForm from "./FlightDetailsForm";
import FareDetailsForm from "./FareDetailsForm";
import UploadFile from "./UploadFile";
import { IS_DEV } from "@/constants/data";

import PdfGenerator from "../../PdfGenerator/components/PdfGenerator";
import AIProcessing from "../../ai-extraction/components/AIProcessing";

export default function UploadPDFView() {
  const { setPassengers } = usePassengerStore();
  const { setFlights } = useFlightStore();

  useEffect(() => {
    // Start with empty stores so only real extracted data is shown
    setPassengers([]);
    setFlights([]);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ComponentCard className="xl:col-span-3 sm:col-span-3" title={"PDFs Management"}>
        <div className="mb-6">
          <AIProcessing />
        </div>
        <div className="border-t pt-6">
          <UploadFile />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
          <PassengerDetailsForm />
          <FlightDetailsForm />
        </div>
        <div className="mt-6">
          <FareDetailsForm />
        </div>
        
        {/* PDF Generator Component */}
        <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Finalize & Generate Ticket</h3>
            <PdfGenerator />
        </div>
      </ComponentCard>
    </div>
  );
}
