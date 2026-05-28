import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
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
  @ApiOperation({ summary: "Register a new affiliate", description: "Creates a new affiliate account that will be set to PENDING_APPROVAL status." })
  @ApiResponse({ status: 201, description: "Affiliate successfully registered." })
  @ApiResponse({ status: 400, description: "Email already registered or validation error." })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Public()
  @Post("login/json")
  @ApiOperation({ summary: "JSON Login", description: "Authenticates an affiliate or admin using email and password, returning access and refresh tokens." })
  @ApiResponse({ status: 201, description: "Successfully authenticated." })
  @ApiResponse({ status: 401, description: "Invalid credentials or account pending approval." })
  async loginJson(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.auth.login(body.email, body.password);
    res.cookie("refresh_token", token.refresh_token, { httpOnly: true, sameSite: "lax" });
    return token;
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Form URL-encoded Login", description: "Authenticates an affiliate or admin using standard OAuth2 form parameters." })
  @ApiResponse({ status: 201, description: "Successfully authenticated." })
  @ApiResponse({ status: 401, description: "Invalid credentials or account pending approval." })
  login(@Body() body: FormLoginDto, @Res({ passthrough: true }) res: Response) {
    return this.loginJson({ email: (body.username || body.email) as string, password: body.password }, res);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "Refresh Access Token", description: "Generates a new access token using a refresh token from either cookies or the request body." })
  @ApiResponse({ status: 201, description: "Access token successfully refreshed." })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token." })
  async refresh(@Req() req: any, @Body() body: { refresh_token?: string }, @Res({ passthrough: true }) res: Response) {
    const token = await this.auth.refresh(body.refresh_token || req.cookies?.refresh_token);
    res.cookie("refresh_token", token.refresh_token, { httpOnly: true, sameSite: "lax" });
    return token;
  }

  @Public()
  @Post("logout")
  @ApiOperation({ summary: "Logout", description: "Clears the refresh token cookie and terminates the user session." })
  @ApiResponse({ status: 201, description: "Successfully logged out." })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("refresh_token");
    return { msg: "Logout realizado com sucesso" };
  }

  @ApiBearerAuth()
  @Get("me")
  @ApiOperation({ summary: "Get current user profile", description: "Returns profile details and affiliate associations for the currently authenticated session." })
  @ApiResponse({ status: 200, description: "Current user profile data." })
  @ApiResponse({ status: 401, description: "Unauthorized request." })
  me(@CurrentUser() user: any) {
    return this.auth.me(user);
  }
}
