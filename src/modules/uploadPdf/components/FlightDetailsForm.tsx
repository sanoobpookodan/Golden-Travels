import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useFlightStore } from "@/store/useFlightStore";

export default function FlightDetailsForm() {
  const { flights, updateFlight, removeFlight, addFlight } = useFlightStore();

  return (
    <ComponentCard childClassName="space-y-1 " title="Flight Details">
      <div className="space-y-5">
        {flights.map((item) => (
          <div className="grid grid-cols-3 gap-2 mb-4" key={item.id}>
            <div className="xl:col-span-1 ">
              <div>
                <Label>From</Label>
                <Input
                  placeholder="Enter from"
                  value={item?.from || ""}
                  onChange={(e) => updateFlight(item.id, { from: e.target.value })}
                />
              </div>
            </div>
            <div className="xl:col-span-1">
              <div>
                <Label>To</Label>
                <Input
                  placeholder="Enter to"
                  value={item?.to || ""}
                  onChange={(e) => updateFlight(item.id, { to: e.target.value })}
                />
              </div>
            </div>
            <div className="xl:col-span-1">
              <div>
                <Label>Duration</Label>
                <Input
                  placeholder="Enter Duration"
                  value={item?.duration || ""}
                  onChange={(e) => updateFlight(item.id, { duration: e.target.value })}
                />
              </div>
            </div>
            <div className="xl:col-span-1 ">
              <div>
                <Label>Flight Number</Label>
                <Input
                  placeholder="Enter Flight Number"
                  value={item?.flightNumber || ""}
                  onChange={(e) => updateFlight(item.id, { flightNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="xl:col-span-1 ">
              <div>
                <Label>Baggage</Label>
                <Input
                  placeholder="Enter Baggage"
                  value={item?.baggage?.checked || ""}
                  onChange={(e) => updateFlight(item.id, { baggage: { checked: e.target.value } })}
                />
              </div>
            </div>
            <div className="xl:col-span-1">
              <div>
                <Label>Departure Date</Label>
                <Input
                  placeholder="Enter departure date"
                  value={item?.departure?.date || ""}
                  onChange={(e) =>
                    updateFlight(item.id, {
                      departure: { ...(item.departure || {}), date: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="xl:col-span-1">
              <div>
                <Label>Departure Time</Label>
                <Input
                  placeholder="Enter departure time"
                  value={item?.departure?.time || ""}
                  onChange={(e) =>
                    updateFlight(item.id, {
                      departure: { ...(item.departure || {}), time: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="xl:col-span-1">
              <div>
                <Label>Arrival Date</Label>
                <Input
                  placeholder="Enter arrival date"
                  value={item?.arrival?.date || ""}
                  onChange={(e) =>
                    updateFlight(item.id, {
                      arrival: { ...(item.arrival || {}), date: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="xl:col-span-1 flex items-end gap-2">
              <div>
                <Label>Arrival Time</Label>
                <Input
                  placeholder="Enter arrival time"
                  value={item?.arrival?.time || ""}
                  onChange={(e) =>
                    updateFlight(item.id, {
                      arrival: { ...(item.arrival || {}), time: e.target.value },
                    })
                  }
                />
              </div>
              <Button onClick={() => removeFlight(item.id)}>-</Button>
            </div>
          </div>
        ))}
        <div className="flex items-end  justify-end">
          <Button onClick={addFlight}>+</Button>
        </div>
      </div>
    </ComponentCard>
  );
}
