import { createContext, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const api = useMemo(
    () => ({
      push: ({ type = "info", title = "Info", msg = "" }) => {
        const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
        const t = { id, type, title, msg };
        setItems((x) => [t, ...x].slice(0, 4));
        setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2800);
      },
    }),
    []
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-[9999] space-y-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "w-[320px] max-w-[90vw] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl",
              "bg-black/70 border-white/10 text-white",
              t.type === "success" ? "shadow-[0_0_30px_rgba(16,185,129,0.12)]" : "",
              t.type === "error" ? "shadow-[0_0_30px_rgba(239,68,68,0.12)]" : "",
              t.type === "info" ? "shadow-[0_0_30px_rgba(249,115,22,0.10)]" : "",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold">
                  {t.type === "success" ? "✅ " : t.type === "error" ? "⛔ " : "ℹ️ "}
                  {t.title}
                </div>
                {t.msg ? <div className="mt-1 text-xs text-white/70">{t.msg}</div> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const v = useContext(ToastCtx);
  if (!v) throw new Error("useToast debe usarse dentro de <ToastProvider />");
  return v;
}
