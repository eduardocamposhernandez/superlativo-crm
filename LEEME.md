# SUPERLATIVO CRM

Tu CRM hecho a la medida para vender más y no dejar caer a ningún cliente.

---

## 🛠️ Primero — Instalar Node.js (una sola vez)

Tu computadora necesita Node.js para correr el CRM. Si nunca lo has instalado:

1. Abre **https://nodejs.org**
2. Descarga la versión **LTS** (la verde)
3. Instala con los valores por defecto (siguiente, siguiente, terminar)
4. Cierra y abre de nuevo cualquier ventana de terminal/PowerShell

Para verificar que quedó instalado, en una ventana de PowerShell o terminal:
```
node --version
npm --version
```
Si ambos comandos te dan un número (ej. `v22.x.x`), ya estás listo.

---

## 🟢 Correrlo en tu computadora (primera vez)

Abre **PowerShell** dentro de la carpeta `superlativo-crm` y corre **uno por uno**:

```powershell
# 1. Instala todas las piezas (tarda 2-5 min la primera vez)
npm install

# 2. Crea el archivo de secretos (copia el ejemplo)
Copy-Item .env.example .env

# 3. Crea la base de datos y sus tablas
npx prisma migrate dev --name inicial

# 4. Carga datos de ejemplo (clientes, pagos, citas) para que se vea vivo
npx prisma db seed

# 5. Arranca el servidor
npm run dev
```

Abre **http://localhost:3000** y entra con:

- **Admin (tú):** `lalocamp@gmail.com` / `admin123`
- **Vendedor (María):** `maria@superlativo.com` / `vendedor123`

> ✋ Cambia tu contraseña en **Mi perfil** apenas entres.

## ▶️ Las siguientes veces

Solo necesitas:
```powershell
npm run dev
```

Y vas a **http://localhost:3000**.

---

## 📦 ¿Qué incluye?

Todo lo del prompt maestro:

- ✅ Landing pública que captura (anti-pérdida de leads).
- ✅ Embudo Kanban con arrastrar y soltar.
- ✅ Expediente completo de cada cliente (clic en el nombre desde DONDE SEA).
- ✅ Hoy te toca (alertas + acciones vencidas).
- ✅ Pagos (con parcialidades y recibo PDF).
- ✅ Agenda mensual con bloques visuales clicables.
- ✅ Páginas de agenda por vendedor (estilo Calendly).
- ✅ Dashboard con meta del mes, pronóstico y crecimiento 6 meses.
- ✅ Asistente IA (Claude) con 5 funciones + degradación a plantillas locales.
- ✅ Plantillas editables (WhatsApp y correo).
- ✅ Panel admin con bitácora de auditoría, usuarios, papelera y respaldos.
- ✅ Login seguro con contraseñas hasheadas (bcrypt 12 rounds).
- ✅ Tres modos de tema (claro, oscuro, automático) por usuario.
- ✅ Tour de onboarding por cada usuario.
- ✅ Buscador global con `/` o `Ctrl/Cmd+K`.
- ✅ PWA instalable.
- ✅ 100% en español, accesible (AA, teclado, reduce-motion).

---

## 🚀 Publicarlo en internet con Vercel

**Sin tarjeta. Sin pagar. Sin complicaciones.** Ver **`PUBLICAR-EN-VERCEL.md`**.

## 🛟 Si algo se atora

Ver **`NOTAS-DEL-PROYECTO.md`** para los remedios comunes.

## 🌅 Tu ritual diario para vender más

1. Abre **Hoy te toca**.
2. Contacta primero a los **🔥 calientes** con un clic en WhatsApp.
3. Después de cada contacto, registra qué pasó y **deja la próxima acción**.
4. Revisa el **Embudo** y mueve a quien avanzó.
5. Al cerrar, marca **Ganado 🎉** y celebra.
