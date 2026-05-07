import { Select } from "@shopify/polaris";
import { useEffect, useState } from "react";

interface Category {
  categoryId: string;
  categoryName: string;
  children?: Category[];
}

interface Props {
  onSelect: (categoryId: string) => void;
}

export function CategoryBrowser({ onSelect }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    fetch("/api/cj/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  const options = categories.map((c) => ({
    label: c.categoryName,
    value: c.categoryId,
  }));

  return (
    <Select
      label="Browse CJ Category"
      options={[{ label: "Select a category...", value: "" }, ...options]}
      value={selected}
      onChange={(val) => {
        setSelected(val);
        onSelect(val);
      }}
    />
  );
}
