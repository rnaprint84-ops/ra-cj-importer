const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

const headers = () => ({
  "CJ-Access-Token": process.env.CJ_API_KEY!,
  "Content-Type": "application/json",
});

export async function getCJCategories() {
  const res = await fetch(`${CJ_BASE}/product/getCategory`, {
    headers: headers(),
  });
  const data = await res.json();
  return data.data ?? [];
}

export async function searchCJProducts(params: {
  categoryId: string;
  pageNum: number;
  pageSize: number;
}) {
  const res = await fetch(`${CJ_BASE}/product/list`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      ...params,
      countryCode: "US",
      isFreeShipping: 1,
    }),
  });
  const data = await res.json();
  return data.data ?? { list: [], total: 0 };
}

const EXCLUDE_KEYWORDS = [
  "patio", "couch", "sofa", "decorative", "ornament",
  "figurine", "cheap", "novelty", "cushion", "throw pillow"
];

export function filterJunk(products: any[]) {
  return products.filter((p) => {
    const title = (p.productNameEn ?? "").toLowerCase();
    return !EXCLUDE_KEYWORDS.some((kw) => title.includes(kw));
  });
}

export function applyMarkup(costPrice: number, markupPct: number): number {
  return parseFloat((costPrice * (1 + markupPct / 100)).toFixed(2));
}
