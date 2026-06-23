import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { CapaApp } from "./capa-app";

export default async function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await exigirSesion();
  const usuarioCompleto = await db.usuario.findUnique({
    where: { id: u.id },
    select: { onboardingCompletado: true, temaPreferido: true },
  });

  return (
    <CapaApp
      usuario={u}
      onboardingPendiente={!usuarioCompleto?.onboardingCompletado}
    >
      {children}
    </CapaApp>
  );
}
