"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/boton";
import { LogIn, Eye, EyeOff } from "lucide-react";

export function FormularioLogin() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alEnviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      const j = await r.json();
      if (!j.ok) {
        setError(j.mensaje || "No pudimos iniciar sesión");
        setCargando(false);
        return;
      }
      router.push("/tablero");
      router.refresh();
    } catch {
      setError("Sin conexión. Reintenta.");
      setCargando(false);
    }
  }

  return (
    <form onSubmit={alEnviar} className="space-y-4">
      <div>
        <label htmlFor="correo" className="etiqueta-campo">
          Correo
        </label>
        <input
          id="correo"
          type="email"
          autoComplete="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="campo"
          placeholder="tu@correo.com"
        />
      </div>
      <div>
        <label htmlFor="contrasena" className="etiqueta-campo">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="contrasena"
            type={ver ? "text" : "password"}
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="campo pr-12"
            placeholder="Tu contraseña"
          />
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Ver contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave hover:text-texto"
          >
            {ver ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-peligro/20 bg-peligro-suave p-3 text-sm text-peligro dark:bg-peligro/10"
        >
          {error}
        </div>
      )}
      <Boton
        type="submit"
        bloque
        cargando={cargando}
        iconoIzq={<LogIn className="h-4 w-4" />}
      >
        Entrar
      </Boton>
    </form>
  );
}
