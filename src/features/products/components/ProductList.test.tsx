import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductListContent } from "@/features/products/components/ProductList";

describe("ProductListContent", () => {
  it("shows newly registered products in the catalog", () => {
    const markup = renderToStaticMarkup(
      <ProductListContent
        result={{
          status: "success",
          products: [{
            id: "2",
            code: "BET-0002",
            categoryId: "1",
            name: "Tren nuevo",
            description: null,
            price: 100,
            stock: 2,
            imageUrl: null,
            isActive: true,
          }],
        }}
      />,
    );

    expect(markup).toContain("Tren nuevo");
    expect(markup).toContain("BET-0002");
  });

  it("renders the empty state", () => {
    const markup = renderToStaticMarkup(<ProductListContent result={{ status: "success", products: [] }} />);
    expect(markup).toContain("Aún no hay productos disponibles");
  });

  it("renders the safe error state", () => {
    const markup = renderToStaticMarkup(<ProductListContent result={{ status: "error", message: "No pudimos cargar los productos." }} />);
    expect(markup).toContain("No pudimos cargar el catálogo");
    expect(markup).toContain("No pudimos cargar los productos.");
  });
});
