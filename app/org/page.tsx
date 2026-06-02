"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { anonClient } from "@/lib/supabase/anon";

type Membership = {
  org_id: string;
  org_name: string;
  cohort_id: string | null;
  cohort_name: string | null;
  role: string;
};
type Cohort = { id: string; name: string; join_code: string | null };
type ReportRow = { name: string; cefr: string; xp: number; streak: number; lessons: number };

const STAFF = ["admin", "manager", "instructor"];

export default function Org() {
  const [status, setStatus] = useState<"loading" | "guest" | "ready">("loading");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [cohorts, setCohorts] = useState<Record<string, Cohort[]>>({});
  const [routes, setRoutes] = useState<{ slug: string; name: string }[]>([]);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("colegio");
  const [newCohort, setNewCohort] = useState<Record<string, { name: string; route: string }>>({});
  const [report, setReport] = useState<Record<string, ReportRow[]>>({});
  const [busy, setBusy] = useState(false);

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("guest");
      return;
    }
    const { data: mem } = await supabase.rpc("my_memberships");
    const list = (mem ?? []) as Membership[];
    setMemberships(list);
    const staffOrgs = [...new Set(list.filter((m) => STAFF.includes(m.role)).map((m) => m.org_id))];
    const byOrg: Record<string, Cohort[]> = {};
    for (const org of staffOrgs) {
      const { data: cs } = await supabase
        .from("cohorts")
        .select("id,name,join_code")
        .eq("org_id", org);
      byOrg[org] = (cs ?? []) as Cohort[];
    }
    setCohorts(byOrg);
    setStatus("ready");
  }

  useEffect(() => {
    (async () => {
      const { data } = await anonClient().from("routes").select("slug,name").order("sort_order");
      setRoutes((data ?? []) as { slug: string; name: string }[]);
      try {
        await load();
      } catch {
        setStatus("guest");
      }
    })();
  }, []);

  async function createOrg() {
    if (!orgName.trim() || busy) return;
    setBusy(true);
    try {
      await createClient().rpc("create_org", { p_name: orgName, p_type: orgType });
      setOrgName("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function createCohort(org: string) {
    const nc = newCohort[org] ?? { name: "", route: "" };
    if (!nc.name.trim() || busy) return;
    setBusy(true);
    try {
      await createClient().rpc("create_cohort", {
        p_org: org,
        p_name: nc.name,
        p_route: nc.route || null,
      });
      setNewCohort((s) => ({ ...s, [org]: { name: "", route: "" } }));
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function viewReport(cohortId: string) {
    if (report[cohortId]) {
      setReport((r) => {
        const c = { ...r };
        delete c[cohortId];
        return c;
      });
      return;
    }
    const { data } = await createClient().rpc("cohort_report", { p_cohort: cohortId });
    setReport((r) => ({ ...r, [cohortId]: (data ?? []) as ReportRow[] }));
  }

  const staffOrgs = [
    ...new Map(
      memberships.filter((m) => STAFF.includes(m.role)).map((m) => [m.org_id, m]),
    ).values(),
  ];
  const learnerOf = memberships.filter((m) => m.role === "learner");

  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-28">
      <Link href="/home" className="text-sm text-ink-muted hover:text-ink">‹ Inicio</Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-bright">
        Colegios y empresas
      </h1>
      <p className="mt-2 text-ink-muted">
        Sube a tu equipo o grupo a inglés. Ves el progreso, <strong>nunca</strong>{" "}
        las conversaciones — medir sin vigilar.
      </p>

      {status === "loading" && <p className="mt-6 text-ink-muted">Cargando…</p>}

      {status === "guest" && (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <p className="text-ink">Inicia sesión para gestionar o unirte a una organización.</p>
          <Link href="/login" className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Iniciar sesión
          </Link>
        </div>
      )}

      {status === "ready" && (
        <>
          {/* Soy alumno */}
          {learnerOf.map((m) => (
            <div key={m.org_id} className="mt-4 rounded-lg border border-line bg-surface2 p-4 text-sm">
              Eres alumno en <span className="font-bold text-ink-bright">{m.org_name}</span>
              {m.cohort_name ? <> · cohorte <span className="text-ink">{m.cohort_name}</span></> : null}.
            </div>
          ))}

          {/* Orgs donde soy staff */}
          {staffOrgs.map((org) => (
            <section key={org.org_id} className="mt-6 rounded-lg border border-line bg-surface p-5">
              <div className="font-display text-lg font-bold text-ink-bright">{org.org_name}</div>

              <div className="mt-3 space-y-2">
                {(cohorts[org.org_id] ?? []).map((c) => (
                  <div key={c.id} className="rounded-md border border-line bg-surface2 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-bright">{c.name}</span>
                      <span className="text-xs text-ink-muted">
                        código: <span className="font-mono text-secondary">{c.join_code}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => viewReport(c.id)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      {report[c.id] ? "ocultar progreso" : "ver progreso de la cohorte"}
                    </button>
                    {report[c.id] && (
                      <div className="mt-2 overflow-x-auto">
                        {report[c.id].length === 0 ? (
                          <p className="text-xs text-ink-muted">Aún no hay alumnos. Comparte el código.</p>
                        ) : (
                          <table className="w-full text-left text-xs">
                            <thead className="text-ink-muted">
                              <tr>
                                <th className="py-1">Alumno</th><th>CEFR</th><th>XP</th><th>Racha</th><th>Lecciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report[c.id].map((r, i) => (
                                <tr key={i} className="border-t border-line">
                                  <td className="py-1 text-ink-bright">{r.name}</td>
                                  <td className="text-secondary">{r.cefr}</td>
                                  <td>{r.xp}</td>
                                  <td>🔥 {r.streak}</td>
                                  <td>{r.lessons}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Crear cohorte */}
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <input
                  value={newCohort[org.org_id]?.name ?? ""}
                  onChange={(e) =>
                    setNewCohort((s) => ({ ...s, [org.org_id]: { name: e.target.value, route: s[org.org_id]?.route ?? "" } }))
                  }
                  placeholder="Nueva cohorte (ej. 9° A)"
                  className="flex-1 rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm text-ink outline-none focus:border-primary"
                />
                <select
                  value={newCohort[org.org_id]?.route ?? ""}
                  onChange={(e) =>
                    setNewCohort((s) => ({ ...s, [org.org_id]: { name: s[org.org_id]?.name ?? "", route: e.target.value } }))
                  }
                  className="rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm text-ink"
                >
                  <option value="">Ruta (opcional)</option>
                  {routes.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => createCohort(org.org_id)}
                  disabled={busy}
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-bold text-white hover:bg-primary-dim disabled:opacity-40"
                >
                  Crear cohorte
                </button>
              </div>
            </section>
          ))}

          {/* Crear org si no hay ninguna */}
          {memberships.length === 0 && (
            <div className="mt-6 rounded-lg border border-line bg-surface p-5">
              <div className="font-display font-bold text-ink-bright">Crea tu organización</div>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Nombre (colegio o empresa)"
                  className="flex-1 rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm text-ink outline-none focus:border-primary"
                />
                <select value={orgType} onChange={(e) => setOrgType(e.target.value)} className="rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm text-ink">
                  <option value="colegio">Colegio</option>
                  <option value="empresa">Empresa</option>
                </select>
                <button type="button" onClick={createOrg} disabled={busy} className="rounded-md bg-primary px-4 py-1.5 text-sm font-bold text-white hover:bg-primary-dim disabled:opacity-40">
                  Crear
                </button>
              </div>
              <p className="mt-3 text-xs text-ink-dim">
                ¿Te invitaron? <Link href="/unirse" className="underline">Únete con un código</Link>.
              </p>
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-ink-dim">
            🔒 Medir sin vigilar: el reporte muestra nivel, XP, racha y lecciones —
            <strong> nunca</strong> las conversaciones, textos ni grabaciones del
            alumno (lo garantiza la base de datos). Respetamos a tu gente.
          </p>
        </>
      )}
    </main>
  );
}
