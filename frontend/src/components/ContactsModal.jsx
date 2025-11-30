import { useEffect, useState } from "react";
import Modal from "./Modal";
import { cls } from "../lib/utils";
import { createContact, deleteContact, listContacts, updateContact } from "../lib/api";
import { useToast } from "./Toaster";

const empty = { name: "", email: "", phone: "" };

export default function ContactsModal({ open, onClose, provider }) {
  const { push } = useToast();
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  async function load() {
    if (!provider?.id) return;
    setErr("");
    try {
      const r = await listContacts(provider.id);
      const list = r?.data ?? r ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e?.message || "No se pudieron cargar contactos.");
    }
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider?.id]);

  function startCreate() {
    setEditing(null);
    setForm(empty);
    setErr("");
  }

  function startEdit(c) {
    setEditing(c);
    setForm({ name: c?.name ?? "", email: c?.email ?? "", phone: c?.phone ?? "" });
    setErr("");
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!String(form.name || "").trim()) return setErr("El nombre es obligatorio.");

    setBusy(true);
    try {
      const payload = {
        name: String(form.name).trim(),
        email: String(form.email).trim() || null,
        phone: String(form.phone).trim() || null,
      };

      if (editing?.id) {
        await updateContact(editing.id, payload);
        push({ type: "success", title: "Actualizado", msg: "Contacto actualizado." });
      } else {
        await createContact(provider.id, payload);
        push({ type: "success", title: "Creado", msg: "Contacto creado." });
      }

      setEditing(null);
      setForm(empty);
      await load();
    } catch (e2) {
      setErr(e2?.message || "No se pudo guardar contacto.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(c) {
    const ok = confirm("¿Eliminar este contacto?");
    if (!ok) return;

    setBusy(true);
    try {
      await deleteContact(c.id);
      push({ type: "success", title: "Eliminado", msg: "Contacto eliminado." });
      await load();
    } catch (e2) {
      setErr(e2?.message || "No se pudo eliminar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={`Contactos · ${provider?.name ?? ""}`}
      onClose={() => !busy && onClose?.()}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-extrabold text-white">Listado</div>
            <button
              onClick={startCreate}
              className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-600"
            >
              + Nuevo
            </button>
          </div>

          {err ? (
            <div className="mt-3 rounded-xl border border-orange-400/25 bg-orange-400/10 px-3 py-2 text-xs text-orange-200">
              {err}
            </div>
          ) : null}

          <div className="mt-3 space-y-2">
            {rows.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/70">
                No hay contactos aún.
              </div>
            ) : (
              rows.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-extrabold text-white">{c.name}</div>
                    <div className="truncate text-[11px] text-white/60">
                      {c.email || "-"} · {c.phone || "-"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="rounded-lg bg-sky-500 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-sky-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="rounded-lg bg-red-500 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-sm font-extrabold text-white">
            {editing ? "Editar contacto" : "Crear contacto"}
          </div>

          <form onSubmit={submit} className="mt-3 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-white/70">Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70">Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/15"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(empty);
                  setErr("");
                }}
                className={cls(
                  "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-white hover:bg-white/10"
                )}
              >
                Limpiar
              </button>
              <button
                disabled={busy}
                className={cls(
                  "rounded-xl px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60",
                  editing ? "bg-sky-500 hover:bg-sky-600" : "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                {busy ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
