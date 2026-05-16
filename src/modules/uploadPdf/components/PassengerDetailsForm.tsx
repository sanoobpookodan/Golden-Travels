import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { usePassengerStore } from "@/store/usePassengerStore";

export default function PassengerDetailsForm() {
  const { passengers, updatePassenger, removePassenger, addPassenger } = usePassengerStore();

  return (
    <ComponentCard childClassName="space-y-1 " title="Passenger Details">
      <div className="space-y-3">
        {passengers.map((item, index) => (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0" key={index}>
            <div className="md:col-span-4">
              <Label>Passenger {index + 1}</Label>
              <Input
                placeholder="Name"
                value={item.name}
                onChange={(e) => updatePassenger(item.id, { name: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <Label>Ticket No</Label>
              <Input
                placeholder="Ticket No"
                value={item.ticketNo}
                onChange={(e) => updatePassenger(item.id, { ticketNo: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Check-in</Label>
              <Input
                placeholder="e.g. 15 Kg"
                value={item.baggage}
                onChange={(e) => updatePassenger(item.id, { baggage: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Hand Bag</Label>
              <Input
                placeholder="e.g. 7 Kg"
                value={item.handBaggage}
                onChange={(e) => updatePassenger(item.id, { handBaggage: e.target.value })}
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button 
                onClick={() => removePassenger(item.id)} 
                className="w-full bg-red-500 hover:bg-red-600 text-white p-2.5 h-11"
              >
                -
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-end  justify-end">
          <Button onClick={addPassenger}>+</Button>
        </div>
      </div>
    </ComponentCard>
  );
}
