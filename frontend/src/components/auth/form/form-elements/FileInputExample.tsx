import { Card } from "@/components/ui/card";
import FileInput from "../input/FileInput";
import Label from "../Label";

export default function FileInputExample() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.files?.[0];
  };

  return (
    <Card title="File Input">
      <div>
        <Label>Carregar arquivo</Label>
        <FileInput onChange={handleFileChange} className="custom-class" />
      </div>
    </Card>
  );
}
