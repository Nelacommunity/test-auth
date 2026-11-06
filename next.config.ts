import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// Next.js blocks its dev JavaScript for any host but localhost. Without this,
// opening the app at 127.0.0.1 or the "Network:" address leaves pages
// non-interactive (buttons do nothing, forms fall back to a plain submit).
const localAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4")
  .map((i) => i!.address);

const config: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", ...localAddresses],
};

export default config;
