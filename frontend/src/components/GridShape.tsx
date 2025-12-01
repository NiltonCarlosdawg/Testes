import Image from "next/image";

export default function GridShape() {
  return (
    <>
      <div className="absolute right-0 top-0 -z-10 w-[250px] xl:w-[450px] h-[250px] xl:h-[450px]">
        <Image
          src="/images/shape/grid-01.svg"
          alt="grid"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className="absolute bottom-0 left-0 -z-10 w-[250px] xl:w-[450px] h-[250px] xl:h-[450px] rotate-180">
        <Image
          src="/images/shape/grid-01.svg"
          alt="grid"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    </>
  );
}
