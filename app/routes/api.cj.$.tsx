import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  getCJCategories,
  searchCJProducts,
  filterJunk,
} from "~/lib/cj.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const action = params["*"];
  const url = new URL(request.url);

  if (action === "categories") {
    const categories = await getCJCategories();
    return json({ categories });
  }

  if (action === "products") {
    const categoryId = url.searchParams.get("categoryId") ?? "";
    const pageNum = parseInt(url.searchParams.get("page") ?? "1");
    const markupPct = parseFloat(url.searchParams.get("markup") ?? "40");

    const result = await searchCJProducts({
      categoryId,
      pageNum,
      pageSize: 20,
    });

    const filtered = filterJunk(result.list ?? []);

    const products = filtered.map((p: any) => ({
      ...p,
      sellPrice: parseFloat(
        (p.sellPrice * (1 + markupPct / 100)).toFixed(2)
      ),
      costPrice: p.sellPrice,
    }));

    return json({ products, total: result.total });
  }

  return json({ error: "Unknown action" }, { status: 400 });
}
