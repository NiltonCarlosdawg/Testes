import setCurrencyFormat from "@/hooks/setCurrency";
import clsx from "clsx";
import { FC } from "react";

export interface PricesProps {
  className?: string;
  price: number;
  currency?: string;
  contentClass?: string;
  locale?: string;
}

const Prices: FC<PricesProps> = ({
  className,
  price,
  contentClass,
}) => {


  return (
    <div className={clsx(className)}>
      <div
        className={clsx(
          "flex items-center rounded-lg border-2 border-green-500 py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium",
          contentClass
        )}
      >
        <span aria-label="Preço">{setCurrencyFormat(price)}</span>
      </div>
    </div>
  );
};

export default Prices;
