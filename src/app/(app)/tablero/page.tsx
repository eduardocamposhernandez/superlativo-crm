import { LayoutDashboard, TrendingUp, Users, Calendar, CheckCircle2, Send, AlertCircle, Trophy } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";
import { dinero, numero } from "@/lib/formato";
import { GraficaCrecimiento } from "@/components/dashboard/grafica-crecimiento";
import { ProgresoMeta } from "@/components/dashboard/progreso-meta";
import { CardNumero } from "@/components/dashboard/card-numero";
import { TablaRanking } from "@/components/dashboard/tabla-ranking";

export default async function PaginaTablero() {
  const u = await exigirSesion();
  const config = await db.configuracion.findFirst();
  const filtroDueno = filtroPorRol(u);

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesPrev = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesPrev = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);

  // Métricas del mes
  const [nuevos, citas, propuestas, ganados, ingresosMes, pendientes, vencidos, todosActivos] = await Promise.all([
    db.cliente.count({ where: { eliminadoEn: null, creadoEn: { gte: inicioMes }, ...filtroDueno } }),
    db.cita.count({
      where: { eliminadoEn: null, inicio: { gte: inicioMes }, ...(u.rol === "VENDEDOR" ? { vendedorId: u.id } : {}) },
    }),
    db.cliente.count({ where: { eliminadoEn: null, etapa: "PROPUESTA_ENVIADA", ...filtroDueno } }),
    db.cliente.count({
      where: { eliminadoEn: null, estadoCartera: "GANADO", actualizadoEn: { gte: inicioMes }, ...filtroDueno },
    }),
    db.pago.aggregate({
      where: {
        eliminadoEn: null,
        estado: "PAGADO",
        fechaPago: { gte: inicioMes },
        cliente: filtroDueno,
      },
      _sum: { monto: true },
    }),
    db.pago.aggregate({
      where: { eliminadoEn: null, estado: "PENDIENTE", cliente: filtroDueno },
      _sum: { monto: true },
    }),
    db.pago.aggregate({
      where: { eliminadoEn: null, estado: "VENCIDO", cliente: filtroDueno },
      _sum: { monto: true },
    }),
    db.cliente.findMany({
      where: { eliminadoEn: null, estadoCartera: "ACTIVO", ...filtroDueno },
      select: { etapa: true, valorEstimado: true, origen: true, canalUtm: true },
    }),
  ]);

  // Comparativa con mes pasado
  const ingresosMesPrev = await db.pago.aggregate({
    where: {
      eliminadoEn: null,
      estado: "PAGADO",
      fechaPago: { gte: inicioMesPrev, lte: finMesPrev },
      cliente: filtroDueno,
    },
    _sum: { monto: true },
  });
  const ganadosMesPrev = await db.cliente.count({
    where: {
      eliminadoEn: null,
      estadoCartera: "GANADO",
      actualizadoEn: { gte: inicioMesPrev, lte: finMesPrev },
      ...filtroDueno,
    },
  });

  // Crecimiento 6 meses
  const meses6 = await Promise.all(
    Array.from({ length: 6 }, async (_, idx) => {
      const i = 5 - idx;
      const ini = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const fin = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0, 23, 59, 59);
      const [pagos, ganados] = await Promise.all([
        db.pago.aggregate({
          where: { eliminadoEn: null, estado: "PAGADO", fechaPago: { gte: ini, lte: fin }, cliente: filtroDueno },
          _sum: { monto: true },
        }),
        db.cliente.count({
          where: {
            eliminadoEn: null,
            estadoCartera: "GANADO",
            actualizadoEn: { gte: ini, lte: fin },
            ...filtroDueno,
          },
        }),
      ]);
      return {
        mes: ini.toLocaleString("es-MX", { month: "short" }),
        ingresos: pagos._sum.monto ?? 0,
        clientes: ganados,
      };
    }),
  );

  // Pronóstico
  const valorEmbudo = todosActivos.reduce((s, c) => s + c.valorEstimado, 0);
  const probabilidad: Record<string, number> = {
    NUEVO: 0.05,
    CONTACTADO: 0.15,
    CITA_AGENDADA: 0.3,
    PROPUESTA_ENVIADA: 0.5,
    SEGUIMIENTO: 0.4,
  };
  const pronostico = todosActivos.reduce((s, c) => s + c.valorEstimado * (probabilidad[c.etapa] ?? 0), 0);
  const meta = config?.metaMensual ?? 30000;
  const cobradoMes = ingresosMes._sum.monto ?? 0;
  const diasDelMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  const diasFaltan = diasDelMes - ahora.getDate();
  const proyectado = cobradoMes + pronostico;
  const semaforo: "verde" | "ambar" | "rojo" = proyectado >= meta ? "verde" : proyectado >= meta * 0.7 ? "ambar" : "rojo";

  // Canales
  const canales: Record<string, number> = {};
  for (const c of todosActivos) {
    const k = c.origen || c.canalUtm || "Otros";
    canales[k] = (canales[k] || 0) + 1;
  }
  const canalesTop = Object.entries(canales).sort(([, a], [, b]) => b - a).slice(0, 5);

  // Ranking equipo (solo admin)
  let ranking: { id: string; nombre: string; ganados: number; ingresos: number; meta: number; pctMeta: number }[] = [];
  if (u.rol === "ADMIN") {
    const vendedores = await db.usuario.findMany({
      where: { activo: true, rol: { in: ["ADMIN", "VENDEDOR"] } },
    });
    ranking = await Promise.all(
      vendedores.map(async (v) => {
        const [g, p] = await Promise.all([
          db.cliente.count({ where: { eliminadoEn: null, vendedorId: v.id, estadoCartera: "GANADO", actualizadoEn: { gte: inicioMes } } }),
          db.pago.aggregate({
            where: { eliminadoEn: null, estado: "PAGADO", fechaPago: { gte: inicioMes }, cliente: { vendedorId: v.id } },
            _sum: { monto: true },
          }),
        ]);
        const m = v.metaMensual || meta;
        const ing = p._sum.monto ?? 0;
        return { id: v.id, nombre: v.nombre, ganados: g, ingresos: ing, meta: m, pctMeta: m > 0 ? ing / m : 0 };
      }),
    );
    ranking.sort((a, b) => b.ingresos - a.ingresos);
  }

  const deltaIng = ingresosMesPrev._sum.monto ? ((cobradoMes - ingresosMesPrev._sum.monto) / ingresosMesPrev._sum.monto) * 100 : null;
  const deltaGan = ganadosMesPrev ? ((ganados - ganadosMesPrev) / ganadosMesPrev) * 100 : null;

  return (
    <>
      <EncabezadoSeccion
        Icono={LayoutDashboard}
        titulo={`Hola, ${u.nombre.split(" ")[0]}`}
        subtitulo="¿Vas a cerrar el mes?"
        ayuda="Esta es la foto del mes. Mira la meta, el embudo y el pronóstico. Si el semáforo está rojo, abre 'Hoy te toca' y atiende a los calientes."
      />

      {/* Meta del mes */}
      <ProgresoMeta cobrado={cobradoMes} meta={meta} diasFaltan={diasFaltan} pronostico={pronostico} semaforo={semaforo} />

      {/* Bento de números */}
      <div className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CardNumero icono={<Users className="h-5 w-5" />} titulo="Nuevos interesados" valor={numero(nuevos)} />
        <CardNumero icono={<Calendar className="h-5 w-5" />} titulo="Citas agendadas" valor={numero(citas)} />
        <CardNumero icono={<Send className="h-5 w-5" />} titulo="Propuestas enviadas" valor={numero(propuestas)} />
        <CardNumero
          icono={<Trophy className="h-5 w-5" />}
          titulo="Clientes ganados"
          valor={numero(ganados)}
          delta={deltaGan}
        />
        <CardNumero
          icono={<CheckCircle2 className="h-5 w-5" />}
          titulo="Ingresos cobrados"
          valor={dinero(cobradoMes)}
          delta={deltaIng}
        />
        <CardNumero icono={<TrendingUp className="h-5 w-5" />} titulo="Valor del embudo" valor={dinero(valorEmbudo)} />
        <CardNumero icono={<AlertCircle className="h-5 w-5" />} titulo="Pagos pendientes" valor={dinero(pendientes._sum.monto ?? 0)} tono="aviso" />
        <CardNumero icono={<AlertCircle className="h-5 w-5" />} titulo="Pagos vencidos" valor={dinero(vencidos._sum.monto ?? 0)} tono="peligro" />
      </div>

      {/* Gráfica de crecimiento */}
      <GraficaCrecimiento datos={meses6} />

      {/* De dónde llegan + ranking */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="mb-3 text-base font-semibold text-texto">De dónde llegan tus clientes</h2>
          {canalesTop.length === 0 ? (
            <p className="text-sm text-texto-suave">Aún sin datos, esto se llena solo.</p>
          ) : (
            <ul className="space-y-2">
              {canalesTop.map(([nombre, n]) => (
                <li key={nombre} className="flex items-center justify-between text-sm">
                  <span className="text-texto">{nombre}</span>
                  <span className="font-semibold text-marca-600">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {u.rol === "ADMIN" && (
          <TablaRanking ranking={ranking} />
        )}
      </div>
    </>
  );
}
