"use client";

import { useState } from "react";
import { BarraLateral } from "@/components/nav/barra-lateral";
import { BarraSuperior } from "@/components/nav/barra-superior";
import { BarraInferior } from "@/components/nav/barra-inferior";
import { MenuMasMovil } from "@/components/nav/menu-mas-movil";
import { AtajoBuscador } from "@/components/nav/buscador";
import { AutoTour } from "@/components/onboarding/tour";
import type { UsuarioSesion } from "@/lib/permisos";

export function CapaApp({
  children,
  usuario,
  onboardingPendiente,
}: {
  children: React.ReactNode;
  usuario: UsuarioSesion;
  onboardingPendiente: boolean;
}) {
  const [verMas, setVerMas] = useState(false);
  return (
    <div className="flex min-h-screen bg-superficie">
      <BarraLateral rol={usuario.rol} />
      <div className="flex flex-1 flex-col">
        <BarraSuperior usuario={usuario} />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <BarraInferior onAbrirMas={() => setVerMas(true)} />
      </div>
      <MenuMasMovil abierto={verMas} alCerrar={() => setVerMas(false)} rol={usuario.rol} />
      <AtajoBuscador />
      <AutoTour rol={usuario.rol} pendiente={onboardingPendiente} />
    </div>
  );
}
