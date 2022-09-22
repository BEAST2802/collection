const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
const fs = require("fs/promises");
const pt = require("path");
const { inspect } = require("util");

class jsonCollection {

  /**
   * Adds the extra datas at the initiation
   * @param {data: Object - {key: value} |Map - new Map() |jsonCollection - new jsonCollection() |mapCollection - new mapCollection() |Array - [[key, value], [key, value]]
   * @returns Collection
   * @example new jsonCollection({"hii": "hello", "ok": "bye"})
   * @example new jsonCollection([["hii", "hello"], ["ok", "bye"]])
   */
  constructor(data) {
    this.json = {};
    if (!data) return;
    if (typeof data === "object" && !Array.isArray(data)) {
      if (data instanceof Map || data instanceof this.constructor) {
        for (let [k, v] of data) {
          if (typeof k !== "symbol" && typeof k !== "string") k = inspect(k);
          this.json[k] = v;
        }
      } else {
        Object.assign(this.json, data)
      }
    } else if (Array.isArray(data) && data.every(m => Array.isArray(m) && m?.length === 2)) {
      for (let [k, v] of data) {
        if (typeof k !== "symbol" && typeof k !== "string") k = inspect(k);
        this.json[k] = v;
      }
    } else if (Array.isArray(data) && data.every(m => m && typeof m === "object")) {
      for (let d of data) {
        let en = Object.entries(d);
        for (let [k, v] of en) {
          if (k !== null && typeof k !== "undefined") this.json[k] = v;
        }
      }
    }
  }

  /**
   * @param {key: String|Object|Number|Symbol} - The collection key for setting a value to it
   * @param {value: Any} - The collection value you want to set
   * @description Adds an entry to the collection with the specified key and value
   * @returns Collection
   * @example Collection.set("hii", "hello")
   */
  set(key, value) {
    let k = key;
    if (typeof k === "function") throw new TypeError("Key must not be a function");
    if (typeof k !== "string" && typeof k !== "symbol" && typeof k !== "undefined") k = inspect(k);
    this.json[k] = value;
    return this;
  }

  /**
   * @param {key: String|Object|Number|Symbol} - The collection key to get a value attached to it
   * @description Returns the value of the key in the collection
   * @returns Collection
   * @example Collection.get("hii")
   */
  get(key) {
    let k = key;
    if (typeof k === "function") throw new TypeError("Key must not be a function");
    if (typeof k !== "string" && typeof k !== "symbol" && typeof k !== "undefined") k = inspect(k);
    if (!this.json.hasOwnProperty(key)) return null;
    return this.json[k];
  };

  /**
   * @param {fn : function(Value: v, Key: k, Collection: this)} - The function to find the values. Must return boolean
   * @description Finds the value with the specified function
   * @returns Value returned by the function
   * @example Collection.find(v => v.includes("hii"))
   */
  find(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    return this.filter(fn).values[0];
  }

  /**
   * @param {fn : function(Value: v, Key: k, Collection: this)} - The function to find the keys. Must return boolean
   * @description Finds the key in the collection with the specified function
   * @returns Key returned by the function
   * @example Collection.findKey(v => v.includes("hii"))
   */
  findKey(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    return filterKeys(fn)[0];
  }

  /**
   * @param {fn : function(Value: v, Key: k, Collection: this)} - The function to filter the keys. Must return boolean
   * @description Filters the keys in the collection with the specified function
   * @returns Array of Keys returned by the function
   * @example Collection.filterKeys(v => v.includes("hii"))
   */
  filterKeys(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    let keys = [];
    if (!this.size) return keys;
    for (let [k, v] of this) {
      if (fn(v, k, this)) keys.push(k);
    }
    return keys;
  }

  /**
   * @param {fn : function(Value: v, Key: k, Collection: this)} - The function to filter the entries of the collection. Must return boolean.
   * @description Filters out the collection entries
   * @returns Filtered Collection
   * @example Collection.filter(v => v.includes("hii"))
   */
  filter(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    let col = this.create();
    if (!this.size) return this;
    for (let [k, v] of this) {
      if (fn(v, k, this)) col.set(k, v);
    }
    return col;
  }

  /**
   * @param {fn : function(Value: v)} - The function for mapping the collection
   * @description Formats the collection
   * @returns Array of values in the function format
   * @example Collection.map(v => `Value: ${v}`)
   */
  map(fn) {
    if (typeof fn !== "function") return this;
    if (!this.size) return [];
    return this.values.map(fn);
  }

  /**
   * @param {fn : function(Key: k)} - The function for mapping the collection
   * @description Formats the collection keys
   * @returns Array of keys in the function format
   * @example Collection.map(k => `Key: ${k}`)
   */
  mapKeys(fn) {
    if (typeof fn !== "function") return this;
    if (!this.size) return [];
    return this.keys.map(fn);
  }

  /**
   * @param {fn: function(Collection: this)} - The function to run on the collection
   * @description Runs the specified function on the collection
   * @returns Collection
   */
  tap(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    fn(this);
    return this;
  }

  /**
   * @param {fn: (Value: v, Key, k, Collection: this)} - The function. Must return a boolean.
   * @description Splits the collection into an Array of two collection. First collection that passed the function and the other that didn't pass the the function
   * @return Array of Collections
   * @example Collection.split((v, k) => { return (typeof v === "string" && typeof k === "string") })
   */
  split(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
    let cols = [this.create(), this.create()];
    for (let [k, v] of this) {
      if (fn(v, k, this)) {
        cols[0].set(k, v);
      } else {
        cols[1].set(k, v);
      }
    }
    return cols;
  }

  /**
   * @param {fn: function(Value: v, Key: k)} - The function for satisying the test on all entries. Must return boolean
   * @description Performs a test on all entries of the collection
   * @returns boolean
   * @example Collection.every((k,v) => { return (k.startsWith("server") && typeof v !== "undefined") })
   */
  every(fn) {
    if (typeof fn !== "function") return false;
    let bool = true;
    for (let [k, v] of this) {
      if (!fn(v, k)) bool = false;
    }
    return bool;
  }

  /**
   * @param {fn: function(Value: v)} - Function for running on the values
   * @description Performs a forEach function on the values of the collection
   * @returns Value returned from the function or undefined
   * @example Collection.each(v => { Array.push(v)})
   */
  each(fn) {
    return this.forEach(fn);
  }

  /**
   * @param {fn: function(Value: v)} - Function for running on the values
   * @description Performs a forEach function on the values of the collection
   * @returns Value return from the function or undefined
   * @example Collection.each(v => { Array.push(v)})
   */
  forEach(fn) {
    if (typeof fn !== "function") return null;
    return this.values.forEach(fn);
  }

  /**
   * @param {collection} - jsonCollection to compare with the current collection
   * @description Compares both jsonCollection and return true if they are equal
   * @returns boolean
   * @example Collection.equal(jsonCollection)
   */
  equal(collection) {
    if (!collection) return false;
    if (this === collection) return true;
    if (this.size !== collection.size) return false;
    if (!collection instanceof this.constructor) return false;
    for (let [key, value] of this) {
      if (!collection.has(key) || value !== collection.get(key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @param {fn: function(Value: v, Key: k)} - The function for testing the entries on the collection. Must return boolean
   * @description Performs a test on all entries of the Collection and returns true if anyone of them is true
   * @returns boolean
   * @example Collection.some((v,k) => v !== k)
   */
  some(fn) {
    if (typeof fn !== "function") return false;
    let bool = false;
    for (let [k, v] of this) {
      if (fn(v, k)) bool = true;
    }
    return bool;
  }

  /**
   * @param {fn: function(previousValue: v1, currentValue: v2, currentIndex?: Number, array: [])} - The reduce function same as Array.reduce
   * @param {initialValue?: v} - The initial value to use as the previous value for initialising the reduce function
   * @description Reduces the values of the collection same as Array.reduce with same parameters
   * @returns Reduced value
   * @example Collection.reduce((v1, v2) => { return v1 + v2 }, v3)
   */
  reduce(fn, initialValue) {
    if (typeof fn !== "function") return null;
    return this.values.reduce(fn, initialValue);
  }

  /**
   * @param {fn: function(previousKey: k1, currentKey: k2, currentIndex?: Number, array: [])} - The reduce function same as Array.reduce
   * @param {initialKey?: k} - The initial key to use as the previous key for initialising the reduce function
   * @description Reduces the keys of the collection same as Array.reduce with same parameters
   * @returns Reduced key
   * @example Collection.reduceKey((k1, k2) => { return k1 + k2 }, k3)
   */
  reduceKey(fn, initialKey) {
    if (typeof fn !== "function") return null;
    return this.keys.reduce(fn, initialKey);
  }

  /**
   * @param {fn?: function(previousValue: v, currentValue: v1)} - The function to sort the values. Must return boolean
   * @description Sorts the values of the collection without affecting it. Same as Array.sort
   * @returns Sorted Array of values
   * @example Collection.sort((v, v1) => v1 > v)
   */
  sort(fn) {
    let val = this.values;
    return val.sort(fn);
  }

  /**
   * @param {fn?: function(previousKey: k, currentKey: k1)} - The function to sort the keys. Must return boolean
   * @description Sorts the keys of the collection without affecting it. Same as Array.sort
   * @returns Sorted Array of keys
   * @example Collection.sortKeys((k, k1) => k1 < k)
   */
  sortKeys(fn) {
    let key = this.keys;
    return key.sort(fn);
  }

  /**
   * @param {startIndex?: Number, endIndex?: Number} [Optional] - The starting and ending Index for randomising the value
   * @description Randomises between the entries of collection and returns the random value
   * @returns Random value
   * @example Collection.random()
   */
  random(startIndex, endIndex) {
    return this.get(this.randomKey(startIndex, endIndex));
  }

  /**
   * @description Converts the collection into a json
   * @returns The JSON
   * @example Collection.toJSON()
   */
  toJSON() {
    return JSON.stringify(this.json);
  }

  /**
   * @param {keys?: Array} - Array of keys
   * @description Checks if all keys are present in the collection
   * @returns boolean
   */
  hasAll(...keys) {
    return keys.every(x => this.has(x));
  }

  /**
   * @param {keys?: Array} - Array of keys
   * @description Checks if any of the keys are present in the collection
   * @returns boolean
   */
  hasAny(...keys) {
    return keys.some(x => this.has(x));
  }

  /**
   * @param {values?: Array} - Array of Values
   * @description Checks if all values are present in the collection
   * @returns boolean
   */
  hasAllValues(...values) {
    return values.every(x => this.hasValue(x));
  }

  /**
   * @param {values?: Array} - Array of values
   * @description Checks if any of the values are in the collection
   * @returns boolean
   */
  hasAnyValue(...values) {
    return values.some(x => this.hasValue(x));
  }

  /**
   * @param {value?: Any} - The value
   * @description Checks if the value is in the collection
   * @returns boolean
   */
  hasValue(value) {
    if (!this.size) return false;
    return this.values.includes(value);
  }

  /**
   * @param {key?: String|Object|Number|Symbol} - The key
   * @description Checks if the key is present in the collection
   * @returns boolean;
   */
  has(key) {
    if (!this.size) return false;
    let k = key;
    if (typeof k === "undefined") return false;
    if (typeof k === "function") throw new TypeError("Key must not be a function");
    if (typeof k !== "string" && typeof k !== "symbol") k = inspect(k);
    return this.keys.includes(k);
  }

  /**
   * @param {index?: Number} - The index till which the keys will be retrieved from the first. Default 1
   * @description To get the first key or an Array of keys from the first
   * @returns The First key or an Array of keys from the first
   */
  firstKey(index) {
    if (!this.size) return null;
    if (index > this.size) return undefined;
    if (!index || index < 2) {
      return this.keys[0];
    } else {
      return this.keys.slice(0, index);
    }
  }

  /**
   * @param {index?: Number} - The index till which the keys will be retrieved from the last. Default 1
   * @description To get the last key or an Array of keys from the last
   * @returns The Last key or an Array of keys from the last
   */
  lastKey(index) {
    if (!this.size) return null;
    if (index > this.size) return undefined;
    let keys = this.reverseKeys();
    if (!index || index < 2) {
      return keys[0];
    } else {
      return keys.slice(0, index);
    }
  }

  /**
   * @param {index?: Number} - The index number
   * @description To get the value at that index number
   * @returns value at the index
   */
  at(index) {
    if (!this.size) return null;
    return this.values.at(index);
  }

  /**
   * @param {index?: Number} - The index number
   * @description To get the key at that index number
   * @returns key at the index
   */
  keyAt(index) {
    if (!this.size) return null;
    return this.keys.at(index);
  }

  /**
   * @param {startIndex?: Number, endIndex?: Number} - The starting and ending index number
   * @description - To get a random key
   * @returns Random Key
   */
  randomKey(startIndex, endIndex) {
    if (!this.size) return null;
    let arr = this.keys;
    if (!arr.length) return [];
    if (typeof startIndex !== "Number" || typeof endIndex !== "Number ") {
      let random_amt = Math.floor(Math.random() * arr.length);
      return arr[random_amt];
    } else {
      if (startIndex >= arr.length || endIndex >= arr.length) return [];
      let random_amt = Math.floor((Math.random() * startIndex) + endIndex);
      return arr[random_amt];
    }
  }

  /**
   * @description Reverses the keys and values of the collection without affecting the original collection
   * @returns Collection
   */
  reverse() {
    let entries = this.entries.reverse();
    return this.create(entries);
  }

  /**
   * @description Reverses the values of the collection without affecting the original collection
   * @returns Array
   */
  reverseValues() {
    return this.values.reverse();
  }

  /**
   * @description Reverses the keys of the collection without affecting the origin collection
   * @returns Array
   */
  reverseKeys() {
    return this.keys.reverse();
  }

  /** @param {index?: Number} - The index till which the values will be retrieved from first. Default 1
   * @description To get the first value or an Array of values from the first
   * @returns The First value or an Array of values from the first
   */
  first(index) {
    let keys = this.firstKey(index);
    if (!key) return null;
    if (!Array.isArray(keys)) {
      return this.get(keys);
    } else {
      let vals = [];
      for (let k of keys) {
        vals.push(this.get(k));
      }
      return vals;
    }
  }

  /** @param {index?: Number} - The index till which the values will be retrieved from last. Default 1
   * @description To get the last value or an Array of values from the last
   * @returns The Last Value or an Array of values from the last
   */
  last(index) {
    let keys = this.lastKey(index);
    if (!keys) return null;
    if (!Array.isArray(keys)) {
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
   * @description Converts the collection to an array of values
   * @returns Array
   */
  array() {
    return this.values;
  }

  /**
   * @description Converts the collection to an array of keys
   * @returns Array
   */
  keysArray() {
    return this.keys;
  }

  /**
   * @param {start?: Number} - Starting index
   * @param {end?: Number} - Ending index
   * @description Slices the collection according to the indexes and generates a new collection
   * @returns Collection
   */
  slice(start = 0, end = 1) {
    let entries = this.entries.slice(start, end);
    return this.create(entries);
  }

  /**
   * @param {key: String|Object|Number|Symbol} - The key from the collection
   * @description Deletes the entry with the specified key from the collection
   * @returns Collection
   */
  delete(key) {
    let k = key;
    if (typeof k === "undefined") return null;
    if (typeof k === "function") throw new TypeError("Key must not be a function");
    if (typeof k !== "string" && typeof k !== "symbol" && typeof k !== "undefined") k = inspect(k);
    delete this.json[k];
    return this;
  }

  /**
   * @param {index: Number} - The index of the entry to delete
   * @description Deletes the entry at the specified index number. Index should be same like in Array starting from 0
   * @returns Collection
   */
  deleteAt(index) {
    let key = this.keyAt(index);
    if (!key) return null;
    return this.delete(key);
  }

  /**
   * @param {index?: Number} - The index till which the entries will be deleted from the first. Default 1
   * @description Deletes the first entry or an Array of entries from the first of the collection
   * @returns Collection
   */
  deleteFirst(index) {
    let keys = this.firstKey(index);
    if (!keys) return null;
    if (!Array.isArray(keys)) {
      this.delete(keys);
    } else {
      for (let k of keys) {
        this.delete(k);
      }
    }
    return this;
  }

  /** @param {index?: Number} - The index till which entries will be deleted from the last
   * @description Deletes the last entry or an Array of entries from the last of the collection
   * @returns Collection
   */
  deleteLast(index) {
    let keys = this.lastKey(index);
    if (!keys) return null;
    if (!Array.isArray(keys)) {
      this.delete(key);
    } else {
      for (let k of keys) {
        this.delete(k);
      }
    }
    return this;
  }

  /**
   * @param {start?: Number} - The range starting number
   * @param {end?: Number} - The range ending number
   * @description Deletes all entries within the specified range
   * @returns Collection
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
   * @returns boolean
   */
  clear() {
    this.sweep(() => true);
    return true;
  }

  /**
   * @param {collections} [Map or instance of Map or jsonCollection]
   * @description Combines two or more collections and generates a new collection. Doesn't affects the any of the collection
   * @returns Collection
   */
  concat(...collections) {
    let newColl = this.clone();
    if (!collections.every(c => c instanceof Map || c instanceof this.constructor)) throw new TypeError("The collections specified must be an instance of Map or jsonCollection. But any or all doesn't meet the criteria.");
    for (let coll of collections) {
      for (let [k, v] of coll) {
        if (typeof k !== "string" && typeof k !== "symbol") k = inspect(k);
        newColl.set(k, v);
      }
    }
    return newColl;
  }

  /**
   * @param {data: Object in the form {key: value}| Array of entries in the form [[key, value], [key, value]]|Instance of Map|Instance of jsonCollection} - The data to add to the new collection
   * @description Creates a new collection
   * @returns Collection
   */
  create(data) {
    let coll = new this.constructor(data);
    return coll;
  }

  /**
   * @description Clones the collection and generates a new clone of the current collection
   * @returns Collection
   */
  clone() {
    let cloned = this.create(this.json);
    return cloned;
  }

  /**
   * @param {fn: function(Value: v, Key: k, Collection: this)} - The function to sweep the entry. Must return boolean
   * @description Sweeps out entries according to the function
   * @returns Number: The number of entries that was sweeped
   */
  sweep(fn) {
    if (typeof fn !== "function") return 0;
    let prevSize = this.size;
    for (let [k, v] of this) {
      if (fn(v, k, this)) this.delete(k)
    }
    let diff = prevSize - this.size;
    return diff;
  }

  /**
   * @param {path: String} - Path to the json file
   * @param {overwrite?: boolean} - Whether to overwrite the file with new collection entries. Default: true
   * @description Saves the collection in a json file
   * @returns Promise<boolean>
   */
  async save(path, overwrite = true) {
    if (typeof path !== "string") throw new TypeError("Path must be a non-empty string.");
    if (!path.endsWith(".json")) throw new Error("The specified path must be of a json file.");
    if (!path.startsWith(process.cwd())) path = process.cwd() + path;
    let err;
    let res;
    if (!overwrite) {
      await fs.appendFile(path, this.toJSON()).catch((e) => {
        err = e;
      });
      if (err) throw err;
    } else {
      await fs.writeFile(path, this.toJSON()).catch((e) => {
        err = e;
      });
      if (err) throw err;
      res = true;
    }
    return Promise.resolve(res);
  }

  /**
   * @param {path: String} - Path to the json file
   * @param {overwrite?: boolean} - Whether to overwrite old entries of the collection with the json data. Default: true
   * @description Loads the json file to the collection
   * @returns Promise<Collection>
   */
  async load(path, overwrite = true) {
    if (typeof path !== "string") throw new TypeError("Path must be a non-empty string.");
    if (!path.endsWith(".json")) throw new Error("The specified path must be of a json file.");
    if (!path.startsWith(process.cwd())) path = process.cwd() + path;
    let err;
    let data = await fs.readFile(path, { encoding: "utf8" }).catch(e => {
      err = e;
    });
    if (err) throw err;
    try {
      data = JSON.parse(data);
    } catch {
      throw new Error("The file must not be empty and must have a valid json data.");
    }
    if (overwrite) {
      this.clear();
      this.json = data;
    } else {
      for (let d in data) {
        this.set(d, data[d]);
      }
    }
    return Promise.resolve(this);
  }


  /**
   * @description Converts the Collection to an array of keys
   * @returns Array of keys
   */
  get keys() {
    if (!this.size) return [];
    return Object.keys(this.json);
  }

  /**
   * @description Converts the Collection to an array of values
   * @returns Array of values
   */
  get values() {
    if (!this.size) return [];
    return Object.values(this.json);
  }

  /**
   * @description Converts the collection into an array of [Key, Value]
   * @returns Array of [Key, Value]
   */
  get entries() {
    if (!this.size) return [];
    return Object.entries(this.json);
  }

  /**
   * @description Gets the total number of entries in the collection
   * @returns Number
   */
  get count() {
    return this.size;
  }

  /**
   * @description Gets the total number of entries in the collection
   * @returns Number
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