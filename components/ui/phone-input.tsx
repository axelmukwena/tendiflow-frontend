"use client";

import "react-phone-number-input/style.css";

import { forwardRef } from "react";
import RPNInput, {
  Country,
  DefaultInputComponentProps,
  Props as RPNProps,
  Value,
} from "react-phone-number-input";

import { mergeTailwind } from "@/utilities/helpers/tailwind";

export type PhoneInputProps = Omit<
  RPNProps<DefaultInputComponentProps>,
  "onChange" | "value"
> & {
  value?: string;
  onChange: (value: Value | undefined) => void;
  defaultCountry?: Country;
  className?: string;
};

// Internal type that satisfies the library's required onChange signature.
type RPNInputProps = RPNProps<DefaultInputComponentProps>;

/**
 * Phone number input with country picker. Outputs E.164 strings on change.
 *
 * Wraps react-phone-number-input so the country dropdown + flag stays
 * inside the same rounded-md container as the rest of the form's Input
 * components. Default country is Namibia (NA); the library still allows
 * picking any country via the dropdown.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, defaultCountry = "NA", onChange, value, ...rest }, ref) => {
    const rpnProps: RPNInputProps = {
      ...(rest as Omit<RPNInputProps, "onChange" | "value">),
      value: value as Value | undefined,
      onChange: onChange as RPNInputProps["onChange"],
    };

    return (
      <RPNInput
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        international
        defaultCountry={defaultCountry}
        countryCallingCodeEditable={false}
        className={mergeTailwind(
          // Match the components/ui/input.tsx baseline so PhoneInput sits in
          // a form alongside Input without visual drift.
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // The library renders <select><input>. Strip default borders/padding on
          // the inner input so only the outer container shows the ring.
          "[&_input]:bg-transparent [&_input]:outline-none [&_input]:flex-1 [&_input]:min-w-0",
          // The country select shows a flag + caret; keep it compact.
          "[&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:gap-1",
          className,
        )}
        {...rpnProps}
      />
    );
  },
);
PhoneInput.displayName = "PhoneInput";
