// next.config.js
const withTypescript = require("@zeit/next-typescript");
const withSass = require("@zeit/next-sass");
const withCSS = require("@zeit/next-css");

module.exports = withTypescript(
  withSass({
    sassLoaderOptions: {}
  })
);
