import React from "react";

type PopupProps = {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
};

export default function Popup({ open, onClose, size = "md", children }: PopupProps) {
  if (!open) return null;

  // responsive size
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className={`${sizeClasses[size]} w-auto`}
        style={{
            background: "white",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
        >
        {children}
        </div>
    </div>
  );
}