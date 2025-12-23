import { SearchHit, SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { ProductStatus } from "@web-marketplace/shared";

export interface ProductIndexPayload {
  name: string;
  category: string;
  description: string;
  priceCents: number;
  status: ProductStatus;
}

export interface ProductSearchDocument extends ProductIndexPayload {
  id: string;
}

export type ProductSearchResult = SearchResponse<ProductSearchDocument>;

export type ProductSearchHit = SearchHit<ProductSearchDocument>;

export interface ProductInfo {
  id: string;
  name: string;
  category: {
    name: string;
    slug: string;
  };
  description: string;
  priceCents: number;
  status: ProductStatus;
}
