# Notas del proyecto SUPERLATIVO CRM

## Si algo se atora (remedios rápidos)

### El servidor no arranca con `npm run dev`
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### `npm run build` da errores
Léelos uno por uno. Suelen ser:
- Tipos: revisa que las imports estén bien.
- Falta `node_modules`: corre `npm install`.

### "Tabla no existe" o error de base
- Local: `npx prisma migrate dev`
- Producción: pasa solo si el `migrate deploy` falló en el build. Ve a Vercel → Deployments → ver logs.

### La IA no responde
- Si no hay `ANTHROPIC_API_KEY`, debe caer SOLA a plantillas locales (la pantalla NO debe romperse).
- Si la API responde con error, también cae a plantillas.

### Google Calendar marca error
- Si no están las variables, se muestra el aviso "conecta Google" y la cita igual se guarda.

### Al publicar en Vercel se pierden los datos
- Quedó SQLite en `dev.db`. En producción usa **Postgres** (ver guía).

### Login falla / sesión no persiste
- Revisa que `AUTH_SECRET` esté en Vercel y sea un texto largo aleatorio.
- En local, revisa que esté en `.env`.

## Cambios hechos

- (Aquí van las notas que vayas haciendo cuando arregles algo.)
