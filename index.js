/**
 * @exports @beastboyadi/collection
 * @description The collection module
 * @example
 * //Importing the module
 * const {json, map} = require("@beastboyadi/collection");
 * //Initiating jsonCollection class
 * let jsonCol = new json();
 * //Initiating mapCollection class
 * let mapCol = new map();
 * @copyright BeastBoyADI © 2022
 * @license Apache-2
 */
module.exports = {
  json: require("./jsonCollection.js"),
  map: require("./mapCollection.js")
}