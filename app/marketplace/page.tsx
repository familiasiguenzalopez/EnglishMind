import { anonClient } from "@/lib/supabase/anon";
import { MarketplaceList } from "@/components/MarketplaceList";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  price_usd: number;
};

export default async function Marketplace() {
  const supabase = anonClient();
  const { data } = await supabase
    .from("marketplace_products")
    .select("id,category,title,description,price_usd")
    .eq("is_active", true)
    .order("category");
  const products = (data ?? []) as Product[];

  return (
    <main className="mx-auto max-w-5xl px-5 pt-10 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Marketplace
      </h1>
      <p className="mt-2 text-ink-muted">
        Paquetes, potenciadores y asesoría humana 1:1 para acelerar, profundizar o
        ampliar tu práctica.
      </p>
      <div className="mt-6">
        <MarketplaceList products={products} />
      </div>
    </main>
  );
}
