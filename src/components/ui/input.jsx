import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border px-3 py-2 outline-none transition ${className}`}
      {...props}
    />
  );
}
