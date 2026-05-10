"use client";
import { useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PassengerDetailsForm from "./PassengerDetailsForm";

import { flightDetails, passengerDetails } from "@/constants/db";
import { useFlightStore } from "@/store/useFlightStore";
import { usePassengerStore } from "@/store/usePassengerStore";
import FlightDetailsForm from "./FlightDetailsForm";
import UploadFile from "./UploadFile";
import { IS_DEV } from "@/constants/data";

import PdfGenerator from "../../PdfGenerator/components/PdfGenerator";

export default function UploadPDFView() {
  const { setPassengers } = usePassengerStore();
  const { setFlights } = useFlightStore();

  useEffect(() => {
    setPassengers(IS_DEV ? passengerDetails : []);
    setFlights(IS_DEV ? flightDetails : []);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ComponentCard className="xl:col-span-3 sm:col-span-3" title={"PDFs Management"}>
        <UploadFile />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
          <PassengerDetailsForm />
          <FlightDetailsForm />
        </div>
        
        {/* PDF Generator Component */}
        <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Finalize & Generate Ticket</h3>
            <PdfGenerator />
        </div>
      </ComponentCard>
    </div>
  );
}
