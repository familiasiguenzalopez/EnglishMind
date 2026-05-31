# EnglishMind AI

Academia de inglés con IA para El Salvador y LATAM. PWA mobile-first, pensada para Android de gama media/baja.
La pedagogía (Sección 00) rige todo: **filtro afectivo bajo, el error informa y no castiga, utilidad visible, progreso honesto.**

## Stack

- **Frontend:** Next.js (App Router) como PWA · Tailwind CSS · TypeScript
- **Backend:** Supabase (Auth, Postgres + RLS, Edge Functions, Storage cifrado)
- **IA:** orquestador server-side con fallback por niveles; claves siempre en el servidor (Vault)
- **Deploy:** Vercel (frontend) + Supabase Cloud (backend)

## Estructura

```
app/                # rutas y UI (App Router) + design system (globals.css)
components/ui/       # componentes pedagógicos núcleo (Stream A)
lib/                 # utilidades + clientes Supabase (browser/server)
supabase/
  migrations/        # schema v1 + RLS (Stream B)
  functions/         # Edge Functions — orquestador de IA (Stream C)
  seed.sql           # tutores y planes de ejemplo
MD/                  # documentación de diseño y negocio (referencia)
```

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000  (galería de fundaciones / design system)
npm run build        # verificación de build
```

Variables de entorno: copia `.env.example` a `.env.local`. Las claves de IA NO van en el cliente
— se configuran como secrets del servidor (`supabase secrets set ...`).

## Estado — Fase 0 (Fundaciones)

- [x] Scaffolding Next.js + TypeScript + Tailwind
- [x] Design system (tokens derivados del panel admin aprobado) + fuentes
- [x] Componentes pedagógicos núcleo (CEFR, score de pronunciación, modo ensayo, tutor, estados)
- [x] Schema Supabase v1 + RLS base ("medir sin vigilar", owner-only)
- [x] Esqueleto del orquestador (Edge Function: cerebro del tutor vía Claude)
- [x] PWA shell (manifest + theme)
- [ ] Provisionar proyecto Supabase + conectar (requiere cuenta/secrets)
- [ ] Deploy inicial a Vercel
- [ ] Service worker offline (Serwist)

Ver el roadmap completo por fases en la conversación de planificación.
