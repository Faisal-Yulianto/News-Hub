export const INTERNAL_PREFIXES = [
  "/dashboard",
  "/admin",
  "/author",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/forbidden",
];

export function isInternalRoute(path: string) {
  return INTERNAL_PREFIXES.some((prefix) => path.startsWith(prefix));
}