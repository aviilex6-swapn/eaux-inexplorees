/** @type {import('next').NextConfig} */
const nextConfig = {
  // Revalidation handled per-page via fetch options
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "docs.google.com",
      },
    ],
  },
};

export default nextConfig;
