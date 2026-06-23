-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "correo" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "slugAgenda" TEXT,
    "metaMensual" REAL NOT NULL DEFAULT 0,
    "metaClientesMensual" INTEGER NOT NULL DEFAULT 0,
    "comisionPorcentaje" REAL NOT NULL DEFAULT 0,
    "temaPreferido" TEXT NOT NULL DEFAULT 'auto',
    "onboardingCompletado" BOOLEAN NOT NULL DEFAULT false,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoHasta" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiraEn" DATETIME NOT NULL,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "origen" TEXT,
    "canalUtm" TEXT,
    "etapa" TEXT NOT NULL DEFAULT 'NUEVO',
    "estadoCartera" TEXT NOT NULL DEFAULT 'ACTIVO',
    "temperatura" TEXT,
    "objecion" TEXT,
    "valorEstimado" REAL NOT NULL DEFAULT 0,
    "servicioInteres" TEXT,
    "tipoContacto" TEXT,
    "notas" TEXT,
    "primerContacto" DATETIME,
    "ultimoContacto" DATETIME,
    "proximaAccion" TEXT,
    "proximaAccionEn" DATETIME,
    "empresaNombre" TEXT,
    "empresaGiro" TEXT,
    "empresaPuesto" TEXT,
    "empresaRfc" TEXT,
    "empresaSitioWeb" TEXT,
    "empresaDireccion" TEXT,
    "empresaTamano" TEXT,
    "empresaNotas" TEXT,
    "motivoPerdida" TEXT,
    "resultadoFinal" TEXT,
    "etapaAnterior" TEXT,
    "vendedorId" TEXT,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Cliente_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT,
    "vendedorId" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "duracionMin" INTEGER NOT NULL DEFAULT 30,
    "estado" TEXT NOT NULL DEFAULT 'AGENDADA',
    "titulo" TEXT,
    "notas" TEXT,
    "ligaMeet" TEXT,
    "googleEventId" TEXT,
    "nombreInvitado" TEXT,
    "telefonoInvitado" TEXT,
    "correoInvitado" TEXT,
    "eliminadoEn" DATETIME,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cita_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "registradoPorId" TEXT,
    "monto" REAL NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "metodo" TEXT NOT NULL,
    "concepto" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaPago" DATETIME,
    "fechaVencimiento" DATETIME,
    "folioRecibo" TEXT,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pago_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "contenido" TEXT NOT NULL,
    "eliminadoEn" DATETIME,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Nota_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventoLineaTiempo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "detalle" TEXT,
    "autorId" TEXT,
    "autorNombre" TEXT,
    "ocurridoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventoLineaTiempo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "recursoTipo" TEXT NOT NULL,
    "recursoId" TEXT,
    "resumen" TEXT NOT NULL,
    "ip" TEXT,
    "ocurridoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Archivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "subidoPorId" TEXT,
    "nombre" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL DEFAULT 'Otro',
    "tipoMime" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "contenidoBase" TEXT,
    "url" TEXT,
    "eliminadoEn" DATETIME,
    "subidoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Archivo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Archivo_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Etiqueta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3fbf8f',
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EtiquetaEnCliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "etiquetaId" TEXT NOT NULL,
    CONSTRAINT "EtiquetaEnCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EtiquetaEnCliente_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "Etiqueta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "Favorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VistaGuardada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "filtros" TEXT NOT NULL,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VistaGuardada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recordatorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "texto" TEXT NOT NULL,
    "cuando" DATETIME NOT NULL,
    "hecho" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recordatorio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recordatorio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plantilla" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "nombre" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'whatsapp',
    "asunto" TEXT,
    "cuerpo" TEXT NOT NULL,
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "etapa" TEXT,
    "objecion" TEXT,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Plantilla_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreNegocio" TEXT NOT NULL DEFAULT 'SUPERLATIVO',
    "colorMarca" TEXT NOT NULL DEFAULT '#3fbf8f',
    "monedaPrincipal" TEXT NOT NULL DEFAULT 'MXN',
    "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "horarioInicio" TEXT NOT NULL DEFAULT '09:00',
    "horarioFin" TEXT NOT NULL DEFAULT '18:00',
    "duracionCitaMin" INTEGER NOT NULL DEFAULT 30,
    "diasLaborables" TEXT NOT NULL DEFAULT 'L,M,X,J,V',
    "metaMensual" REAL NOT NULL DEFAULT 30000,
    "metaClientesMensual" INTEGER NOT NULL DEFAULT 5,
    "metodosPago" TEXT NOT NULL DEFAULT 'Transferencia,Tarjeta,Liga de pago (Stripe/Mercado Pago)',
    "motivosPerdida" TEXT NOT NULL DEFAULT 'Precio,Se fue con la competencia,No contestó,No era buen momento,No calificaba,Otro',
    "mensajeWhatsApp" TEXT NOT NULL DEFAULT '',
    "ciudadNegocio" TEXT NOT NULL DEFAULT 'León, Guanajuato',
    "umbralEstancamiento" INTEGER NOT NULL DEFAULT 7,
    "etapasCustom" TEXT,
    "comisionPorcentaje" REAL NOT NULL DEFAULT 0,
    "actualizadaEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConfigMensajeria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "firma" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "ConfigMensajeria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadCapturadoCrudo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "mensaje" TEXT,
    "origen" TEXT,
    "canalUtm" TEXT,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "errorProceso" TEXT,
    "capturadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_slugAgenda_key" ON "Usuario"("slugAgenda");

-- CreateIndex
CREATE INDEX "Usuario_correo_idx" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_slugAgenda_idx" ON "Usuario"("slugAgenda");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_token_key" ON "Sesion"("token");

-- CreateIndex
CREATE INDEX "Sesion_token_idx" ON "Sesion"("token");

-- CreateIndex
CREATE INDEX "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateIndex
CREATE INDEX "Cliente_correo_idx" ON "Cliente"("correo");

-- CreateIndex
CREATE INDEX "Cliente_empresaNombre_idx" ON "Cliente"("empresaNombre");

-- CreateIndex
CREATE INDEX "Cliente_etapa_idx" ON "Cliente"("etapa");

-- CreateIndex
CREATE INDEX "Cliente_estadoCartera_idx" ON "Cliente"("estadoCartera");

-- CreateIndex
CREATE INDEX "Cliente_vendedorId_idx" ON "Cliente"("vendedorId");

-- CreateIndex
CREATE INDEX "Cliente_eliminadoEn_idx" ON "Cliente"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Cliente_proximaAccionEn_idx" ON "Cliente"("proximaAccionEn");

-- CreateIndex
CREATE INDEX "Cliente_temperatura_idx" ON "Cliente"("temperatura");

-- CreateIndex
CREATE INDEX "Cita_vendedorId_inicio_idx" ON "Cita"("vendedorId", "inicio");

-- CreateIndex
CREATE INDEX "Cita_clienteId_idx" ON "Cita"("clienteId");

-- CreateIndex
CREATE INDEX "Cita_eliminadoEn_idx" ON "Cita"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Pago_clienteId_idx" ON "Pago"("clienteId");

-- CreateIndex
CREATE INDEX "Pago_estado_idx" ON "Pago"("estado");

-- CreateIndex
CREATE INDEX "Pago_fechaPago_idx" ON "Pago"("fechaPago");

-- CreateIndex
CREATE INDEX "Pago_fechaVencimiento_idx" ON "Pago"("fechaVencimiento");

-- CreateIndex
CREATE INDEX "Pago_eliminadoEn_idx" ON "Pago"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Nota_clienteId_idx" ON "Nota"("clienteId");

-- CreateIndex
CREATE INDEX "EventoLineaTiempo_clienteId_ocurridoEn_idx" ON "EventoLineaTiempo"("clienteId", "ocurridoEn");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_usuarioId_idx" ON "RegistroAuditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_ocurridoEn_idx" ON "RegistroAuditoria"("ocurridoEn");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_recursoTipo_recursoId_idx" ON "RegistroAuditoria"("recursoTipo", "recursoId");

-- CreateIndex
CREATE INDEX "Archivo_clienteId_idx" ON "Archivo"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Etiqueta_nombre_key" ON "Etiqueta"("nombre");

-- CreateIndex
CREATE INDEX "EtiquetaEnCliente_clienteId_idx" ON "EtiquetaEnCliente"("clienteId");

-- CreateIndex
CREATE INDEX "EtiquetaEnCliente_etiquetaId_idx" ON "EtiquetaEnCliente"("etiquetaId");

-- CreateIndex
CREATE UNIQUE INDEX "EtiquetaEnCliente_clienteId_etiquetaId_key" ON "EtiquetaEnCliente"("clienteId", "etiquetaId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_usuarioId_clienteId_key" ON "Favorito"("usuarioId", "clienteId");

-- CreateIndex
CREATE INDEX "Recordatorio_usuarioId_cuando_idx" ON "Recordatorio"("usuarioId", "cuando");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigMensajeria_usuarioId_key" ON "ConfigMensajeria"("usuarioId");

-- CreateIndex
CREATE INDEX "LeadCapturadoCrudo_procesado_idx" ON "LeadCapturadoCrudo"("procesado");
