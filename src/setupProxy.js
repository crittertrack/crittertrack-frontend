const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // All requests starting with /api
    createProxyMiddleware({
      target: 'http://localhost:5000', // Or 'https://crittertrack-pedigree-production.up.railway.app' for production backend
      changeOrigin: true,
    })
  );
};