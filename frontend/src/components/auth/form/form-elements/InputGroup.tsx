import Label from "../Label";
import Input from "../input/InputField";
import PhoneInput from "../group-input/PhoneInput";
import { Card } from "@/components/ui/card";
import { EnvelopeIcon } from "@heroicons/react/24/solid";

export default function InputGroup() {
  const countries = [
    { code: "AOA", label: "+244" },
    { code: "PT", label: "+351" },
    { code: "BR", label: "+55" },
  ];
  const handlePhoneNumberChange = () => {
  };
  return (
    <Card title="Input Group">
      <div className="space-y-6">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Input
              placeholder="info@gmail.com"
              type="text"
              className="pl-[62px]"
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon className="size-6" />
            </span>
          </div>
        </div>
        <div>
          <Label>Telefone</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            placeholder="+244 999-999-999"
            onChange={handlePhoneNumberChange}
          />
        </div>{" "}
        <div>
          <Label>Telefone</Label>
          <PhoneInput
            selectPosition="end"
            countries={countries}
            placeholder="+244 999-999-999"
            onChange={handlePhoneNumberChange}
          />
        </div>
      </div>
    </Card>
  );
}
