import { InlineStack, TextField, Text } from "@shopify/polaris";

interface Props {
  markup: number;
  onChange: (val: number) => void;
}

export function MarkupControl({ markup, onChange }: Props) {
  return (
    <InlineStack gap="300" align="center">
      <Text as="span" variant="bodyMd">Markup %</Text>
      <div style={{ width: 100 }}>
        <TextField
          label=""
          labelHidden
          type="number"
          value={String(markup)}
          onChange={(v) => onChange(parseFloat(v) || 0)}
          suffix="%"
          autoComplete="off"
        />
      </div>
    </InlineStack>
  );
}
