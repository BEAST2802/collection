const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
const fs = require("fs");
const pt = require("path");

class jsonCollection {
  constructor() {
    this.json = {};
  }

  /**
   * @param {key} [Any] - The collection key for setting a value to it
   * @param {value} [Any] - The collection value you want to set
   * @description Adds an entry to the collection with the specified key and value
   * @returns Collection
   */
  set(key, value) {
    if (key && value) {
      this.json[key] = value;
    }
    return this;
  }

  /**
   * @param {key} [Any] - The collection key to get a value attached to it
   * @description Returns the value of the key in the collection
   * @returns Collection
   */
  get(key) {
    if (!this.json.hasOwnProperty(key)) return null;
    return this.json[key];
  };

  /**
   * @param {condition} [Function] - The condition satisfying the value of the collection
   * @description Finds the values with the specified condition
   * @returns Array of values satisfying the condition
   */
  find(condition) {
    return this.filter(condition);
  }

  /**
   * @param {condition} [Function] - The condition satisfying the key of the collection
   * @description Finds the key in the collection with the specified condition
   * @returns Array of keys satisfying the condition
   */
  findKey(condition) {
    if (!condition) return this;
    if (this.size === 0) return [];
    return this.keys.filter(condition);
  }

  /**
   * @param {condition} - The condition satisfying the value of the collection
   * @description Filter out the collection value with the specified condition
   * @returns Array of values satisfying the condition
   */
  filter(condition) {
    if (!condition) return this;
    if (!this.size) return [];
    return this.values.filter(condition);
  }

  /**
   * @param {format} [Function] - The format of mapping the collection
   * @description Formats the collection
   * @returns Array of values in the format
   */
  map(format) {
    if (!format) return this;
    if (!this.size) return [];
    return this.values.map(format);
  }

  /**
   * @param {condition} [Function] - The condition for satisying the test on all values
   * @returns boolean
   */
  every(condition) {
    if (!condition) return false;
    return this.values.every(condition);
  }

  /**
   * @param {fn} [Function] - The callback for each function of Array
   * @param {thisArg} - The arg to use as this
   * @returns Collection
   */
  each(fn, thisArg) {
    return this.forEach(fn, thisArg);
  }

  /**
   * @param {fn} [Function] - The callback for forEach function of Array
   * @param {thisArg} - The arg to use as this
   * @returns Collection
   */
  forEach(fn, thisArg) {
    this.values.forEach(fn, thisArg);
    return this;
  }

  /**
   * @param {collection} - The Collection to compare your this collection
   * @returns boolean
   */
  equal(collection) {
    if (!collection) return false;
    if (this === collection) return true;
    if (this.size !== collection.size) return false;
    for (let [key, value] of this) {
      if (!collection.has(key) || value !== collection.get(key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @param {condition} - The condition for satisying the test on any values
   * @returns boolean
   */
  some(condition) {
    if (!condition) return false;
    return this.values.some(condition);
  }

  /**
   * @param {condition} - The condition for reducing the collection value
   * @returns Reduced value
   */
  reduce(condition) {
    if (!condition) return null;
    return this.values.reduce(condition);
  }

  /**
   * @param {condition} - The condition for sorting all values
   * @returns Sorted Array of values
   */
  sort(condition) {
    if (!condition) return this.values;
    return this.values.sort(condition);
  }

  /**
   * @param {amt} [Optional] - The starting amount for randomising the value
   * @returns Random Key
   */
  random(amt) {
    return this.get(this.randomKey(amt));
  }

  /**
   * @returns The Json form of the collection
   */
  toJSON() {
    return JSON.stringify(this.json);
  }

  /**
   * @param {keys} [Array] - To check if all keys are in the collection
   * @returns boolean
   */
  hasAll(...keys) {
    return keys.every(x => this.has(x));
  }

  /**
   * @param {keys} [Array] - To check if any of the keys are in the collection
   * @returns boolean
   */
  hasAny(...keys) {
    return keys.some(x => this.has(x));
  }

  /**
   * @param {values} [Array] - To check if all values are in the collection
   * @returns boolean
   */
  hasAllValues(...values) {
    return values.every(x => this.hasValue(x));
  }

  /**
   * @param {values} [Array] - To check if any of the values are in the collection
   * @returns boolean
   */
  hasAnyValue(...values) {
    return values.some(x => this.hasValue(x));
  }

  /**
   * @param {value} [Any] - To check if a value is in the collection
   * @returns boolean
   */
  hasValue(value) {
    if ((!value && value !== 0) || !this.size) return false;
    return this.values.includes(value);
  }

  /**
   * @param {key} [Any] - To check if a key is in the collection
   * @returns boolean;
   */
  has(key) {
    if ((!key && key !== 0) || !this.size) return false;
    return this.keys.includes(key);
  }

  /**
   * @param {amt} [Number] - To get the first key or an Array of keys from the first
   * @returns The First key or an Array of keys from the first
   */
  firstKey(amt) {
    if (!this.size) return null;
    if (amt > this.size) return undefined;
    if (!amt) {
      return this.keys[0];
    } else {
      return this.keys.slice(0, amt);
    }
  }

  /**
   * @param {amt} [Number] - To get the last key or an Array of keys from the last
   * @returns The Last key or an Array of keys from the last
   */
  lastKey(amt) {
    if (!this.size) return null;
    if (amt > this.size) return undefined;
    if (!amt) {
      return this.reversekeys()[0];
    } else {
      return this.reverseKeys().slice(0, amt);
    }
  }

  /**
   * @param {index} [Number] - To get the key at that index number
   * @returns value at the index
   */
  at(index) {
    return this.get(this.keyAt(index));
  }

  /**
   * @param {index} [Number] - To get the key at that index number
   * @returns Key at the index
   */
  keyAt(index) {
    if (!this.size) return null;
    return this.keys.at(index);
  }

  /**
   * @param {amt} [Number] - To get a random key
   * @returns Random Key
   */
  randomKey(amt) {
    if (!this.size) return null;
    let arr = this.keys;
    if (typeof amt === "undefined") {
      let random_amt = Math.floor(Math.random() * arr.length);
      return arr[random_amt];
    } else {
      if (!arr.length || !amt) return [];
      if (typeof amt !== "number") return [];
      if (parseInt(amt) >= arr.length) return [];
      let random_amt = Math.floor((Math.random() * arr.length) + parseInt(amt));
      return arr[random_amt];
    }
  }

  /**
   * @returns Collection of reversed keys and values
   */
  reverse() {
    let coll = this.clone();
    let entries = this.entries.reverse();
    for (let [k, v] of entries) coll.set(k, v);
    return coll;
  }

  /**
   * @returns Array of reversed values
   */
  reverseValues() {
    return this.values.reverse();
  }

  /**
   * @returns Array of reversed keys
   */
  reverseKeys() {
    return this.keys.reverse();
  }

  /**
   * @param {amt} [Number]
   * @returns First value of the collection or an array of values from the first
   */
  first(amt) {
    let keys = this.firstKey(amt);
    if (!amt) {
      return this.get(keys);
    } else {
      let vals = [];
      for (let k of keys) {
        vals.push(this.get(k));
      }
      return vals;
    }
  }

  /**
   * @param {amt} [Number]
   * @returns Last value of the collection or an array of values from the last
   */
  last(amt) {
    let keys = this.lastKey(amt);
    if (!amt) {
      return this.get(keys);
    } else {
      let vals = [];
      for (let k of keys) {
        vals.push(this.get(k));
      }
      return vals;
    }
  }

  /**
   * @returns An array of values of the collection
   */
  array() {
    return this.values;
  }

  /**
   * @param {start} [Number] - Starting index
   * @param {end} [Number] - Ending index
   * @description Slices the collection according to the indexes and generates a new collection
   * @returns Collection of sliced entries
   */
  slice(start = 0, end = 1) {
    let coll = this.create();
    let keys = this.keys.slice(start, end);
    if (!keys.length) return coll;
    for (let k of keys) {
      coll.set(k, this.get(k));
    }
    return coll;
  }

  /**
   * @param {key} [Any] - The key to delete
   * @returns Collection after deletion
   */
  delete(key) {
    delete this.json[key];
    return this;
  }

  /**
   * @param {index} [Number] - The index of the entry to delete
   * @description Deletes the entry at the specified index number. Index should be same like in Array starting from 0
   * @returns Collection after deletion
   */
  deleteAt(index) {
    let key = this.keyAt(index);
    if (!key) return null;
    return this.delete(key);
  }

  /**
   * @description Deletes the first entry of the collection
   * @returns Collection after deletion
   */
  deleteFirst() {
    let key = this.firstKey();
    if (!key) return null;
    return this.delete(key);
  }

  /**
   * @description Deletes the last entry of the collection
   * @returns Collection after deletion
   */
  deleteLast() {
    let key = this.lastKey();
    if (!key) return null;
    return this.delete(key);
  }

  /**
   * @param {start} [Number] - The range starting number
   * @param {end} [Number] - The range ending number
   * @description Deletes all entries within the specified range
   * @returns Collection after deletion
   */
  deleteRange(start = 0, end = 1) {
    let keys = this.keys.slice(start, end);
    for (let k of keys) {
      this.delete(k);
    }
    return this;
  }

  /**
   * @description Clears the collection
   * @returns Boolean
   */
  clear() {
    return this.sweep(() => true);
  }

  /**
   * @param {collections} [discordjs Collection or jsonCollection]
   * @description Combines two collection and generates a new collection. Doesn't affects the old one
   * @returns Collection
   */
  concat(...collections) {
    let newColl = this.clone();
    for (let coll of collections) {
      for (let [k, v] of coll) {
        newColl.set(k, v);
      }
    }
    return newColl;
  }

  /**
   * @description Creates a new empty collection
   * @returns Collection
   */
  create() {
    let coll = new this.constructor();
    return coll;
  }

  /**
   * @returns Collection
   * @description Clones the collection and generates a new one
   * @returns Collection
   */
  clone() {
    let cloned = this.create();
    for (let [k, v] of this) {
      cloned.set(k, v);
    }
    return cloned;
  }

  /**
   * @param {condition} [Function]
   * @description Sweeps out entries according to the function
   * @returns boolean
   */
  sweep(condition) {
    let keys = this.keys.filter(condition);
    for (let key of keys) {
      this.delete(key);
    }
    return true;
  }

  /**
   * @param {path} [String] - Path to the json file
   * @param {overwrite} [Boolean] - Whether to overwrite the file with new collection entries. Default: true
   * @description Saves the collection in a json file
   * @returns boolean
   */
  async save(path, overwrite = true) {
    if (!path || !path.endsWith(".json")) throw new Error("The specified must be of a json file.");
    try {
      path = pt.resolve(path);
      if (!path.includes(process.cwd())) path = process.cwd() + path;
    } catch {
      throw new Error("Path is not valid");
    }
    try {
      if (!overwrite) await this.load(path, false);
      await fs.promises.writeFile(path, this.toJSON());
      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {path} [String] - Path to the json file
   * @param {overwrite} [Boolean] - Whether to overwrite old entries of the collection with the json data. Default: true
   * @description Loads the json file to the collection
   * @returns Collection
   */
  async load(path, overwrite = true) {
    if (!path || !path.endsWith(".json")) throw new Error("The specified path must be of a json file.");
    try {
      path = pt.resolve(path);
      if (!path.includes(process.cwd())) path = process.cwd() + path;
    } catch {
      throw new Error("Path is not valid");
    }
    let data;
    try {
      data = await fs.promises.readFile(path, { encoding: "utf8" });
    } catch (e) {
      throw e;
    }
    try {
      data = JSON.parse(data);
    } catch {
      throw new Error("The file must not be empty and must be have a valid json data.");
    }
    if (overwrite) {
      this.clear();
      this.json = data;
    } else {
      for (let d in data) {
        this.set(d, data[d]);
      }
    }
    return this;
  }


  /**
   * @returns Array of keys from the collection
   */
  get keys() {
    if (this.size === 0) return [];
    return Object.keys(this.json);
  }

  /**
   * @returns Array of values from the collection
   */
  get values() {
    if (this.size === 0) return [];
    return Object.values(this.json);
  }

  /**
   * @returns Array of [Key, Value] from the collection
   */
  get entries() {
    if (this.size === 0) return [];
    return Object.entries(this.json);
  }

  /**
   * @returns The count of all the entries in the collection
   */
  get count() {
    return this.size;
  }

  /**
   * @returns The size of the collection
   */
  get size() {
    return Object.keys(this.json).length;
  }

  *[Symbol.iterator]() {
    for (const key in this.json) {
      yield [key, this.json[key]];
    };
  };

  [customInspectSymbol](depth, options, inspect) {
    if (depth < 0) return options.stylize(`[${this.constructor.name}]`, "special");
    return `${options.stylize(`${this.constructor.name}(${this.size}) [JSON]`, "special")} ${inspect(this.json)}`;
  }
};

module.exports = jsonCollection;
