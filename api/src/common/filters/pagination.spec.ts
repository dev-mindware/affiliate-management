import { BadRequestException } from "@nestjs/common";
import { dateRange, normalizePagination, orderBy, paginated } from "./pagination";

describe("filter helpers", () => {
  it("normalizes pagination bounds", () => {
    expect(normalizePagination({ page: 0, limit: 999 })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(normalizePagination({ page: 3, limit: 20 })).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it("builds whitelisted ordering", () => {
    expect(orderBy({ orderBy: "created_at", orderDirection: "asc" }, { created_at: "createdAt" }, "created_at")).toEqual({ createdAt: "asc" });
    expect(() => orderBy({ orderBy: "unsafe" }, { created_at: "createdAt" }, "created_at")).toThrow(BadRequestException);
  });

  it("builds date range and paginated response", () => {
    expect(dateRange({ createdFrom: "2026-01-01", createdTo: "2026-01-31" })).toHaveProperty("createdAt");
    expect(paginated([1, 2], 5, 1, 2)).toEqual({ items: [1, 2], total: 5, page: 1, limit: 2, pages: 3 });
  });
});
