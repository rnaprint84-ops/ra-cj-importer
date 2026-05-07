import { useState, useCallback } from "react";
import { Page, Layout, Card, Button, Banner, BlockStack, Text } from "@shopify/polaris";
import { CategoryBrowser } from "~/components/CategoryBrowser";
import { ProductGrid } from "~/components/ProductGrid";
import { MarkupControl } from "~/components/MarkupControl";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const body = await request.json();
  const { products } = body;

  const results = await Promise.allSettled(
    products.map((p: any) =>
      admin.graphql(`
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product { id title }
            userErrors { field message }
          }
        }
      `, {
        variables: {
          input: {
            title: p.productNameEn,
            descriptionHtml: p.description ?? "",
            vendor: "CJ Dropshipping",
            status: "DRAFT",
            images: [{ src: p.productImage }],
            variants: [{
              price: String(p.sellPrice),
              inventoryManagement: "SHOPIFY",
            }],
          },
        },
      })
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  return json({ succeeded, failed });
}

export default function CJImporter() {
  const [markup, setMarkup] = useState(40);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleSearch = useCallback(async (catId: string) => {
    if (!catId) return;
    setLoading(true);
    const res = await fetch(
      `/api/cj/products?categoryId=${catId}&markup=${markup}&page=1`
    );
    const data = await res.json();
    setProducts(data.products ?? []);
    setSelected(new Set());
    setLoading(false);
  }, [markup]);

  const toggleProduct = (pid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  };

  const handleImport = async () => {
    const toImport = products.filter((p) => selected.has(p.pid));
    const res = await fetch("/app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: toImport }),
    });
    const result = await res.json();
    setImportResult(result);
  };

  return (
    <Page
      title="R&A CJ Importer"
      subtitle="Browse CJ Dropshipping · Filter · Approve · Import"
      primaryAction={{
        content: `Import Selected (${selected.size})`,
        disabled: selected.size === 0,
        onAction: handleImport,
      }}
    >
      <Layout>
        <Layout.Section>
          {importResult && (
            <Banner
              tone={importResult.failed > 0 ? "warning" : "success"}
              onDismiss={() => setImportResult(null)}
            >
              ✅ {importResult.succeeded} imported
              {importResult.failed > 0 && ` · ⚠️ ${importResult.failed} failed`}
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <MarkupControl markup={markup} onChange={setMarkup} />
              <CategoryBrowser
                onSelect={(id) => {
                  setCategoryId(id);
                  handleSearch(id);
                }}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {loading && <Text as="p">Loading products...</Text>}
          {!loading && products.length > 0 && (
            <ProductGrid
              products={products}
              selected={selected}
              onToggle={toggleProduct}
              onSelectAll={() =>
                setSelected(new Set(products.map((p) => p.pid)))
              }
              onDeselectAll={() => setSelected(new Set())}
            />
          )}
          {!loading && products.length === 0 && categoryId && (
            <Text as="p">No products found for this category.</Text>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
