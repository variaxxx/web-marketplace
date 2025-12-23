import { PrismaService } from "../../db/prisma.service";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { CategoryInfoResponse, CreateCategoryPayload, DeleteCategoryPayload, EditCategoryPayload, FindOneCategoryPayload, normalizeText, PrismaQueryError } from "@web-marketplace/shared";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_category_id: string;
  depth: number;
}

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private buildCategoriesTree(
    categories: Category[],
  ): CategoryInfoResponse[] {
    const categoriesMap = new Map<string, CategoryInfoResponse>();
    const result: CategoryInfoResponse[] = [];

    for (const category of categories) {
      categoriesMap.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        children: [],
      });
    }

    for (const category of categories) {
      if (category.parent_category_id && categoriesMap.get(category.parent_category_id)) {
        categoriesMap.get(category.parent_category_id).children.push(categoriesMap.get(category.id));
      } else {
        result.push(categoriesMap.get(category.id));
      }
    }

    return result;
  }

  async create(
    payload: CreateCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    let slug: string = payload.slugNode.trim();
    if (payload.parentCategoryId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: payload.parentCategoryId },
      });

      if (!parent) {
        throw new RpcException({
          status: 400,
          message: "Parent category not found",
        });
      }

      const parentSlug = parent.slug;
      if (slug.includes(" ")) {
        throw new RpcException({
          status: 400,
          message: "Slug node can`t include whitespaces",
        });
      }
      slug = `${parentSlug}/${slug}`;
    }

    const category = await this.prisma.category.create({
      data: {
        name: normalizeText(payload.name, "name"),
        slug,
        parentCategoryId: payload.parentCategoryId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.UniqueConstraintViolation) {
        throw new RpcException({
          status: 400,
          message: "Category with this slug already exists",
        });
      }
      throw e;
    });

    return {
      ...category,
      children: [],
    };
  }

  async edit(
    payload: EditCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    let slug: string | undefined;
    if (payload.slugNode) {
      const parent = await this.prisma.category.findUnique({
        where: { id: payload.categoryId },
        select: {
          parent: { select: { slug: true } },
        },
      });

      if (!parent) {
        throw new RpcException({
          status: 404,
          message: "Category not found",
        });
      }

      const slugNode = normalizeText(payload.slugNode, "slugNode");
      slug = `${parent.parent.slug}/${slugNode}`;
    }

    const category = await this.prisma.category.update({
      where: {
        id: payload.categoryId,
      },
      data: {
        name: payload.name ? normalizeText(payload.name, "name") : undefined,
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound) {
        throw new RpcException({
          status: 404,
          message: "Category not found",
        });
      }
      throw e;
    });

    return {
      ...category,
      children: [],
    };
  }

  async findAll(): Promise<CategoryInfoResponse[]> {
    const categories: Category[] = await this.prisma.$queryRaw`
      WITH RECURSIVE category_tree AS (
        SELECT
          id,
          name,
          slug,
          parent_category_id,
          0 as depth
        FROM categories
        WHERE parent_category_id IS NULL

        UNION ALL

        SELECT
          c.id,
          c.name,
          c.slug,
          c.parent_category_id,
          ct.depth + 1
        FROM categories c
        JOIN category_tree ct ON c.parent_category_id = ct.id
      )
      SELECT *
      FROM category_tree
      ORDER BY depth, name;
      `;

    return this.buildCategoriesTree(categories);
  }

  async findOne(
    payload: FindOneCategoryPayload,
  ): Promise<CategoryInfoResponse> {
    const categories = await this.prisma.$queryRaw<Category[]>`
      WITH RECURSIVE category_tree AS (
        SELECT
          id,
          name,
          slug,
          parent_category_id,
          0 AS depth
        FROM categories
        WHERE id = ${payload.categoryId}::text

        UNION ALL

        SELECT
          c.id,
          c.name,
          c.slug,
          c.parent_category_id,
          ct.depth + 1
        FROM categories c
        JOIN category_tree ct ON c.parent_category_id = ct.id
      )
      SELECT *
      FROM category_tree
      ORDER BY depth, name;
    `;

    return this.buildCategoriesTree(categories)[0];
  }

  async delete(
    payload: DeleteCategoryPayload,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.category.delete({
        where: { id: payload.categoryId },
      }),
      this.prisma.product.updateMany({
        where: { categoryId: payload.categoryId },
        data: { categoryId: payload.redirectCategoryId },
      }),
    ]).catch((e) => {
      if (e.code === PrismaQueryError.RecordsNotFound) {
        throw new RpcException({
          status: 404,
          message: "Category not found",
        });
      } else if (e.code === PrismaQueryError.ForeignConstraintViolation) {
        throw new RpcException({
          status: 404,
          message: "Redirect category not found",
        });
      }
      throw e;
    });
  }
}
