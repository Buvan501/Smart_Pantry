/* CRACO configuration to tweak CRA's Webpack config
 * - Exclude source-map-loader from node_modules to avoid ENOENT on bad sourcemaps
 * - Ignore non-critical "Failed to parse source map" warnings
 */

module.exports = {
  webpack: {
    configure: (config) => {
      // Exclude source-map-loader from node_modules
      const updateRule = (rule) => {
        if (
          rule &&
          rule.enforce === 'pre' &&
          ((rule.loader && rule.loader.includes('source-map-loader')) ||
            (Array.isArray(rule.use) && rule.use.some(u => (u.loader || u).includes('source-map-loader'))))
        ) {
          return { ...rule, exclude: /node_modules/ };
        }
        return rule;
      };

      if (Array.isArray(config.module?.rules)) {
        config.module.rules = config.module.rules.map(r => {
          if (Array.isArray(r.oneOf)) {
            return { ...r, oneOf: r.oneOf.map(updateRule) };
          }
          return updateRule(r);
        });
      }

      // Silence sourcemap parse warnings from dependencies
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { message: /Failed to parse source map/ },
      ];

      return config;
    }
  }
};
