
const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
} = require("customize-cra");
const path = require("path");


module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
);
