const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create Express Server
const app = express();

// Configuration
const PORT = 8888;
const HOST = 'localhost';
// const MAPI_SERVICE_URL = "https://mapi.sendo.vn";
const MAPI_SERVICE_URL = 'https://mapi-stg.sendo.vn';
// const MAPI_SERVICE_URL = 'http://mapi.test.sendo.vn';

// const OAUTH_SERVICE_URL = "https://oauth.sendo.vn";
const OAUTH_SERVICE_URL = 'https://oauth-stg.sendo.vn';
// const OAUTH_SERVICE_URL = 'http://oauth.test.sendo.vn';

// const DETAIL_API_URL = "http://detail-api.sendo.vn";
const DETAIL_API_URL = 'http://detail-api-stg.sendo.vn';

// const RECOMMEND_SERVICE_URL = "https://recommend-api.sendo.vn";
const RECOMMEND_SERVICE_URL = 'https://recommend-api-stg.sendo.vn';
// const RECOMMEND_SERVICE_URL = 'http://recommend-api.test.sendo.vn';

const API_SERVICE_URL = 'https://api-stg.sendo.vn';
// const API_SERVICE_URL = "https://api.sendo.vn";

// const LISTING_API = "http://searchlist-api.test.sendo.vn";
// const LISTING_API = "https://searchlist-api-stg.sendo.vn";
const LISTING_API = 'https://searchlist-api.sendo.vn';

const RATING_API_DOMAIN = 'https://ratingapi.sendo.vn';
// const RATING_API_DOMAIN = "https://rating-stg.sendo.vn";

// const COMMENT_API_DOMAIN = "https://comment.sendo.vn";
const COMMENT_API_DOMAIN = 'https://comment-stg.sendo.vn';

const REGISTRY_DOMAIN = 'http://web-registry.test.sendo.vn';
// const REGISTRY_DOMAIN = "https://web-registry.sendo.vn";

const WEB_STATIC_DOMAIN = 'https://web-static-stg.sendo.vn';

// const PROFILE_DOMAIN = "https://profile.sendo.vn";
const PROFILE_DOMAIN = 'https://profile-stg.sendo.vn';
// const PROFILE_DOMAIN = 'http://profile.test.sendo.vn';

// const GROCERY_API_DOMAIN = 'https://grocery.sendo.vn';
const GROCERY_API_DOMAIN = 'https://grocery-stg.sendo.vn';
// const GROCERY_API_DOMAIN = 'http://grocery.test.sendo.vn';

// const SENDO_DOMAIN = 'http://test.sendo.vn';
const SENDO_DOMAIN = 'https://stg.sendo.vn';
// const SENDO_DOMAIN = "https://www.sendo.vn";

// const CHAT_API = "https://chatapi.sendo.vn";
const CHAT_API = 'https://chatapi-stg.sendo.vn';

const VOUCHER_API = 'https://voucher-api.sendo.vn';
// const VOUCHER_API = "https://voucher-stg.sendo.vn/api";

// const CART_API = 'https://cart-service.sendo.vn';
// const CART_API = "https://cart-service-stg.sendo.vn";
const CART_API = 'http://cart-service.test.sendovn';

const GENERIC_API = 'https://generic-api.sendo.vn';
// const GENERIC_API = "https://generic-api-stg.sendo.vn";

const INSIDE_CHAT_API = 'https://inside-chat-stg.sendo.vn';

const OG_ADMIN_API = 'https://og-admin-stg.sendo.vn';
// const OG_ADMIN_API = "http://admin-tool.test.sendo.vn";

const INSIDE_CHECKOUT_API = 'http://inside-checkout.test.sendo.vn';

const webComposeConfig = require('./web-compose.json');
const sendoFarmHybrid = require('./sendo-farm-hybrid.json');

const productFull = require('./product-full.json');
const packageDiscount = require('./package-discount.json');

// Logging
app.use(morgan('dev'));

// allow cors
app.use(
  cors({
    credentials: true,
    origin: true,
    allowedHeaders: [
      'Authentication',
      'Device-Id',
      'Station-Code',
      'authorization',
      'Version',
      'version',
      'Content-Type',
      'Platform',
      'x-requested-with',
      'X-CSRF-TOKEN',
    ],
    exposedHeaders: 'x-total-count',
  }),
);
// app.use(cors());

// Info GET endpoint
app.get('/info', (req, res, next) => {
  res.send(
    'This is a proxy service which proxies to Billing and Account APIs.',
  );
});

// og admin api
app.use(
  [`^/og-admin/api/v1/district`],
  createProxyMiddleware({
    target: OG_ADMIN_API,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      console.log(req.query);
      return path.replace(
        '/og-admin/api/v1/district',
        `/api/v1/regions/${req.query.region_id}/district`,
      );
    },
  }),
);
app.use(
  [`^/og-admin`],
  createProxyMiddleware({
    target: OG_ADMIN_API,
    changeOrigin: true,
    pathRewrite: {
      '^/og-admin': '',
    },
  }),
);

// Chat inside
app.use(
  `^/api/oauth-info`,
  createProxyMiddleware({
    target: INSIDE_CHAT_API,
    changeOrigin: true,
  }),
);

// web registry
app.use(`^/long-response`, function (req, res) {
  setTimeout(() => {
    res.send('Long response with content');
  }, 10000);
});
app.use(`^/empty-content`, function (req, res) {
  res.status(400);
  res.send('');
});
app.use(`^/compose/sendo-farm-hybrid/fetch`, function (req, res) {
  res.json(sendoFarmHybrid);
});
app.use(`^/fetch/compose`, function (req, res) {
  res.json(webComposeConfig);
});
app.use(
  `^/compose`,
  createProxyMiddleware({
    target: REGISTRY_DOMAIN,
    changeOrigin: true,
  }),
);

// module resources
app.use(
  [`^/modules`],
  createProxyMiddleware({
    target: WEB_STATIC_DOMAIN,
    changeOrigin: true,
    pathRewrite: {
      '^/modules': '',
    },
  }),
);

// voucher
app.use(
  [`^/get-by-merchant-v2`],
  createProxyMiddleware({
    target: VOUCHER_API,
    changeOrigin: true,
  }),
);

// chat api
app.use(
  [
    `^/chat/public/v10/token`,
    `^/chat/public/v10/seller/detail/:sellerId`,
    `^/chat/v7/user/status`,
  ],
  createProxyMiddleware({
    target: CHAT_API,
    changeOrigin: true,
  }),
);

// bapi
app.use(
  [
    `^/bapi`,
    '^/bapi/customer/verify-phone-number',
    '^/bapi/customer/verify-phone',
  ],
  createProxyMiddleware({
    target: `${SENDO_DOMAIN}`,
    changeOrigin: true,
  }),
);

// Profile

app.use(
  [
    `^/api/order/check/info`,
    `^/api/order/:incrementID/get-info-shipment`,
    `^/api/order/:incrementID`,
    `^/api/order/get/list`,
    `^/order/v2/list`,
    `^/order/v2/tabs/config`,
  ],
  createProxyMiddleware({
    target: PROFILE_DOMAIN,
    changeOrigin: true,
  }),
);

// grocery
app.use(
  [
    `^/api/:apiVersion/order`,
    `^/api/:apiVersion/order/detail/:incrementID`,
    `^/api/:apiVersion/product/list`,
    `^/api/:apiVersion/category/list`,
    `^/api/:apiVersion/cart`,
    `^/api/:apiVersion/config/app`,
    `^/api/:apiVersion/product`,
    `^/api/:apiVersion/referral/config`,
    `^/api/:apiVersion/senstations/support-location/:id`,
    `^/api/:apiVersion/senstations`,
    `^/api/:apiVersion/place/geocode`,
    `^/api/:apiVersion/place/autocomplete`,
    `^/api/:apiVersion/app/config`,
    `^/api/:apiVersion/rating/order`,
    `^/api/:apiVersion/farm-wallet`,
    `^/api/:apiVersion/checkout`,
  ],
  createProxyMiddleware({
    target: GROCERY_API_DOMAIN,
    changeOrigin: true,
  }),
);

app.use(
  [
    `^/flash-deal/buyer/ajax-deal`,
    `^/event/info/detail`,
    `^/event/info/`,
    `^/onsite-services/shop/info`,
    `^/affiliate/external/provider/verify`,
    `^/theme-settings/`,
    `^/group-buy/group/:groupId`,
    `^/flash-deal/buyer/ajax-product/`,
    `^/group-buy/group/`,
    `^/group-buy/landing/:id/groups/waiting`,
  ],
  createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
  }),
);

app.use(
  [
    `^/rating/images/product/:productId`,
    `^/product/:productId/rating`,
    `^/rating/comment/:ratingId`,
    `^/unlike/rating/:ratingId`,
    `^/like/rating/:ratingId`,
  ],
  createProxyMiddleware({
    target: RATING_API_DOMAIN,
    changeOrigin: true,
  }),
);
app.use(
  [`^/public/product/:productID`],
  createProxyMiddleware({
    target: COMMENT_API_DOMAIN,
    changeOrigin: true,
  }),
);

// app.use(`^/full/`, function (req, res) {
//   res.json(productFull);
// });
// app.use(`^/product/:productId/package-discount/`, function (req, res) {
//   res.json(packageDiscount);
// });
app.use(
  [`^/full/`, `^/basic/`, `^/product/:productId/package-discount/`],
  createProxyMiddleware({
    target: DETAIL_API_URL,
    changeOrigin: true,
    logLevel: 'debug',
  }),
);

app.use(
  `^/wap_v2/`,
  createProxyMiddleware({
    target: MAPI_SERVICE_URL,
    changeOrigin: true,
  }),
);

app.use(
  [
    `^/:version/status-pwa/`,
    `^/login/sendoid`,
    `^/login/sendoid-v2`,
    `^/login/social`,
    `^/logout/sendoid`,
    `^/register/valid-unique`,
    `^/account/exist`,
    `^/register/zalo/request-otp`,
    `^/register/social`,
    '^/login/request-otp/v2',
    '^/register/v4',
    '^/login/otp',
  ],
  createProxyMiddleware({
    target: OAUTH_SERVICE_URL,
    changeOrigin: true,
  }),
);

app.use(
  [
    `^/web/settings`,
    `^/web/products`,
    `^/web/categories`,
    `^/online-sale/verify-products`,
  ],
  createProxyMiddleware({
    target: LISTING_API,
    changeOrigin: true,
  }),
);

app.use(
  [
    `^/web/category/:cateId/child`,
    `^/recommend/history`,
    `^/web/category-info/:catePath`,
  ],
  createProxyMiddleware({
    target: GENERIC_API,
    changeOrigin: true,
  }),
);

app.use(
  [`^/web`, `^/web/category/:cateId/child`, `^/web/listing/recommend/internal`],
  createProxyMiddleware({
    target: RECOMMEND_SERVICE_URL,
    changeOrigin: true,
  }),
);

app.use(
  [`^/v1/carts`, `^/v1/carts/:clientId/mergers`],
  createProxyMiddleware({
    target: CART_API,
    changeOrigin: true,
  }),
);

app.use(
  [`^/v2/carts`],
  createProxyMiddleware({
    target: CART_API,
    changeOrigin: true,
  }),
);

app.use(
  [`^/api/auth`, `^/api/shipping-voucher`, `^/api/oauth-info`],
  createProxyMiddleware({
    target: INSIDE_CHECKOUT_API,
    changeOrigin: true,
  }),
);

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
