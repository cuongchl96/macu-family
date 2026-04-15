import React, { forwardRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export interface FormattedNumberInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value' | 'type'> {
  value?: number;
  onChange?: (value?: number) => void;
  allowDecimal?: boolean;
}

export const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ value, onChange, allowDecimal = true, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (value === undefined || value === null || Number.isNaN(value)) {
        if (displayValue !== "") setDisplayValue("");
        return;
      }
      const parsedInternal = parseFloat(displayValue.replace(/,/g, ""));
      if (parsedInternal !== value) {
        setDisplayValue(value.toLocaleString("en-US", { maximumFractionDigits: 10 }));
      }
    }, [value, displayValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value;
      
      if (rawValue === "") {
        setDisplayValue("");
        onChange?.(undefined);
        return;
      }

      let sanitized = allowDecimal 
        ? rawValue.replace(/[^0-9.]/g, "") 
        : rawValue.replace(/[^0-9]/g, "");

      if (allowDecimal) {
        const parts = sanitized.split(".");
        if (parts.length > 2) {
            sanitized = parts[0] + "." + parts.slice(1).join("");
        }
      }

      if (sanitized === ".") {
        setDisplayValue("0.");
        onChange?.(0);
        return;
      }

      const parts = sanitized.split(".");
      const integerPart = parts[0];
      const decimalPart = parts.length > 1 ? "." + parts[1] : "";

      if (integerPart) {
        const cleanInteger = integerPart.replace(/^0+(?=\d)/, '');
        const formattedInteger = parseInt(cleanInteger || "0", 10).toLocaleString("en-US");
        setDisplayValue(formattedInteger + decimalPart);
      } else {
         setDisplayValue(sanitized);
      }

      const parsedNumber = parseFloat(sanitized);
      if (!Number.isNaN(parsedNumber)) {
        onChange?.(parsedNumber);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={displayValue}
        onChange={handleChange}
      />
    );
  }
);
FormattedNumberInput.displayName = "FormattedNumberInput";
