import { create } from "zustand";

export interface FareDetails {
  base: string;
  tax: string;
  misc: string;
  total: string;
}

interface FareStore {
  fare: FareDetails;
  setFare: (fare: FareDetails) => void;
}

export const useFareStore = create<FareStore>((set) => ({
  fare: {
    base: "0.00",
    tax: "0.00",
    misc: "0.00",
    total: "0.00",
  },
  setFare: (fare) => set({ fare }),
}));
