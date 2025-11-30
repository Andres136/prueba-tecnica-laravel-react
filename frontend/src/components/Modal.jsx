import { cls } from "../lib/utils";

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998]">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
        aria-label="Cerrar modal"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cls(
            "w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10",
            "bg-zinc-950/70 backdrop-blur-xl shadow-[0_0_60px_rgba(249,115,22,0.10)]"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="text-sm font-extrabold text-white">{title}</div>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-extrabold text-white hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
