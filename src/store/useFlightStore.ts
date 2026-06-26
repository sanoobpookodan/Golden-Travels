import { create } from "zustand";

export interface FlightDetails {
  id: string; // unique key (important)
  from: string;
  to: string;

  departure?: {
    time: string;
    date: string;
    airport: string;
    terminal?: string;
  };

  arrival?: {
    time: string;
    date: string;
    airport: string;
    terminal?: string;
  };

  duration?: string;
  stops?: string;

  aircraft?: string;
  airline?: string;
  flightNumber?: string;
  pnr?: string;

  fareType?: string;
  baggage?: {
    checked?: string;
  };

  status?: string;
}

interface FlightStore {
  flights: FlightDetails[];
  addFlight: () => void;
  updateFlight: (id: string, updated: Partial<FlightDetails>) => void;
  removeFlight: (id: string) => void;
  setFlights: (flights: FlightDetails[]) => void;
  clearFlights: () => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  flights: [],

  addFlight: () =>
    set((state) => ({
      flights: [
        ...state.flights,
        {
          from: "",
          to: "",
          departure: { time: "", date: "", airport: "", terminal: "" },
          arrival: { time: "", date: "", airport: "", terminal: "" },
          id: crypto.randomUUID(),
          duration: "",
          stops: "",
          aircraft: "",
          airline: "",
          flightNumber: "",
          pnr: "",
          fareType: "",
          baggage: { checked: "" },
          status: "",
        },
      ],
    })),

  updateFlight: (id, updated) =>
    set((state) => ({
      flights: state.flights.map((f) => (f.id === id ? { ...f, ...updated } : f)),
    })),

  removeFlight: (id) =>
    set((state) => ({
      flights: state.flights.filter((f) => f.id !== id),
    })),

  setFlights: (flights) =>
    set(() => ({
      flights,
    })),

  clearFlights: () =>
    set(() => ({
      flights: [],
    })),
}));
