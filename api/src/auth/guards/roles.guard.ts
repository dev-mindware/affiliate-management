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
    if (!roles.includes(request.user?.role)) throw new ForbiddenException("Acesso negado");
    if (roles.includes(UserRole.AFFILIATE) && request.user?.role === UserRole.AFFILIATE) {
      if (request.affiliate?.status !== AffiliateStatus.ACTIVE) throw new ForbiddenException("Afiliado nÃ£o estÃ¡ activo");
    }
    return true;
  }
}
