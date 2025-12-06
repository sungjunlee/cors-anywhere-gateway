declare module "cors-anywhere" {
  import type { Server } from "node:http";
  import type { IncomingMessage, ServerResponse } from "node:http";

  interface CorsAnywhereOptions {
    originWhitelist?: string[];
    originBlacklist?: string[];
    handleInitialRequest?: (
      req: IncomingMessage,
      res: ServerResponse,
      location: string
    ) => boolean;
    removeHeaders?: string[];
    redirectSameOrigin?: boolean;
  }

  interface CorsAnywhereServer extends Server {
    listen(port: number, host: string, callback?: () => void): this;
  }

  function createServer(options?: CorsAnywhereOptions): CorsAnywhereServer;

  export { createServer };
  export default { createServer };
}
