"use client";

import React, { ButtonHTMLAttributes, useState } from "react";
import Spinner from "./Spinner";

type Variant = "primary" | "danger" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<any>;
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  onClick,
  disabled,
  ...rest
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    try {
      const res = onClick?.(e);
      if (res && typeof (res as Promise<any>).then === "function") {
        setLoading(true);
        await res;
      }
    } finally {
      setLoading(false);
    }
  };

  const base = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded disabled:opacity-60";

  // use centralized CSS token classes defined in globals.css
  const variants: Record<Variant, string> = {
    primary: "btn-primary",
    danger: "btn-danger",
    outline: "btn-outline",
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      aria-busy={loading}
    >
      {loading ? <Spinner size={16} /> : null}
      <span>{children}</span>
    </button>
  );
}
