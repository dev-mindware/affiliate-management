import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AffiliateStatus, UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userRoleLower = user?.role ? String(user.role).toLowerCase() : "";
    const allowedRolesLower = roles.map((r) => String(r).toLowerCase());

    if (!allowedRolesLower.includes(userRoleLower)) {
      throw new ForbiddenException("Acesso negado");
    }

    if (allowedRolesLower.includes("affiliate") && userRoleLower === "affiliate") {
      const statusLower = user.affiliate?.status ? String(user.affiliate.status).toLowerCase() : "";
      if (statusLower !== "active") {
        throw new ForbiddenException("Afiliado nao esta activo");
      }
    }

    return true;
  }
}
