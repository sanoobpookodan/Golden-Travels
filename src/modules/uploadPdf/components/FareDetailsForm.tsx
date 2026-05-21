"use client";
import { useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useFareStore } from "@/store/useFareStore";

export default function FareDetailsForm() {
  const { fare, setFare } = useFareStore();

  useEffect(() => {
    const base = parseFloat(fare.base?.toString().replace(/,/g, "")) || 0;
    const tax  = parseFloat(fare.tax?.toString().replace(/,/g, ""))  || 0;
    const total = (base + tax).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    
    if (total !== fare.total) {
      setFare({ ...fare, total });
    }
  }, [fare.base, fare.tax]);

  const handleChange = (field: "base" | "tax" | "total", value: string) => {
    setFare({ ...fare, [field]: value });
  };

  return (
    <ComponentCard childClassName="space-y-4" title="Fare Details">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Base Price (INR)</Label>
          <Input
            placeholder="e.g. 5000.00"
            value={fare.base}
            onChange={(e) => handleChange("base", e.target.value)}
          />
        </div>

        <div>
          <Label>Airline Taxes &amp; Fees (INR)</Label>
          <Input
            placeholder="e.g. 1200.00"
            value={fare.tax}
            onChange={(e) => handleChange("tax", e.target.value)}
          />
        </div>

        <div>
          <Label>
            Total Amount (INR)
            <span className="ml-1.5 text-xs font-normal text-brand-500">
              (auto-calculated)
            </span>
          </Label>
          <div className="relative">
            <Input
              placeholder="0.00"
              value={fare.total}
              onChange={(e) => handleChange("total", e.target.value)}
              className="text-gray-800 dark:text-white font-semibold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              INR
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg flex items-center justify-between">
        <p className="text-xs text-blue-500 dark:text-blue-400">
          Total = Base + Taxes — reflected in the generated PDF.
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 font-bold whitespace-nowrap ml-4">
          INR {fare.total || "0.00"}
        </p>
      </div>
    </ComponentCard>
  );
}
