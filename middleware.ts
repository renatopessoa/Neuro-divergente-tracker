export { default } from "next-auth/middleware";

export const config = {
  // Protege a home e todas as sub-rotas, exceto login e api de auth
  matcher: ["/((?!login|api/auth).*)"],
};
