import { create } from "zustand";

export interface BookingDetails {
  pnr: string;
  bookingDate: string;
}

interface BookingStore {
  booking: BookingDetails;
  setBooking: (booking: BookingDetails) => void;
  updateBooking: (updated: Partial<BookingDetails>) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  booking: {
    pnr: "A74C7Z",
    bookingDate: new Date().toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  },
  setBooking: (booking) => set({ booking }),
  updateBooking: (updated) =>
    set((state) => ({
      booking: { ...state.booking, ...updated },
    })),
}));
