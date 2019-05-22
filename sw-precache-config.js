module.exports = {
  staticFileGlobs: [
    'manifest.json',
    'src/**/*',
    'images/*',
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    },
    {
      urlPattern: /^https:\/\/fonts.gstatic.com\//,
      handler: 'fastest'
    },
    {
      urlPattern: /.*googleusercontent\.com.*/,
      handler: 'fastest'
    }
  ],
  navigateFallbackWhitelist: [/^(?!\/__).*/]
};
