import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

type Option = {
  value: number | string;
  label: string;
};

type Props = {
  value: number | string | null;
  onChange: (val: any) => void;
  options: Option[];
  placeholder?: string;
  // New customization props
  className?: string;
  roundedLeft?: boolean;
  roundedRight?: boolean;
  border?: boolean;
};

export default function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  className = "",
  roundedLeft = true,
  roundedRight = true,
  border = true,
}: Props) {
  const selected = options.find((o) => o.value === value);

  let radiusClass = "";
  if (roundedLeft && roundedRight) radiusClass = "rounded-figma-md";
  else if (roundedLeft) radiusClass = "rounded-l-figma-md";
  else if (roundedRight) radiusClass = "rounded-r-figma-md";
  else radiusClass = "";

  const borderClass = border ? "border border-gray-300" : "";

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full">
        <Listbox.Button
          className={`w-full px-3 py-2 bg-tersier text-white flex justify-between items-center ${radiusClass} ${borderClass} ${className}`}
        >
          {selected?.label || placeholder}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 w-full rounded-figma-md bg-tersier shadow-lg z-10">
          {options.map((o) => (
            <Listbox.Option
              key={o.value}
              value={o.value}
              className={({ active }) =>
                `cursor-pointer px-3 py-2 ${active ? "bg-sekunder text-white" : "text-white"}`
              }
            >
              {o.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}