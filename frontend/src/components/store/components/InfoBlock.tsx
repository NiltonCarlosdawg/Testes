"use client";

import { FC } from "react";

interface InfoBlockProps {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}

const InfoBlock: FC<InfoBlockProps> = ({
  icon: Icon,
  label,
  value,
  children,
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
    <div className="w-full">
      <label className="block text-sm font-medium text-muted-foreground mb-1">
        {label}
      </label>
      <div className="text-sm text-foreground break-words">
        {value || children || "N/A"}
      </div>
    </div>
  </div>
);

export default InfoBlock;