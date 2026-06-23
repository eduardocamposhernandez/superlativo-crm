"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, KeyRound, UserX, UserCheck } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useConfirmar } from "@/components/ui/confirmar";
import { dinero, iniciales } from "@/lib/formato";

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  slugAgenda: string | null;
  metaMensual: number;
  metaClientesMensual: number;
  clientesAsignados: number;
}

export function GestorEquipo({ inicial }: { inicial: Usuario[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [editar, setEditar] = useState<Partial<Usuario> & { contrasena?: string } | null>(null);

  async function guardar() {
    if (!editar) return;
    const url = editar.id ? `/api/usuarios/${editar.id}` : "/api/usuarios";
    const metodo = editar.id ? "PATCH" : "POST";
    const r = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editar),
    });
    const j = await r.json();
    if (!j.ok) {
      toast.error(j.mensaje);
      return;
    }
    toast.exito("Guardado ✓");
    setEditar(null);
    router.refresh();
  }

  async function desactivar(u: Usuario) {
    const accion = u.activo ? "desactivar" : "activar";
    const ok = await confirmar({
      titulo: `¿${accion[0].toUpperCase() + accion.slice(1)} a ${u.nombre}?`,
      mensaje: u.activo
        ? "Ya no podrá iniciar sesión. Sus clientes quedan donde están — puedes reasignarlos."
        : "Podrá iniciar sesión otra vez.",
    });
    if (!ok) return;
    await fetch(`/api/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !u.activo }),
    });
    router.refresh();
  }

  async function resetearContrasena(u: Usuario) {
    const nueva = prompt(`Nueva contraseña para ${u.nombre} (mínimo 8 caracteres):`);
    if (!nueva || nueva.length < 8) {
      toast.error("Mínimo 8 caracteres");
      return;
    }
    const r = await fetch(`/api/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contrasena: nueva }),
    });
    const j = await r.json();
    if (j.ok) toast.exito("Contraseña actualizada");
    else toast.error(j.mensaje);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Boton onClick={() => setEditar({ rol: "VENDEDOR", activo: true })} iconoIzq={<Plus className="h-4 w-4" />}>
          Nuevo usuario
        </Boton>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {inicial.map((u) => (
          <li key={u.id} className={`tarjeta p-5 ${!u.activo ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marca-500 text-sm font-semibold text-white">
                {iniciales(u.nombre)}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-texto">{u.nombre}</p>
                  <Badge tono={u.rol === "ADMIN" ? "marca" : "neutro"}>{u.rol}</Badge>
                  {!u.activo && <Badge tono="peligro">Inactivo</Badge>}
                </div>
                <p className="text-xs text-texto-suave">{u.correo}</p>
                <p className="mt-1 text-xs text-texto-tenue">
                  {u.clientesAsignados} clientes · meta {dinero(u.metaMensual)} / {u.metaClientesMensual} cierres
                </p>
                {u.slugAgenda && (
                  <p className="text-xs">
                    <code className="rounded bg-superficie px-1.5 py-0.5">/agenda/{u.slugAgenda}</code>
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button onClick={() => setEditar(u)} className="boton boton-fantasma !min-h-[32px] !py-1 text-xs">
                <Edit3 className="h-3 w-3" /> Editar
              </button>
              <button onClick={() => resetearContrasena(u)} className="boton boton-fantasma !min-h-[32px] !py-1 text-xs">
                <KeyRound className="h-3 w-3" /> Resetear contraseña
              </button>
              <button onClick={() => desactivar(u)} className="boton boton-fantasma !min-h-[32px] !py-1 text-xs">
                {u.activo ? <UserX className="h-3 w-3 text-peligro" /> : <UserCheck className="h-3 w-3 text-marca-600" />}
                {u.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        abierto={!!editar}
        alCerrar={() => setEditar(null)}
        titulo={editar?.id ? `Editar a ${editar.nombre}` : "Nuevo usuario"}
        pieDePagina={
          <>
            <Boton variante="secundario" onClick={() => setEditar(null)}>Cancelar</Boton>
            <Boton onClick={guardar}>Guardar</Boton>
          </>
        }
      >
        {editar && (
          <div className="space-y-3">
            <div>
              <label className="etiqueta-campo">Nombre</label>
              <input value={editar.nombre ?? ""} onChange={(e) => setEditar({ ...editar, nombre: e.target.value })} className="campo" />
            </div>
            <div>
              <label className="etiqueta-campo">Correo</label>
              <input type="email" value={editar.correo ?? ""} onChange={(e) => setEditar({ ...editar, correo: e.target.value })} className="campo" />
            </div>
            {!editar.id && (
              <div>
                <label className="etiqueta-campo">Contraseña (mínimo 8)</label>
                <input
                  type="password"
                  value={editar.contrasena ?? ""}
                  onChange={(e) => setEditar({ ...editar, contrasena: e.target.value })}
                  className="campo"
                />
              </div>
            )}
            <div>
              <label className="etiqueta-campo">Rol</label>
              <select value={editar.rol ?? "VENDEDOR"} onChange={(e) => setEditar({ ...editar, rol: e.target.value })} className="campo">
                <option value="ADMIN">Admin (todo)</option>
                <option value="VENDEDOR">Vendedor (solo lo suyo)</option>
                <option value="SOLO_LECTURA">Solo lectura</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="etiqueta-campo">Meta mensual ($)</label>
                <input type="number" value={editar.metaMensual ?? 0} onChange={(e) => setEditar({ ...editar, metaMensual: Number(e.target.value) })} className="campo" />
              </div>
              <div>
                <label className="etiqueta-campo">Meta de cierres</label>
                <input type="number" value={editar.metaClientesMensual ?? 0} onChange={(e) => setEditar({ ...editar, metaClientesMensual: Number(e.target.value) })} className="campo" />
              </div>
            </div>
            <div>
              <label className="etiqueta-campo">Slug para su liga de agenda (ej. "maria")</label>
              <input value={editar.slugAgenda ?? ""} onChange={(e) => setEditar({ ...editar, slugAgenda: e.target.value })} className="campo" placeholder="maria" />
              <p className="ayuda-campo">Crea su liga /agenda/[slug] pública.</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
