import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import corsAnywhere from "cors-anywhere";
import { config } from "./config.js";

function decodeBase64Url(encoded: string): string {
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) base64 += "=".repeat(4 - padding);
  return Buffer.from(base64, "base64").toString("utf8");
}

function authMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
): boolean {
  if (config.apiKey && req.headers["x-api-key"] !== config.apiKey) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return true;
  }
  return false;
}

export function startServer(): void {
  const proxy = corsAnywhere.createServer({
    originWhitelist: config.originWhitelist,
    originBlacklist: config.originBlacklist,
    handleInitialRequest: authMiddleware,
    removeHeaders: ["cookie", "cookie2", "x-api-key"],
    redirectSameOrigin: true,
  });

  const server = createServer((req, res) => {
    const url = req.url || "/";

    // Health check / root
    if (url === "/" || url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    // Proxy: /fetch/{base64url}
    if (!url.startsWith("/fetch/")) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found. Use /fetch/{base64url}" }));
      return;
    }

    const encoded = url.slice(7); // remove "/fetch/"
    if (!encoded) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing encoded URL" }));
      return;
    }

    try {
      const decoded = decodeBase64Url(encoded);
      if (!decoded.startsWith("http://") && !decoded.startsWith("https://")) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid URL scheme" }));
        return;
      }
      req.url = "/" + decoded;
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid Base64URL encoding" }));
      return;
    }

    proxy.emit("request", req, res);
  });

  server.listen(config.port, "0.0.0.0", () => {
    console.log(`cors-anywhere-gateway running on :${config.port}`);
    console.log(`Auth: ${config.apiKey ? "enabled" : "disabled"}`);
    console.log(`Usage: /fetch/{base64url-encoded-target-url}`);
  });
}
