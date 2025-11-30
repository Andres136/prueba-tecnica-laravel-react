import { useEffect, useMemo, useRef, useState } from "react";
import neonImg from "../assets/neon.jpg";


import {
  clearToken,
  createProvider,
  deleteProvider,
  listProviders,
  logout,
  updateProvider,
} from "../lib/api";

import { normalizeLaravelPagination, cls } from "../lib/utils";
import Modal from "../components/Modal";
import ContactsModal from "../components/ContactsModal";
import { useToast } from "../components/Toaster";

const emptyForm = {
  nit: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "active",
};

function validateProvider(f) {
  const nit = String(f.nit || "").trim();
  const name = String(f.name || "").trim();

  if (!nit) return "El NIT es obligatorio.";
  if (!name) return "El nombre es obligatorio.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.email).trim())) return "Email inválido.";
  return "";
}

export default function Providers({ onLogout }) {
  const { push } = useToast();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [openContacts, setOpenContacts] = useState(false);
  const [contactsProvider, setContactsProvider] = useState(null);

  const abortRef = useRef(null);

  const q = useMemo(
    () => ({ search: search.trim(), status }),
    [search, status]
  );

  async function load(p = page, query = q) {
    setErr("");
    setLoading(true);
    try {
      abortRef.current?.abort?.();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await listProviders(
        { page: p, perPage: 8, search: query.search, status: query.status },
        controller.signal
      );

      const pg = normalizeLaravelPagination(res);
      setRows(pg.rows);
      setPage(pg.current);
      setLastPage(pg.last);
      setTotal(pg.total);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "Error cargando proveedores.");

      if ((e?.message || "").toLowerCase().includes("no autorizado")) {
        clearToken();
        onLogout?.();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => load(1, q), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.search, q.status]);

  useEffect(() => {
    load(page, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function resetAll() {
    setSearch("");
    setStatus("");
    setPage(1);
    load(1, { search: "", status: "" });
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErr("");
    setOpenForm(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      nit: p?.nit ?? "",
      name: p?.name ?? "",
      email: p?.email ?? "",
      phone: p?.phone ?? "",
      address: p?.address ?? "",
      status: p?.status ?? "active",
    });
    setErr("");
    setOpenForm(true);
  }

  async function submitProvider(e) {
    e.preventDefault();
    setErr("");

    const msg = validateProvider(form);
    if (msg) return setErr(msg);

    setBusy(true);
    try {
      const payload = {
        nit: String(form.nit).trim(),
        name: String(form.name).trim(),
        email: String(form.email).trim() || null,
        phone: String(form.phone).trim() || null,
        address: String(form.address).trim() || null,
        status: form.status || "active",
      };

      if (editing?.id) {
        await updateProvider(editing.id, payload);
        push({ type: "success", title: "Actualizado", msg: "Proveedor actualizado." });
      } else {
        await createProvider(payload);
        push({ type: "success", title: "Creado", msg: "Proveedor creado." });
      }

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      await load(page, q);
    } catch (e2) {
      setErr(e2?.message || "No se pudo guardar.");
      push({ type: "error", title: "Error", msg: e2?.message || "No se pudo." });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(p) {
    const ok = confirm(`¿Eliminar proveedor "${p?.name ?? "Proveedor"}"?`);
    if (!ok) return;

    setBusy(true);
    try {
      await deleteProvider(p.id);
      push({ type: "success", title: "Eliminado", msg: "Proveedor eliminado." });
      await load(page, q);
    } catch (e2) {
      setErr(e2?.message || "No se pudo eliminar.");
      push({ type: "error", title: "Error", msg: e2?.message || "No se pudo." });
    } finally {
      setBusy(false);
    }
  }

  function openContactsFor(p) {
    setContactsProvider(p);
    setOpenContacts(true);
  }

  function doLogout() {
    logout();
    onLogout?.();
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-white">
      <img src={neonImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.14),transparent_55%)]" />

      <div className="relative w-full px-4 py-5">
        <div className="mx-auto w-full max-w-screen-2xl">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/55 backdrop-blur-xl">
            {/* Header compacto */}
            <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-r from-black via-zinc-950 to-black">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-orange-400/25 bg-orange-400/10 px-3 py-2 text-xs font-extrabold text-orange-300">
                    TQSoft
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide">
                      Proveedores
                    </h1>
                    <p className="text-xs text-white/55">
                      Acciones claras: <span className="text-emerald-300 font-bold">Agregar</span>,{" "}
                      <span className="text-sky-300 font-bold">Editar</span>,{" "}
                      <span className="text-red-300 font-bold">Eliminar</span>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={doLogout}
                  className="rounded-2xl bg-orange-400 px-5 py-2.5 text-sm font-extrabold text-black hover:brightness-105"
                >
                  Salir
                </button>
              </div>
            </div>

            {/* Toolbar compacto */}
            <div className="border-b border-white/10 bg-black/35 px-4 py-3">
              <div className="grid gap-2 lg:grid-cols-[auto_1fr_auto_auto_auto] lg:items-center">
                <button
                  onClick={resetAll}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-white/10"
                >
                  ⟲ Inicio
                </button>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5">
                  <span className="text-orange-300">🔎</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar NIT / nombre / email / teléfono..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none"
                >
                  <option value="">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>

                <div className="text-sm text-white/70">
                  Total: <span className="text-orange-300 font-extrabold">{total}</span>
                </div>

                <button
                  onClick={openCreate}
                  className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-600"
                >
                  + Agregar
                </button>
              </div>

              {err && (
                <div className="mt-2 rounded-2xl border border-orange-400/25 bg-orange-400/10 px-4 py-2 text-sm text-orange-200">
                  {err}
                </div>
              )}
            </div>

            {/* Tabla más “pequeña” */}
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-black/60">
                  <tr className="text-left text-[11px] font-extrabold uppercase tracking-wider text-white/80">
                    <th className="px-4 py-3">NIT</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-white/70">
                        Cargando...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-white/70">
                        Sin resultados.
                      </td>
                    </tr>
                  ) : (
                    rows.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-sm text-white/80">{p.nit ?? "-"}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{p.name ?? "-"}</td>
                        <td className="px-4 py-3 text-sm text-white/80">{p.email ?? "-"}</td>
                        <td className="px-4 py-3 text-sm text-white/80">{p.phone ?? "-"}</td>

                        <td className="px-4 py-3 text-sm">
                          <span
                            className={cls(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                              String(p.status ?? "active") === "inactive"
                                ? "border-red-500/30 bg-red-500/10 text-red-200"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            )}
                          >
                            {String(p.status ?? "active") === "inactive" ? "INACTIVO" : "ACTIVO"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={() => openContactsFor(p)}
                              className="rounded-xl border border-orange-400/35 bg-transparent px-3 py-2 text-[11px] font-extrabold text-orange-300 hover:bg-orange-400/10"
                            >
                              👥 Contactos
                            </button>

                            <button
                              onClick={() => openEdit(p)}
                              className="rounded-xl bg-sky-500 px-3 py-2 text-[11px] font-extrabold text-white hover:bg-sky-600"
                            >
                              ✏️ Editar
                            </button>

                            <button
                              onClick={() => onDelete(p)}
                              className="rounded-xl bg-red-500 px-3 py-2 text-[11px] font-extrabold text-white hover:bg-red-600"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación compacta */}
            <div className="border-t border-white/10 bg-black/35 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-white/70">
                  Página <span className="text-orange-300 font-extrabold">{page}</span> /{" "}
                  <span className="text-orange-300 font-extrabold">{lastPage}</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className={cls(
                      "rounded-2xl px-5 py-2.5 text-xs font-extrabold border transition",
                      page <= 1 || loading
                        ? "bg-white/5 text-white/30 border-white/10"
                        : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                    )}
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage || loading}
                    className={cls(
                      "rounded-2xl px-5 py-2.5 text-xs font-extrabold border transition",
                      page >= lastPage || loading
                        ? "bg-white/5 text-white/30 border-white/10"
                        : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                    )}
                  >
                    Siguiente →
                  </button>
                </div>

                <div className="text-[11px] text-white/50 text-center sm:text-right">
                  Tip: abre <span className="text-orange-300 font-bold">Contactos</span> por proveedor.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar (botones dentro del FORM = submit real) */}
      <Modal
        open={openForm}
        title={editing ? "Editar proveedor" : "Agregar proveedor"}
        onClose={() => !busy && setOpenForm(false)}
      >
        <form onSubmit={submitProvider} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold text-white/70">NIT *</label>
              <input
                value={form.nit}
                onChange={(e) => {
                  setErr("");
                  setForm((f) => ({ ...f, nit: e.target.value }));
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
                placeholder="900123456-7"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70">Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => {
                  setErr("");
                  setForm((f) => ({ ...f, name: e.target.value }));
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70">Correo</label>
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70">Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-white/70">Dirección</label>
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
              />
            </div>
          </div>

          {err ? (
            <div className="rounded-2xl border border-orange-400/25 bg-orange-400/10 px-4 py-2 text-sm text-orange-200">
              {err}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={() => setOpenForm(false)}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className={cls(
                "rounded-2xl px-5 py-2.5 text-xs font-extrabold text-white disabled:opacity-60",
                editing ? "bg-sky-500 hover:bg-sky-600" : "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              {busy ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <ContactsModal
        open={openContacts}
        onClose={() => setOpenContacts(false)}
        provider={contactsProvider}
      />
    </div>
  );
}

