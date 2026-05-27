import { useEffect, type ReactNode } from "react";

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
