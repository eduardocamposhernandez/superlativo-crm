import Link from "next/link";
import { Suspense } from "react";
import { Users, Plus } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { listarClientes } from "@/lib/acciones-cliente";
import { ListaClientes } from "./lista-clientes";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaginaClientes({ searchParams }: Props) {
  const u = await exigirSesion();
  const sp = await searchParams;
  const pagina = Number(sp.pagina ?? 1);
  const datos = await listarClientes(u, {
    busqueda: typeof sp.q === "string" ? sp.q : undefined,
    etapa: typeof sp.etapa === "string" ? sp.etapa : undefined,
    estado: typeof sp.estado === "string" ? sp.estado : undefined,
    temperatura: typeof sp.temperatura === "string" ? sp.temperatura : undefined,
    etiqueta: typeof sp.etiqueta === "string" ? sp.etiqueta : undefined,
    favoritos: sp.favoritos === "1",
    proximaVencida: sp.vencida === "1",
    ordenar: typeof sp.orden === "string" ? sp.orden : undefined,
    pagina,
  });

  return (
    <>
      <EncabezadoSeccion
        Icono={Users}
        titulo="Clientes"
        subtitulo="Todas tus personas en un solo lugar"
        ayuda="Aquí vive tu cartera. Filtra por etapa, temperatura o etiquetas para enfocarte en quién hay que mover hoy. Haz clic en cualquier nombre para abrir su expediente completo."
        colorMatiz="text-sky-600"
        accion={
          <Link href="/clientes/nuevo" className="boton boton-primario">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Link>
        }
      />
      <Suspense fallback={null}>
        <ListaClientes datos={datos} />
      </Suspense>
    </>
  );
}
