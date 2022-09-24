/**
 * @file Collection package
 * @name Collection
 * @version 2.0.4
 * @copyright BeastBoyADI © 2022
 * @license Apache-2.0
 */

/**
 * @exports @beastboyadi/collection
 * @description Exporting collection module
 * @example
 * //Importing the module
 * const {json, map} = require("@beastboyadi/collection");
 * //Initiating jsonCollection class
 * let jsonCol = new json();
 * //Initiating mapCollection class
 * let mapCol = new map();
 */
module.exports = {
  json: require("./jsonCollection.js"),
  map: require("./mapCollection.js")
}