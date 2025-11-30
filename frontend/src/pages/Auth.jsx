import { useMemo, useState } from "react";
import neonImg from "../assets/neon.jpg";
import { login, register } from "../lib/api";
import { useToast } from "../components/Toaster";

function isEmail(x) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x).trim());
}

export default function Auth({ onAuthed }) {
  const { push } = useToast();
  const [mode, setMode] = useState("login"); // login | register
  const isLogin = useMemo(() => mode === "login", [mode]);

  const [form, setForm] = useState({
    name: "",
    email: "admin@demo.com",
    password: "12345678",
    password_confirmation: "12345678",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    const email = form.email.trim();
    if (!isEmail(email)) return setErr("✔️ Escribe un correo válido.");
    if (String(form.password).length < 6) return setErr("✔️ La contraseña debe tener mínimo 6 caracteres.");

    if (!isLogin) {
      if (!form.name.trim()) return setErr("✔️ El nombre es obligatorio.");
      if (form.password !== form.password_confirmation) return setErr("✔️ Las contraseñas no coinciden.");
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, form.password);
        push({ type: "success", title: "Bien", msg: "Sesión iniciada." });
      } else {
        await register(form.name.trim(), email, form.password, form.password_confirmation);
        push({ type: "success", title: "Listo", msg: "Cuenta creada." });
      }
      onAuthed?.();
    } catch (e2) {
      setErr(e2?.message || "Error.");
      push({ type: "error", title: "Error", msg: e2?.message || "No se pudo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* background */}
      <img src={neonImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_55%)]" />

      {/* center */}
      <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl shadow-[0_0_60px_rgba(249,115,22,0.16)]">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    {isLogin ? "Acceso" : "Registro"}
                  </h1>
                  <p className="mt-1 text-sm text-white/70">
                    {isLogin ? "Ingresa para gestionar proveedores" : "Crea tu cuenta en segundos"}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-extrabold text-orange-300">
                  TQSoft
                </div>
              </div>

              {err && (
                <div className="mt-4 rounded-2xl border border-orange-400/25 bg-orange-400/10 px-4 py-2 text-sm text-orange-200">
                  {err}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-white/70">Nombre</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
                      placeholder="Tu nombre"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-white/70">Correo</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
                    placeholder="tu@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70">Contraseña</label>
                  <div className="mt-2 relative">
                    <input
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      type={show ? "text" : "password"}
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 pr-16 text-white outline-none placeholder:text-white/30 focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute inset-y-0 right-2 my-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-extrabold text-orange-300 hover:bg-white/10"
                    >
                      {show ? "OCULTAR" : "VER"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-white/55">
                    <span>🔒 Seguridad primero</span>
                    <span className="text-orange-300/90">¿Olvidaste tu contraseña?</span>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-white/70">Confirmar contraseña</label>
                    <input
                      value={form.password_confirmation}
                      onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                      type="password"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {/* Primary */}
                <button
                  disabled={loading}
                  className="w-full rounded-2xl bg-orange-400 py-3.5 font-extrabold text-black shadow-[0_0_30px_rgba(249,115,22,0.25)] transition hover:brightness-105 disabled:opacity-60"
                >
                  {loading ? "Procesando..." : isLogin ? "Ingresar" : "Registrarse"}
                </button>

                {/* Secondary */}
                <button
                  type="button"
                  onClick={() => setMode(isLogin ? "register" : "login")}
                  className="w-full rounded-2xl border border-orange-400/35 bg-transparent py-3.5 font-extrabold text-orange-300 hover:bg-orange-400/10"
                >
                  {isLogin ? "Crear cuenta" : "Ya tengo cuenta"}
                </button>

                {isLogin && (
                  <p className="pt-1 text-center text-xs text-white/55">
                    Demo: <span className="text-orange-200">admin@demo.com</span> /{" "}
                    <span className="text-orange-200">12345678</span>
                  </p>
                )}
              </form>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-white/45">
            Consejo: primero prueba <span className="text-orange-300">Ingresar</span> con el demo.
          </p>
        </div>
      </div>
    </div>
  );
}

