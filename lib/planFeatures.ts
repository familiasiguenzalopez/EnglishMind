// Convierte el jsonb de features de un plan en viñetas legibles en español.
// Tolera claves ausentes (cada plan trae un subconjunto distinto).
type Features = Record<string, unknown>;

export function planBullets(features: Features): string[] {
  const f = features as Record<string, any>;
  const b: string[] = [];
  if (f.voz_min_dia != null) b.push(`${f.voz_min_dia} min de voz/día`);
  if (f.voz === "ilimitada") b.push("Conversación de voz ilimitada");
  if (f.tutores === 1) b.push("1 tutor");
  else if (f.tutores) b.push("Los 6 tutores");
  if (f.rutas === 1) b.push("1 ruta");
  else if (f.rutas) b.push("Todas las rutas");
  if (f.offline) b.push("Modo offline");
  if (f.cert_anio === "ilimitado") b.push("Certificados ilimitados");
  else if (f.cert_anio) b.push(`${f.cert_anio} certificado/año`);
  if (f.yo_antes) b.push("Yo de antes");
  if (f.yo_futuro_voz) b.push("Yo Futuro (voz)");
  if (f.yo_futuro_video) b.push("Yo Futuro (avatar video)");
  if (f.sesion_humana_mes) b.push(`${f.sesion_humana_mes} sesión con humano/mes`);
  if (f.marketplace_usd) b.push(`$${f.marketplace_usd} en marketplace/mes`);
  // Colegios
  if (f.min_alumnos) b.push(`Desde ${f.min_alumnos} alumnos`);
  if (f.docentes === 1) b.push("1 docente");
  else if (f.docentes) b.push(`Hasta ${f.docentes} docentes`);
  if (f.managers) b.push("Managers ilimitados");
  if (f.alta) b.push(`Alta por ${String(f.alta).toUpperCase()}`);
  if (typeof f.branding === "string") b.push(`Branding ${f.branding}`);
  if (f.api) b.push("Reportes + API");
  return b;
}
