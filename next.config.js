/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  pageExtensions: ["page.tsx", "page.ts"],
  reactStrictMode: true,
  // Defaults to bottom-left, which the labeling page's Submit button now
  // sits flush against since GlobalNav's global-styles fix removed the
  // body's default margin — the badge was overlapping and blocking clicks
  // on it in dev. Moved out of the way; dev-only, no production effect.
  devIndicators: {
    position: "bottom-right",
  },
}

module.exports = nextConfig
