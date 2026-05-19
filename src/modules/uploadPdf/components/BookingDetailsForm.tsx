"use client";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useBookingStore } from "@/store/useBookingStore";

export default function BookingDetailsForm() {
  const { booking, updateBooking } = useBookingStore();

  return (
    <ComponentCard childClassName="space-y-4" title="Booking Details">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Airline PNR / Booking Ref</Label>
          <Input
            placeholder="e.g. A74C7Z"
            value={booking.pnr}
            onChange={(e) => updateBooking({ pnr: e.target.value })}
          />
        </div>

        <div>
          <Label>Booking Date &amp; Time</Label>
          <Input
            placeholder="e.g. Tue, 19 May, 2026"
            value={booking.bookingDate}
            onChange={(e) => updateBooking({ bookingDate: e.target.value })}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
