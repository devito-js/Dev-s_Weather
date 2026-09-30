const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
module.exports = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};
