import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import { FormLoginDto, LoginDto, RegisterDto } from "./dto/auth.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Public()
  @Post("login/json")
  async loginJson(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.auth.login(body.email, body.password);
    res.cookie("refresh_token", token.refresh_token, { httpOnly: true, sameSite: "lax" });
    return token;
  }

  @Public()
  @Post("login")
  login(@Body() body: FormLoginDto, @Res({ passthrough: true }) res: Response) {
    return this.loginJson({ email: body.username || body.email, password: body.password }, res);
  }

  @Public()
  @Post("refresh")
  refresh() {
    return { msg: "Use /auth/login/json para renovar sessao nesta versao NestJS." };
  }

  @Public()
  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("refresh_token");
    return { msg: "Logout realizado com sucesso" };
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentUser() user: any) {
    return this.auth.me(user);
  }
}
