# Cómo publicar tu CRM en internet con Vercel (paso a paso, sin pagar nada)

> **No necesitas tarjeta. Todo es gratis.** Sigue los pasos en orden.

## Qué es qué (te lo explico simple)

- **GitHub** = caja fuerte en internet donde se guarda el código.
- **Vercel** = el servicio gratis que toma tu código y lo convierte en una página de internet con su propia liga (ej. `superlativo.vercel.app`).
- **Variable de entorno** = un dato secreto (como una contraseña) que se guarda aparte del código para que nadie lo vea.

## Paso 1 — Que compile en tu compu

```bash
npm install
npm run build
```

Si hay errores, arréglalos antes de seguir. No avancemos si no está verde.

## Paso 2 — Crear cuenta de GitHub (si no tienes)

1. Abre **https://github.com/signup**
2. Pon correo, contraseña y un usuario
3. Confirma tu correo

## Paso 3 — Subir tu CRM a GitHub

En la terminal, dentro de la carpeta `superlativo-crm`, corre uno por uno:

```bash
git init
git add .
git commit -m "Mi CRM SUPERLATIVO"
```

Luego ve a **https://github.com/new**:
- Nombre: `superlativo-crm`
- Déjalo Público o Privado (lo que prefieras)
- NO marques nada más
- Clic en **Create repository**

GitHub te dará dos comandos. Cópialos y pégalos:

```bash
git remote add origin https://github.com/TU-USUARIO/superlativo-crm.git
git branch -M main
git push -u origin main
```

> ✋ **CONFIRMA** que el archivo `.env` NO se subió. Solo debe verse `.env.example`. Si ves `.env` arriba en GitHub, deténte y agrégalo a `.gitignore`.

## Paso 4 — Crear cuenta de Vercel

1. Abre **https://vercel.com/signup**
2. Clic en **Continue with GitHub**
3. Acepta los permisos

## Paso 5 — Importar tu proyecto

1. Abre **https://vercel.com/new**
2. Busca el repo `superlativo-crm`
3. Clic en **Import**

> Si no aparece, clic en **Adjust GitHub App Permissions** y dale acceso.

## Paso 6 — Crear la base de datos GRATIS (sin tarjeta)

En el panel de Vercel:

1. Pestaña **Storage** (en el menú lateral)
2. **Create Database** → elige **Postgres** → plan **Free** (Hobby, sin tarjeta)
3. Clic en **Create**
4. Cuando te diga, conecta esa base a tu proyecto `superlativo-crm`

> **Alternativa igual de buena:** **Neon** (https://neon.tech, plan Free sin tarjeta). Crea una base y copia su `DATABASE_URL`.

## Paso 6.5 — IMPORTANTE: Cambiar el motor de base de datos a Postgres

Tu CRM local usa **SQLite** (un archivo simple). En Vercel necesitas **Postgres** (porque el disco de Vercel se borra). Es un cambio de UNA línea:

1. Abre el archivo `prisma/schema.prisma`
2. Busca estas líneas (cerca del inicio):
   ```
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Cambia `"sqlite"` por `"postgresql"`:
   ```
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Guarda, y haz commit + push:
   ```
   git add prisma/schema.prisma
   git commit -m "Cambio a postgres para producción"
   git push
   ```

> 💡 **Truco para no perder tu base local de pruebas:** después de hacer este cambio, en local NO podrás correr `npm run dev` con el `DATABASE_URL` apuntando a SQLite. Si quieres seguir desarrollando local, también pon en tu `.env` local el `DATABASE_URL` de Postgres (la misma de Vercel o crea otra en Neon free para desarrollo).

## Paso 7 — Pegar los datos secretos

En tu proyecto en Vercel → **Settings** → **Environment Variables**, agrega una por una:

| Nombre                  | Valor                                                  | ¿Obligatoria? |
|-------------------------|--------------------------------------------------------|---------------|
| `DATABASE_URL`          | La que te dio Vercel/Neon en el paso 6                 | ✅ Sí          |
| `AUTH_SECRET`           | Pega aquí: (genera en https://generate-secret.vercel.app/32) | ✅ Sí |
| `NEXTAUTH_URL`          | `https://TU-PROYECTO.vercel.app`                      | ✅ Sí          |
| `ANTHROPIC_API_KEY`     | (opcional) De https://console.anthropic.com           | ⛔ No          |
| `GOOGLE_CLIENT_ID`      | (opcional) Para Google Calendar                       | ⛔ No          |
| `GOOGLE_CLIENT_SECRET`  | (opcional) Para Google Calendar                       | ⛔ No          |
| `BLOB_READ_WRITE_TOKEN` | (opcional) Para archivos grandes (Vercel Blob)        | ⛔ No          |

> Sin las opcionales, el CRM **igual funciona**. La IA usa plantillas locales. Las citas se guardan sin Google. Los archivos hasta 4 MB se guardan en la base.

## Paso 8 — Publicar

Clic en el botón azul **Deploy**.

Vercel correrá automáticamente:
- `prisma generate` (genera el cliente)
- `prisma migrate deploy` (crea las tablas SIN borrar datos)
- `next build` (compila la app)

Tarda 1–2 minutos. Cuando termine, te da tu liga (ej. `superlativo-crm.vercel.app`).

> 💡 **El seed NO corre solo en producción** (para no pisar datos reales). Si quieres datos de muestra en la producción de prueba, corre manualmente desde tu compu:
>
> ```bash
> DATABASE_URL="postgres://..." npx prisma db seed
> ```

## Paso 9 — Probar de verdad

1. Abre tu liga pública
2. Llena el formulario y agenda una cita
3. Entra a `/login` y revisa que el lead esté en el embudo como "Nuevo"
4. Prueba `/agenda/eduardo` (la página de agenda del admin)
5. Ve a **Comparte y crece** y copia la liga

## Paso 10 — Volver a publicar cuando cambies algo

```bash
git add . && git commit -m "cambios" && git push
```

Vercel republica solo en 1–2 minutos.

## Paso 11 (opcional) — Tu propio dominio

En Vercel → **Domains** → agrega `tudominio.com`. Te dice qué configurar con tu proveedor de dominio.

## Respaldos manuales (recomendado mensualmente)

1. Entra a tu CRM con tu cuenta admin
2. Ve a **Panel admin** → **Respaldar todo**
3. Te descarga un `.json` con TODO (sin contraseñas).

También puedes hacer `pg_dump` de la base si quieres respaldo crudo de Postgres.
