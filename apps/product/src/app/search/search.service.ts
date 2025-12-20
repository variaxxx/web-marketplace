import { PrismaService } from "../../db/prisma.service";
import { ProductIndexPayload, ProductInfo, ProductSearchDocument } from "./search.types";
import { IndexResponse } from "@elastic/elasticsearch/lib/api/types";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Prisma } from "@prisma/generated/productClient";
import { FindManyApiResponse, PRODUCT_STATUS, ProductInfoResponse, ProductSearchPayload } from "@web-marketplace/shared";

const productSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  sellerId: true,
  name: true,
  description: true,
  status: true,
  priceCents: true,
  category: true,
  productPictures: {
    select: { url: true },
  },
};

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly index = "products";

  constructor(
    private readonly elasticService: ElasticsearchService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.elasticService.indices.create({
        index: this.index,
        settings: {
          analysis: {
            filter: {
              english_stop: {
                type: "stop",
                stopwords: "_english_",
              },
              english_stemmer: {
                type: "stemmer",
                language: "english",
              },
              english_possessive_stemmer: {
                type: "stemmer",
                language: "possessive_english",
              },
              russian_stop: {
                type: "stop",
                stopwords: "_russian_",
              },
              russian_stemmer: {
                type: "stemmer",
                language: "russian",
              },
            },
            analyzer: {
              ru_en: {
                type: "custom",
                tokenizer: "standard",
                filter: [
                  "lowercase",
                  "russian_stop",
                  "russian_stemmer",
                  "english_possessive_stemmer",
                  "english_stop",
                  "english_stemmer",
                ],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: "keyword" },
            name: {
              type: "text",
              analyzer: "ru_en",
            },
            description: {
              type: "text",
              analyzer: "ru_en",
            },
            category: { type: "keyword" },
            priceCents: { type: "integer" },
            status: { type: "keyword" },
          },
        },
      });
    } catch {};
  }

  async indexProduct(
    product: ProductInfo,
  ): Promise<IndexResponse> {
    return this.elasticService.index<ProductIndexPayload>({
      index: this.index,
      id: product.id,
      document: {
        name: product.name,
        description: product.description,
        category: product.category,
        priceCents: product.priceCents,
        status: product.status,
      },
    });
  }

  async searchProducts(
    payload: ProductSearchPayload,
  ): Promise<FindManyApiResponse<ProductInfoResponse>> {
    const result = await this.elasticService.search<ProductSearchDocument>({
      index: this.index,
      from: payload.offset ?? 0,
      size: payload.limit ?? 20,
      sort: ["_score"],
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: payload.query,
                fields: ["name^4", "description^3"],
                type: "best_fields",
                operator: "or",
                fuzziness: "auto",
              },
            },
            {
              match_phrase: {
                name: {
                  query: payload.query,
                  boost: 3,
                },
              },
            },
            {
              match_phrase: {
                description: {
                  query: payload.query,
                  boost: 2,
                },
              },
            },
          ],
          minimum_should_match: 1,
          filter: [
            { term: { status: PRODUCT_STATUS.ON_SALE } },
            ...(payload.category ? [{ term: { category: payload.category } }] : []),
            ...(payload.minPrice || payload.maxPrice
              ? [{
                  range: {
                    priceCents: {
                      ...(payload.minPrice && { gte: payload.minPrice }),
                      ...(payload.maxPrice && { lte: payload.maxPrice }),
                    },
                  },
                }]
              : []),
          ],
        },
      },
    });

    let total = typeof result.hits.total === "object" ? result.hits.total.value : result.hits.total;
    const ids = result.hits.hits.map(i => i._id);

    if (!ids.length) {
      return {
        total,
        count: 0,
        items: [],
      };
    }

    const dbItems = await this.prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      select: productSelect,
    });

    const dbItemsMap = new Map(dbItems.map(i => [i.id, i]));
    const missedIds = ids.filter(id => !dbItemsMap.has(id));
    const items = ids.map(id => dbItemsMap.get(id)).filter(Boolean);

    if (missedIds.length) {
      this.logger.warn(`Elasticsearch desync: ${missedIds.length} products missing in DB`);

      await this.elasticService.deleteByQuery({
        index: this.index,
        query: {
          terms: {
            id: missedIds,
          },
        },
      });

      total -= missedIds.length;
    }

    return {
      total,
      count: items.length,
      items: items.map(this.toResponse),
    };
  }

  private toResponse(
    product: Prisma.ProductGetPayload<{ select: typeof productSelect }>,
  ): ProductInfoResponse {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      status: product.status,
      description: product.description,
      priceCents: product.priceCents,
      sellerId: product.sellerId,
      pictureUrls: product.productPictures.map(i => i.url),
    };
  }
}
