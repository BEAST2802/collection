console.log("---------------");
console.log("Initiating the package...");
const collection = require("../index.js");
console.log("Success ✓\n---------------");
console.log("Trying to access the JSON Collection class and Map Collection class.");
const {json, map} = collection;
console.log("Success ✓\n---------------");
console.log("Initiating JSON collection");
console.log(new json());
console.log("Success ✓\n---------------");
console.log("Initiating Map Collection");
console.log(new map());
console.log("Success ✓\n---------------")
console.log("✓ All tests passed\n---------------");
process.exit(0);