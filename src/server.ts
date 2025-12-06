import type { IncomingMessage, ServerResponse } from "node:http";
import corsAnywhere from "cors-anywhere";
import { config } from "./config.js";

function authMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  _location: string
): boolean {
  if (!config.apiKey) {
    return false;
  }

  if (req.headers["x-api-key"] !== config.apiKey) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return true;
  }

  return false;
}

export function startServer(): void {
  const server = corsAnywhere.createServer({
    originWhitelist: config.originWhitelist,
    originBlacklist: config.originBlacklist,
    handleInitialRequest: authMiddleware,
    removeHeaders: ["cookie", "cookie2", "x-api-key"],
    redirectSameOrigin: true,
  });

  server.listen(config.port, "0.0.0.0", () => {
    console.log(`cors-anywhere-gateway running on :${config.port}`);
    console.log(`Auth: ${config.apiKey ? "enabled" : "disabled"}`);
  });
}
