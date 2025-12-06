export const config = {
  port: parseInt(process.env.PORT || "8080", 10),
  apiKey: process.env.API_KEY || "",
  originWhitelist: process.env.ORIGIN_WHITELIST?.split(",").filter(Boolean) || [],
  originBlacklist: process.env.ORIGIN_BLACKLIST?.split(",").filter(Boolean) || [],
} as const;
