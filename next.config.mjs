/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // For GitHub Pages deployment (if not using custom domain)
  // basePath: '',
  // trailingSlash: true,
};

export default nextConfig;

