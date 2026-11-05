import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Label({
  className,
  children,
  htmlFor,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { htmlFor: string }) {
  return (
    <label
      className={cn("font-medium text-sm leading-none", className)}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  );
}

export { Label };
