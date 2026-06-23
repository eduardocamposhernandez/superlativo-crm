"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  MessageCircle,
  Trophy,
  XCircle,
  Archive,
  Sparkles,
  Edit3,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Badge, BadgeTemperatura, BadgeEstado } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useConfirmar } from "@/components/ui/confirmar";
import { dinero, fechaCorta, fechaRelativa, diasEntre, telefonoBonito, iniciales } from "@/lib/formato";
import { FormularioCliente } from "./formulario-cliente";
import { BloquePagos } from "./bloque-pagos";
import { BloqueArchivos } from "./bloque-archivos";
import { LineaTiempo } from "./linea-tiempo";
import { BloqueNotas } from "./bloque-notas";
import { AsistenteIA } from "./asistente-ia";
import { CelebracionGanado } from "./celebracion-ganado";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  origen: string | null;
  etapa: string;
  estadoCartera: string;
  temperatura: string | null;
  objecion: string | null;
  valorEstimado: number;
  servicioInteres: string | null;
  notas: string | null;
  proximaAccion: string | null;
  proximaAccionEn: Date | string | null;
  ultimoContacto: Date | string | null;
  motivoPerdida: string | null;
  empresaNombre: string | null;
  empresaGiro: string | null;
  empresaPuesto: string | null;
  empresaSitioWeb: string | null;
  vendedorId: string | null;
  vendedor: { id: string; nombre: string } | null;
  citas: { id: string; titulo: string | null; inicio: Date; estado: string; vendedor: { nombre: string } | null }[];
  pagos: { id: string; monto: number; metodo: string; estado: string; fechaPago: Date | null; concepto: string | null }[];
  notasLista: { id: string; contenido: string; creadaEn: Date; usuario: { nombre: string } | null }[];
  archivos: { id: string; nombre: string; etiqueta: string; tipoMime: string; tamanoBytes: number; subidoEn: Date; subidoPor: { nombre: string } | null; contenidoBase: string | null; url: string | null }[];
  eventos: { id: string; tipo: string; titulo: string; detalle: string | null; autorNombre: string | null; ocurridoEn: Date }[];
  etiquetas: { etiqueta: { id: string; nombre: string; color: string } }[];
}

interface Props {
  cliente: Cliente;
  vendedores: { id: string; nombre: string }[];
  usuarioActualId: string;
  usuarioRol: string;
  mensajeWhatsAppPlantilla: string;
  motivosPerdida: string[];
}

export function ExpedienteCliente({
  cliente,
  vendedores,
  usuarioActualId,
  usuarioRol,
  mensajeWhatsAppPlantilla,
  motivosPerdida,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [editar, setEditar] = useState(false);
  const [perdiendo, setPerdiendo] = useState(false);
  const [celebrar, setCelebrar] = useState(false);
  const [usandoIA, setUsandoIA] = useState(false);

  const diasSin = cliente.ultimoContacto ? diasEntre(cliente.ultimoContacto) : null;
  const vencida =
    cliente.proximaAccionEn && new Date(cliente.proximaAccionEn).getTime() < Date.now();

  const linkWhats = cliente.telefono
    ? `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
        (mensajeWhatsAppPlantilla || `Hola, ${cliente.nombre}. Soy Eduardo Campos, de Superlativo.`).replace(/\[Nombre\]/g, cliente.nombre),
      )}`
    : null;

  const linkCorreo = cliente.correo
    ? `mailto:${cliente.correo}?subject=${encodeURIComponent(
        `Seguimiento — ${cliente.nombre}`,
      )}&body=${encodeURIComponent(
        `Hola ${cliente.nombre},\n\nGracias por el interés en Superlativo. Continuemos con el siguiente paso.\n\nSaludos,`,
      )}`
    : null;

  async function ejecutarAccion(accion: string, extras: Record<string, unknown> = {}) {
    const r = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _accion: accion, ...extras }),
    });
    const j = await r.json();
    if (!j.ok) {
      toast.error(j.mensaje);
      return false;
    }
    return true;
  }

  async function alGanar() {
    if (!(await ejecutarAccion("ganar"))) return;
    setCelebrar(true);
    toast.exito(`¡Cerraste a ${cliente.nombre}! 🎉 +${dinero(cliente.valorEstimado)}`);
    setTimeout(() => router.refresh(), 1800);
  }

  async function alArchivar() {
    const ok = await confirmar({
      titulo: `¿Archivar a ${cliente.nombre}?`,
      mensaje: "Podrás restaurarlo cuando quieras desde 'Archivados'. Nada se borra.",
      textoConfirmar: "Sí, archivar",
    });
    if (!ok) return;
    if (await ejecutarAccion("archivar")) {
      toast.deshacer(`${cliente.nombre} archivado`, async () => {
        await ejecutarAccion("restaurar");
        router.refresh();
      });
      router.push("/clientes");
    }
  }

  async function alBorrar() {
    const ok = await confirmar({
      titulo: `¿Enviar a papelera a ${cliente.nombre}?`,
      mensaje: "Lo podrás recuperar en 'Papelera' durante 30 días. Pasado ese plazo se borrará.",
      textoConfirmar: "Sí, enviar a papelera",
      peligro: true,
    });
    if (!ok) return;
    const r = await fetch(`/api/clientes/${cliente.id}`, { method: "DELETE" });
    const j = await r.json();
    if (j.ok) {
      toast.exito("Cliente enviado a papelera");
      router.push("/clientes");
    } else {
      toast.error(j.mensaje);
    }
  }

  async function alRestaurarArchivo() {
    if (await ejecutarAccion("restaurar")) {
      toast.exito("Cliente restaurado");
      router.refresh();
    }
  }

  async function alReactivar() {
    if (await ejecutarAccion("reactivar")) {
      toast.exito("Cliente reactivado — empieza desde 'Nuevo'");
      router.refresh();
    }
  }

  return (
    <>
      {/* Encabezado de venta */}
      <div className="tarjeta mb-6 overflow-hidden">
        <div className="border-b border-borde bg-gradient-to-r from-marca-50 to-superficie-alta p-5 dark:from-marca-500/5">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-marca-500 text-lg font-bold text-white shadow-marca">
              {iniciales(cliente.nombre)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-texto sm:text-3xl">
                  {cliente.nombre}
                </h1>
                <BadgeEstado valor={cliente.estadoCartera as never} />
              </div>
              {cliente.empresaNombre && (
                <p className="text-sm text-texto-suave">
                  {cliente.empresaPuesto ? `${cliente.empresaPuesto} · ` : ""}
                  {cliente.empresaNombre}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tono="marca">{cliente.etapa.replace(/_/g, " ")}</Badge>
                <BadgeTemperatura valor={cliente.temperatura as never} />
                {cliente.objecion && (
                  <Badge tono="aviso">⚠ {cliente.objecion}</Badge>
                )}
                {vencida && <Badge tono="peligro">Próxima acción VENCIDA</Badge>}
              </div>
              <p className="mt-2 text-sm text-texto-suave">
                Último contacto:{" "}
                <strong className={diasSin && diasSin > 7 ? "text-peligro" : "text-texto"}>
                  {cliente.ultimoContacto ? fechaRelativa(cliente.ultimoContacto) : "—"}
                </strong>
                {diasSin !== null && diasSin > 7 && (
                  <span className="text-peligro"> · llevas {diasSin} días sin contactarlo</span>
                )}
              </p>
              {cliente.proximaAccion && (
                <p className="mt-1 text-sm">
                  <strong>Próxima acción:</strong> {cliente.proximaAccion}
                  {cliente.proximaAccionEn && ` · ${fechaCorta(cliente.proximaAccionEn)}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-texto-tenue">Valor estimado</p>
              <p className="text-3xl font-bold tabular-nums text-marca-600">
                {dinero(cliente.valorEstimado)}
              </p>
            </div>
          </div>

          {/* Botones de un clic */}
          <div className="mt-4 flex flex-wrap gap-2">
            {linkWhats && (
              <a
                href={linkWhats}
                target="_blank"
                rel="noopener noreferrer"
                className="boton boton-primario"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {linkCorreo && (
              <a href={linkCorreo} className="boton boton-secundario">
                <Mail className="h-4 w-4" /> Enviar correo
              </a>
            )}
            {cliente.telefono && (
              <a href={`tel:${cliente.telefono}`} className="boton boton-secundario">
                <Phone className="h-4 w-4" /> Llamar
              </a>
            )}
            <Boton variante="suave" onClick={() => setUsandoIA(true)} iconoIzq={<Sparkles className="h-4 w-4" />}>
              Asistente IA
            </Boton>
            <Boton variante="secundario" onClick={() => setEditar(true)} iconoIzq={<Edit3 className="h-4 w-4" />}>
              Editar
            </Boton>

            {cliente.estadoCartera === "ACTIVO" && (
              <>
                <Boton variante="suave" onClick={alGanar} iconoIzq={<Trophy className="h-4 w-4" />}>
                  Marcar como ganado
                </Boton>
                <Boton
                  variante="secundario"
                  onClick={() => setPerdiendo(true)}
                  iconoIzq={<XCircle className="h-4 w-4" />}
                >
                  Marcar como perdido
                </Boton>
                <Boton variante="secundario" onClick={alArchivar} iconoIzq={<Archive className="h-4 w-4" />}>
                  Archivar
                </Boton>
              </>
            )}
            {cliente.estadoCartera === "PERDIDO" && (
              <Boton variante="suave" onClick={alReactivar} iconoIzq={<RotateCcw className="h-4 w-4" />}>
                Reactivar
              </Boton>
            )}
            {cliente.estadoCartera === "ARCHIVADO" && (
              <Boton variante="suave" onClick={alRestaurarArchivo} iconoIzq={<RotateCcw className="h-4 w-4" />}>
                Restaurar
              </Boton>
            )}
            <Boton variante="peligro" onClick={alBorrar} iconoIzq={<Trash2 className="h-4 w-4" />}>
              Papelera
            </Boton>
          </div>
        </div>

        {/* Datos de contacto y vendedor */}
        <div className="grid gap-4 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Dato label="WhatsApp" valor={cliente.telefono ? telefonoBonito(cliente.telefono) : "—"} />
          <Dato label="Correo" valor={cliente.correo ?? "—"} />
          <Dato label="Origen" valor={cliente.origen ?? "—"} />
          <Dato label="Vendedor" valor={cliente.vendedor?.nombre ?? "Sin asignar"} />
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BloquePagos clienteId={cliente.id} pagos={cliente.pagos} valorEstimado={cliente.valorEstimado} />
          <BloqueNotas clienteId={cliente.id} notas={cliente.notasLista} />
          <BloqueArchivos clienteId={cliente.id} archivos={cliente.archivos} />
        </div>
        <div className="lg:col-span-1">
          <LineaTiempo eventos={cliente.eventos} />
        </div>
      </div>

      {/* Modal editar */}
      <Modal abierto={editar} alCerrar={() => setEditar(false)} titulo="Editar cliente" anchoMax="lg">
        <FormularioCliente
          inicial={cliente as never}
          vendedores={vendedores}
          usuarioActualId={usuarioActualId}
          alGuardar={() => {
            setEditar(false);
            router.refresh();
          }}
        />
      </Modal>

      {/* Modal motivo de pérdida */}
      <ModalMotivoPerdida
        abierto={perdiendo}
        alCerrar={() => setPerdiendo(false)}
        motivos={motivosPerdida}
        alConfirmar={async (motivo) => {
          setPerdiendo(false);
          if (await ejecutarAccion("perder", { motivo })) {
            toast.info(`${cliente.nombre} marcado como perdido — aprende y sigue`);
            router.refresh();
          }
        }}
      />

      <AsistenteIA
        abierto={usandoIA}
        alCerrar={() => setUsandoIA(false)}
        cliente={cliente}
      />

      <CelebracionGanado activo={celebrar} alTerminar={() => setCelebrar(false)} nombre={cliente.nombre} />
    </>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-texto-tenue">{label}</p>
      <p className="text-texto">{valor}</p>
    </div>
  );
}

function ModalMotivoPerdida({
  abierto,
  alCerrar,
  motivos,
  alConfirmar,
}: {
  abierto: boolean;
  alCerrar: () => void;
  motivos: string[];
  alConfirmar: (motivo: string) => void;
}) {
  const [seleccionado, setSeleccionado] = useState("");
  const [otro, setOtro] = useState("");
  const final = seleccionado === "Otro" ? otro : seleccionado;

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="¿Por qué se perdió?"
      descripcion="Saber por qué se pierden las ventas vale oro. Es lo que vas a corregir."
      pieDePagina={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton disabled={!final} onClick={() => alConfirmar(final)}>
            Marcar como perdido
          </Boton>
        </>
      }
    >
      <div className="space-y-2">
        {motivos.map((m) => (
          <label
            key={m}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
              seleccionado === m
                ? "border-marca-500 bg-marca-50 dark:bg-marca-500/10"
                : "border-borde hover:bg-superficie"
            }`}
          >
            <input
              type="radio"
              name="motivo"
              value={m}
              checked={seleccionado === m}
              onChange={(e) => setSeleccionado(e.target.value)}
              className="h-4 w-4 accent-marca-500"
            />
            <span className="text-sm text-texto">{m}</span>
          </label>
        ))}
        {seleccionado === "Otro" && (
          <input
            value={otro}
            onChange={(e) => setOtro(e.target.value)}
            placeholder="Describe el motivo…"
            className="campo"
          />
        )}
      </div>
    </Modal>
  );
}
