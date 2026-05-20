import React from "react";

export function Button({ className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
