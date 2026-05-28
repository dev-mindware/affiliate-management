import { BadRequestException } from "@nestjs/common";
import { BaseFilterDto } from "../dto/filter.dto";

export function normalizePagination(filter: BaseFilterDto) {
  const page = Math.max(1, Number(filter.page || 1));
  const limit = Math.min(100, Math.max(1, Number(filter.limit || 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export function dateRange(filter: BaseFilterDto) {
  const createdAt: Record<string, Date> = {};
  if (filter.createdFrom) createdAt.gte = new Date(filter.createdFrom);
  if (filter.createdTo) createdAt.lte = new Date(filter.createdTo);
  return Object.keys(createdAt).length ? { createdAt } : {};
}

export function orderBy(filter: BaseFilterDto, allowed: Record<string, string>, fallback: string) {
  const key = filter.orderBy || fallback;
  const field = allowed[key];
  if (!field) throw new BadRequestException(`Campo orderBy invÃ¡lido: ${key}`);
  return { [field]: String(filter.orderDirection || "desc").toLowerCase() === "asc" ? "asc" : "desc" };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
