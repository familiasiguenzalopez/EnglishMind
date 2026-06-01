"use client";

import { useState } from "react";

type Product = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  price_usd: number;
};

// Métodos de pago de El Salvador. Transfer365 / "Pay" del BCR son los
// principales; bitcoin y Chivo son opción voluntaria.
const PAYS = [
  "Tarjeta Visa/Mastercard",
  "Transfer365 (BCR)",
  "Transfer365 QR",
  "“Pay” BCR (DUI)",
  "Pagadito",
  "Chivo Wallet (US$/BTC)",
  "Bitcoin / Lightning",
];

export function MarketplaceList({ products }: { products: Product[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [method, setMethod] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const open = products.find((p) => p.id === openId) ?? null;

  function confirm() {
    if (!open || method === null) return;
    setToast(`✓ ${open.title} activado vía ${PAYS[method]} (demo)`);
    setOpenId(null);
    setMethod(null);
    setTimeout(() => setToast(null), 3200);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-lg border border-line bg-surface p-4"
          >
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-secondary">
              {p.category}
            </div>
            <div className="mt-1 font-display text-base font-bold text-ink-bright">
              {p.title}
            </div>
            <p className="mt-1 flex-1 text-sm text-ink-muted">{p.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-xl font-extrabold text-ink-bright">
                ${p.price_usd.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpenId(p.id);
                  setMethod(null);
                }}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-dim"
              >
                Activar
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenId(null);
          }}
        >
          <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-5">
            <h3 className="font-display text-lg font-bold text-ink-bright">
              Activar: {open.title}
            </h3>
            <p className="text-sm text-ink-muted">
              ${open.price_usd.toFixed(2)} · elige tu método de pago
            </p>
            <div className="mt-3 space-y-2">
              {PAYS.map((pay, i) => (
                <button
                  key={pay}
                  type="button"
                  onClick={() => setMethod(i)}
                  className={
                    "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition " +
                    (method === i
                      ? "border-primary bg-surface2 text-ink-bright"
                      : "border-line text-ink hover:border-primary/60")
                  }
                >
                  <span className="h-2 w-2 flex-none rounded-full bg-secondary" />
                  {pay}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={confirm}
                disabled={method === null}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
              >
                Pagar
              </button>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-md border border-line px-4 py-2 text-sm text-ink"
              >
                Cancelar
              </button>
            </div>
            <p className="mt-3 text-[11px] text-ink-dim">
              En El Salvador el rail con tracción es Transfer365 / “Pay” del BCR;
              bitcoin y Chivo son opción voluntaria. (Pago real: próximamente.)
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-secondary bg-surface3 px-5 py-3 text-sm font-semibold text-ink shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
