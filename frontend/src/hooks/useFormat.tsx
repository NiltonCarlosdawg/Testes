import React, { useState } from "react";

export const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  let suffix = "";
  let divisor = 1;

  if (absValue >= 1000000000) {
    suffix = 'B';
    divisor = 1000000000;
  } else if (absValue >= 1000000) {
    suffix = 'M';
    divisor = 1000000;
  } else if (absValue >= 1000) {
    suffix = 'K';
    divisor = 1000;
  }
  
  const formattedValue = (value / divisor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return suffix ? `${formattedValue}${suffix}` : formattedValue;
};


export interface ResponsiveValueProps {
  value: number;
  formatFn?: (value: number) => string;
}

export const useFormat = () => {

  const ResponsiveValue: React.FC<ResponsiveValueProps> = ({
    value,
    formatFn = formatCurrency,
  }) => {
    const [showFull, setShowFull] = useState(false);

    const formattedFull = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "AOA",
    });

    return (
      <span
        className="cursor-help transition-all duration-200 hover:text-primary"
        onMouseEnter={() => setShowFull(true)}
        onMouseLeave={() => setShowFull(false)}
        title={formattedFull}
      >
        {showFull ? formattedFull : formatFn(value)}
      </span>
    );
  };

  return { ResponsiveValue };
};
