export function maySavePalette(request: Request, environment: string | undefined): boolean {
  if (environment !== "development") return false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    const target = new URL(request.url);
    return ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
      && origin.origin === target.origin
      && request.headers.get("host") === origin.host;
  } catch {
    return false;
  }
}
