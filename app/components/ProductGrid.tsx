import {
  Card, Checkbox, InlineStack, Text, Thumbnail, BlockStack
} from "@shopify/polaris";

interface Product {
  pid: string;
  productNameEn: string;
  productImage: string;
  costPrice: number;
  sellPrice: number;
  shippingTime: string;
}

interface Props {
  products: Product[];
  selected: Set<string>;
  onToggle: (pid: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function ProductGrid({
  products, selected, onToggle, onSelectAll, onDeselectAll
}: Props) {
  return (
    <BlockStack gap="400">
      <InlineStack gap="300">
        <button onClick={onSelectAll}>Select All</button>
        <button onClick={onDeselectAll}>Deselect All</button>
        <Text as="span" variant="bodyMd">
          {selected.size} selected
        </Text>
      </InlineStack>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "16px"
      }}>
        {products.map((p) => (
          <Card key={p.pid}>
            <BlockStack gap="200">
              <Thumbnail
                source={p.productImage}
                alt={p.productNameEn}
                size="large"
              />
              <Text as="p" variant="bodyMd" fontWeight="bold">
                {p.productNameEn}
              </Text>
              <Text as="p" variant="bodySm">
                Cost: ${p.costPrice.toFixed(2)}
              </Text>
              <Text as="p" variant="bodySm" tone="success">
                Sell: ${p.sellPrice.toFixed(2)}
              </Text>
              <Checkbox
                label="Import this product"
                checked={selected.has(p.pid)}
                onChange={() => onToggle(p.pid)}
              />
            </BlockStack>
          </Card>
        ))}
      </div>
    </BlockStack>
  );
}
