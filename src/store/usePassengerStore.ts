import { create } from "zustand";

export interface PassengerDetails {
  name: string;
  ticketNo: string;
  baggage?: string;
  handBaggage?: string;
  id: number;
}

interface PassengerStore {
  passengers: PassengerDetails[];

  addPassenger: () => void;
  updatePassenger: (id: number, updated: Partial<PassengerDetails>) => void;
  removePassenger: (id: number) => void;
  setPassengers: (passengers: PassengerDetails[]) => void;
}

export const usePassengerStore = create<PassengerStore>((set) => ({
  passengers: [],

  addPassenger: () =>
    set((state) => ({
      passengers: [
        ...state.passengers,
        {
          name: "",
          ticketNo: "",
          id: Date.now(),
        },
      ],
    })),

  updatePassenger: (id, updated) =>
    set((state) => ({
      passengers: state.passengers.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    })),

  removePassenger: (id) =>
    set((state) => ({
      passengers: state.passengers.filter((p) => p.id !== id),
    })),

  setPassengers: (passengers) =>
    set(() => ({
      passengers,
    })),
}));
