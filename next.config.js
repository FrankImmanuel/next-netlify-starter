module.exports = {
  env: { NEXT_PUBLIC_INDEXABLE: process.env.CONTEXT === 'production' ? 'true' : 'false' },
  outputFileTracingRoot: __dirname,
  // Include Netlify's Linux image binaries when building the review deploy on macOS.
  outputFileTracingIncludes: {
    '/api/admin/upload': ['./node_modules/@img/sharp-linux-x64/**/*', './node_modules/@img/sharp-libvips-linux-x64/**/*'],
    '/api/shortcut': ['./node_modules/@img/sharp-linux-x64/**/*', './node_modules/@img/sharp-libvips-linux-x64/**/*'],
  },
  devIndicators: false,
};
