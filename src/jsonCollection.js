const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
const fs = require("node:fs/promises");
const pt = require("node:path");
const { inspect } = require("node:util");

/**
 * @class
 * @namespace jsonCollection
 * @classdesc A collection class which uses JSON for storing datas
 * @constructs jsonCollection
 * @param {(Object|jsonCollection|mapCollection|Array)} data - The data to add to the collection while constructing the collection
 * @returns {jsonCollection} - The constructed collection
 * @example
 * let json = new jsonCollection({"hii": "hello", "ok": "bye"})
 * @example
 * let json = new jsonCollection([["hii", "hello"], ["ok", "bye"]])
 * @example
 * let json = new jsonCollection(jsonCollection2)
 * @example
 * let json = new jsonCollection(mapCollection)
 */
class jsonCollection {
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
   * @param {jsonKey} key - The collection key for setting a value to it
   * @param {jsonValue} value - The collection value you want to set
   * @description Adds an entry to the collection with the specified key and value
   * @returns {jsonCollection}
   * @example
   * jsonCollection.set("hii", "hello") //returns jsonCollection
   */
  set(key, value) {
    let k = key;
    if (typeof k === "function") throw new TypeError("Key must not be a function");
    if (typeof k !== "string" && typeof k !== "symbol" && typeof k !== "undefined") k = inspect(k);
    this.json[k] = value;
    return this;
  }

  /**
   * @param {jsonKey} key - The collection key to get a value attached to it
   * @description Returns the value of the key in the collection
   * @returns {jsonCollection}
   * @example 
   * jsonCollection.get("hii") //returns {jsonCollection}
   */
  get(key) {
    let k = key;
    if (typeof k === "function") throw new TypeError("Key must not be a function");
    if (typeof k !== "string" && typeof k !== "symbol" && typeof k !== "undefined") k = inspect(k);
    if (!this.json.hasOwnProperty(key)) return null;
    return this.json[k];
  };

  /**
   * @param {jsonCollection~3P} fn - The function to find the values. Must return boolean
   * @description Finds the value with the specified function
   * @returns {jsonValue} value
   * @example
   * jsonCollection.find(v => v.includes("hii")) //returns "hii"
   */
  find(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    if (!this.size) return null;
    for (let [k, v] of this) {
      if (fn(v, k, this)) return v;
    }
  }

  /**
   * @param {jsonCollection~3P} fn - The function to find the keys. Must return boolean
   * @description Finds the key in the collection with the specified function
   * @returns {jsonKey} key
   * @example
   * jsonCollection.findKey(v => v.includes("hii"))
   */
  findKey(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    if (!this.size) return null;
    for (let [k, v] of this) {
      if (fn(v, k, this)) return k;
    }
  }
  
  /**
   * @param {jsonCollection~3P} fn - The function to find the entry. Must return boolean
   * @description Finds the entry in the collection with the specified function
   * @returns {Array.<jsonKey, jsonValue>} Array of the key, value
   * @example
   * jsonCollection.Entry(v => v.includes("hii")) // returns ["lol", "hii"]
   */
  findEntry(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    if (!this.size) return null;
    for (let [k, v] of this) {
      if (fn(v, k, this)) return [k, v];
    }
  }

  /**
   * @param {jsonCollection~3P} fn - The function to filter the keys. Must return boolean
   * @description Filters the keys in the collection with the specified function
   * @returns {jsonKey[]} - Array of keys
   * @example
   * jsonCollection.filterKeys(v => v.includes("hii"))
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
   * @param {jsonCollection~3P} fn - The function to filter the entries of the collection. Must return boolean.
   * @description Filters out the collection entries
   * @returns {jsonCollection} - Filtered Collection
   * @example
   * jsonCollection.filter(v => v.includes("hii"))
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
   * @param {jsonCollection~3P} fn - The function to filter the entries. Must return boolean
   * @description Filters the entries in the collection with the specified function
   * @returns {Array.<jsonKey, jsonValue>} - Array of multiple [key, value]
   * @example
   * jsonCollection.filterKeys(v => v.includes("hii")) // returns [["lol", "hii"], ["ok", "hii"]]
   */
  filterEntries(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    let entries = [];
    if (!this.size) return entries;
    for (let [k, v] of this) {
      if (fn(v, k, this)) entries.push([k, v]);
    }
    return entries;
  }

  /**
   * @param {jsonCollection~VP} fn - The function for mapping the collection
   * @description Formats the collection
   * @returns {jsonValue[]} - Array of Mapped values
   * @example
   * jsonCollection.map(v => `Value: ${v}`)
   */
  map(fn) {
    if (typeof fn !== "function") return this;
    if (!this.size) return [];
    return this.values.map(fn);
  }

  /**
   * @param {jsonCollection~KP} fn - The function for mapping the collection
   * @description Formats the collection keys
   * @returns {jsonKey[]} - Array of Mapped keys
   * @example
   * jsonCollection.map(k => `Key: ${k}`)
   */
  mapKeys(fn) {
    if (typeof fn !== "function") return this;
    if (!this.size) return [];
    return this.keys.map(fn);
  }

  /**
   * @param {jsonCollection~CP} fn - The function to run on the collection
   * @description Runs the specified function on the collection
   * @returns {jsonCollection} - The Collection
   * @example
   * jsonCollection.tap((col) => {
   * console.log(col.get("hii"));
   * }).toJSON();
   */
  tap(fn) {
    if (typeof fn !== "function") throw new TypeError(`${fn} is not a function.`);
    fn(this);
    return this;
  }

  /**
   * @param {jsonCollection~3P} fn - The function. Must return a boolean.
   * @description Splits the collection into an Array of two collection. First collection that passed the function and the other that didn't pass the the function
   * @return {jsonCollection[]} - Array of Collections
   * @example
   * jsonCollection.split((v, k) => { return (typeof v === "string" && typeof k === "string") })
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
   * @param {jsonCollection~2P} fn - The function for satisying the test on all entries. Must return boolean
   * @description Performs a test on all entries of the collection
   * @returns {Bool}
   * @example
   * jsonCollection.every((k,v) => { return (k.startsWith("server") && typeof v !== "undefined") })
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
   * @param {jsonCollection~VP} fn - Function for running on the values
   * @description Performs a forEach function on the values of the collection
   * @returns {?jsonValue} - Value returned from the function or undefined
   * @example
   * jsonCollection.each(v => { Array.push(v)})
   */
  each(fn) {
    return this.forEach(fn);
  }

  /**
   * @param {jsonCollection~VP} fn - Function for running on the values
   * @description Performs a forEach function on the values of the collection
   * @returns {?jsonValue} - Value return from the function or undefined
   * @example
   * jsonCollection.forEach(v => { Array.push(v)})
   */
  forEach(fn) {
    if (typeof fn !== "function") return null;
    return this.values.forEach(fn);
  }

  /**
   * @param {jsonCollection} collection - Collection to compare with the current collection
   * @description Compares both jsonCollection and returns true if they are equal
   * @returns {Bool}
   * @example
   * jsonCollection.equal(jsonCollection2)
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
   * @param {jsonCollection~2P} fn - The function for testing the entries on the collection. Must return boolean
   * @description Performs a test on all entries of the Collection and returns true if anyone of them is true
   * @returns {Bool}
   * @example 
   * jsonCollection.some((v,k) => v !== k)
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
   * @param {CallbackFn} fn - The reduce function same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce|Array.reduce} parameters
   * @param {jsonValue} initialValue - The initial value to use as the previous value for initialising the reduce function
   * @description Reduces the values of the collection same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce|Array.reduce} with same parameters
   * @returns {jsonValue} - Reduced value
   * @example
   * jsonCollection.reduce((v1, v2) => { return v1 + v2 }, v3);
   */
  reduce(fn, initialValue) {
    if (typeof fn !== "function") return null;
    return this.values.reduce(fn, initialValue);
  }

  /**
   * @param {CallbackFn} fn - The reduce function same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce|Array.reduce} parameters
   * @param {jsonKey} initialKey - The initial key to use as the previous key for initialising the reduce function
   * @description Reduces the keys of the collection same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce|Array.reduce} with same parameters
   * @returns {jsonKey} - Reduced key
   * @example
   * jsonCollection.reduceKey((k1, k2) => { return k1 + k2 }, k3)
   */
  reduceKey(fn, initialKey) {
    if (typeof fn !== "function") return null;
    return this.keys.reduce(fn, initialKey);
  }

  /**
   * @param {CallbackFn} fn - The function to sort the values same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort|Array.sort} parameters. Must return {boolean}
   * @description Sorts the values of the collection without affecting it. Same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort|Array.sort}
   * @returns {jsonValue[]} - Sorted Array of values
   * @example
   * jsonCollection.sort((v, v1) => v1 > v)
   */
  sort(fn) {
    let val = this.values;
    return val.sort(fn);
  }

  /**
   * @param {CallbackFn} fn - The function to sort the keys same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort|Array.sort} parameters. Must return boolean
   * @description Sorts the keys of the collection without affecting it. Same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort|Array.sort}
   * @returns {jsonKey[]} - Sorted Array of keys
   * @example
   * jsonCollection.sortKeys((k, k1) => k1 < k)
   */
  sortKeys(fn) {
    let key = this.keys;
    return key.sort(fn);
  }

  /**
   * @param {Number} [startIndex=0] - The starting index for randomising the value
   * @param {Number} [endIndex=1] - The ending index for randomising the value
   * @description Randomises between the entries of collection and returns the random value
   * @returns {jsonValue} - Random value
   * @example
   * jsonCollection.random();
   * @example
   * jsonCollection.random(2, 6);
   */
  random(startIndex, endIndex) {
    return this.get(this.randomKey(startIndex, endIndex));
  }

  /**
   * @description Converts the collection into a json
   * @returns {StringObject} - The Stringified JSON Object
   * @example 
   * jsonCollection.toJSON()
   */
  toJSON() {
    return JSON.stringify(this.json);
  }

  /**
   * @param {...jsonKey} keys - Array of keys
   * @description Checks if all keys are present in the collection
   * @returns {Bool}
   * @example
   * // returns false
   * jsonCollection.hasAll("hii", "hello", "lol");
   * @example
   * // returns true
   * jsonCollection.hasAll(["hii", "ok"])
   */
  hasAll(...keys) {
    return keys.every(x => this.has(x));
  }

  /**
   * @param {...jsonKey} keys - Array of keys
   * @description Checks if any of the keys are present in the collection
   * @returns {Bool}
   * @example
   * //returns true
   * jsonCollection.hasAny("ok", "bye", "hii")
   */
  hasAny(...keys) {
    return keys.some(x => this.has(x));
  }

  /**
   * @param {...jsonValue} values - Array of Values
   * @description Checks if all values are present in the collection
   * @returns {Bool}
   * @example
   * //returns true
   * jsonCollection.hasAllValues("ye", "hii")
   */
  hasAllValues(...values) {
    return values.every(x => this.hasValue(x));
  }

  /**
   * @param {...jsonValue} values - Array of values
   * @description Checks if any of the values are in the collection
   * @returns {Bool}
   * @example
   * //returns false
   * jsonCollection.hasAnyValue("lol", "no")
   */
  hasAnyValue(...values) {
    return values.some(x => this.hasValue(x));
  }

  /**
   * @param {jsonValue} value - The value
   * @description Checks if the value is in the collection
   * @returns {Bool}
   * @example
   * //returns false
   * jsonCollection.hasValue("yes")
   */
  hasValue(value) {
    if (!this.size) return false;
    return this.values.includes(value);
  }

  /**
   * @param {jsonKey} key - The key
   * @description Checks if the key is present in the collection
   * @returns {Bool}
   * @example
   * //returns true
   * jsonCollection.has("hii")
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
   * @param {Number} [index=1] - The index till which the keys will be retrieved from the first.
   * @description To get the first key or an Array of keys from the first
   * @returns {(jsonKey|jsonKey[])} - The First key or an Array of keys from the first
   * @example
   * jsonCollection.firstKey();
   * @example
   * jsonCollection.firstKey(2);
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
   * @param {Number} [index=1] - The index till which the keys will be retrieved from the last.
   * @description To get the last key or an Array of keys from the last
   * @returns {(jsonKey|jsonKey[])} - The Last key or an Array of keys from the last
   * @example
   * jsonCollection.lastKey();
   * @example
   * jsonCollection.lastKey(2);
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
   * @param {Number} index - The index number
   * @description To get the value at that index number
   * @returns {jsonValue} - Value at the index
   * @example
   * jsonCollection.at(3);
   */
  at(index) {
    if (!this.size) return null;
    return this.values.at(index);
  }

  /**
   * @param {Number} index - The index number
   * @description To get the key at that index number
   * @returns {jsonKey} - Key at the index
   * @example
   * jsonCollection.keyAt(2);
   */
  keyAt(index) {
    if (!this.size) return null;
    return this.keys.at(index);
  }

  /**
   * @param {Number} [startIndex=0] - The starting index for randomising the key
   * @param {Number} [endIndex=1] - The ending index for randomising the key
   * @description Randomises between the entries of collection and returns the random key
   * @returns {jsonKey} - Random key
   * @example
   * jsonCollection.randomKey();
   * @example
   * jsonCollection.randomKey(2, 6);
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
   * @returns {jsonCollection} - The collection
   * @example
   * jsonCollection.reverse()
   */
  reverse() {
    let entries = this.entries.reverse();
    return this.create(entries);
  }

  /**
   * @description Reverses the values of the collection without affecting the original collection
   * @returns {jsonValue[]} - Array of reversed values
   * @example
   * jsonCollection.reverseValues()
   */
  reverseValues() {
    return this.values.reverse();
  }

  /**
   * @description Reverses the keys of the collection without affecting the origin collection
   * @returns {jsonKey[]} - Array of reversed keys
   * @example
   * jsonCollection.reverseKeys()
   */
  reverseKeys() {
    return this.keys.reverse();
  }

  /** @param {Number} [index=1] - The index till which the values will be retrieved from first.
   * @description To get the first value or an Array of values from the first
   * @returns {jsonValue|jsonValue[]} - The First value or an Array of values from the first
   * @example
   * jsonCollection.first();
   */
  first(index) {
    let keys = this.firstKey(index);
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

  /** @param {Number} [index=1] - The index till which the values will be retrieved from last.
   * @description To get the last value or an Array of values from the last
   * @returns {jsonValue|jsonValue[]} - The Last Value or an Array of values from the last
   * @example
   * jsonCollection.last()
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
   * @returns {jsonValue[]} - Array of values
   * @example
   * jsonCollection.array()
   */
  array() {
    return this.values;
  }

  /**
   * @description Converts the collection to an array of keys
   * @returns {jsonKey[]} - Array of keys
   * @example
   * jsonCollection.keysArray()
   */
  keysArray() {
    return this.keys;
  }

  /**
   * @param {Number} [start=0] - Starting index
   * @param {Number} [end=1] - Ending index
   * @description Slices the collection according to the indexes and generates a new collection. Same as {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice|Array.slice}
   * @returns {jsonCollection} - The Collection
   * @example
   * jsonCollection.slice(1, 5);
   */
  slice(start = 0, end = 1) {
    let entries = this.entries.slice(start, end);
    return this.create(entries);
  }

  /**
   * @param {jsonKey} key - The key from the collection
   * @description Deletes the entry with the specified key from the collection
   * @returns {jsonCollection} - The collection
   * @example
   * jsonCollection.delete("hii")
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
   * @param {Number} index - The index of the entry to delete
   * @description Deletes the entry at the specified index number. Index should be same like in Array starting from 0
   * @returns {jsonCollection} - The Collection
   * @example
   * jsonCollection.deleteAt(3)
   */
  deleteAt(index) {
    let key = this.keyAt(index);
    if (!key) return null;
    return this.delete(key);
  }

  /**
   * @param {Number} [index=1] - The index till which the entries will be deleted from the first.
   * @description Deletes the first entry or an Array of entries from the first of the collection
   * @returns {?jsonCollection} - The Collection
   * @example
   * jsonCollection.deleteFirst(10);
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

  /** @param {Number} [index=1] - The index till which entries will be deleted from the last
   * @description Deletes the last entry or an Array of entries from the last of the collection
   * @returns {?jsonCollection} - The Collection
   * @example
   * jsonCollection.deleteLast(3);
   */
  deleteLast(index) {
    let keys = this.lastKey(index);
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

  /**
   * @param {Number} [start=0] - The range starting number
   * @param {Number} [end=1] - The range ending number
   * @description Deletes all entries within the specified range
   * @returns {jsonCollection} - The Collection
   * @example
   * jsonCollection.deleteRange(2, 7);
   */
  deleteRange(start = 0, end = 1) {
    let keys = this.keys.slice(start, end);
    for (let k of keys) {
      this.delete(k);
    }
    return this;
  }

  /**
   * @description Clears the entire collection
   * @returns {Bool}
   * @example
   * jsonCollection.clear();
   */
  clear() {
    this.sweep(() => true);
    return true;
  }

  /**
   * @param {...Object} collections - jsonCollection or mapCollection or instance of Map
   * @description Combines two or more collections and generates a new collection. Doesn't affects the any of the collection
   * @returns {jsonCollection} - The concated Collection
   * @example
   * jsonCollection.concat(jsonCollection1, jsonCollection2, jsonCollection3);
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
   * @param {(Object.<jsonKey, jsonValue>|jsonCollection|mapCollection|Array.<jsonKey, jsonValue>)} data - The data to add to the collection while creating a new collection
   * @description Creates a new collection with the provided data
   * @returns {jsonCollection} - The new collection
   * @example
   * jsonCollection.create({"hii": "hello", "ok": "bye"})
   * @example
   * jsonCollection.create([["hii", "hello"], ["ok", "bye"]])
   * @example
   * jsonCollection.create(jsonCollection2)
   * @example
   * jsonCollection.create(mapCollection)
   */
  create(data) {
    let coll = new this.constructor(data);
    return coll;
  }

  /**
   * @description Clones the collection and generates a new clone of the current collection
   * @returns {jsonCollection} - The Cloned Collection
   * @example
   * jsonCollection.clone();
   */
  clone() {
    let cloned = this.create(this.json);
    return cloned;
  }

  /**
   * @param {jsonCollection~3P} fn - The function to sweep the entry. Must return boolean
   * @description Sweeps out entries according to the function
   * @returns {Number} - The number of entries that was sweeped
   * @example
   * jsonCollection.sweep(() => true);
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
   * @param {String} path - Path to the json file
   * @param {Bool} overwrite - Whether to overwrite the file with new collection entries.
   * @description Saves the collection in a json file
   * @returns {Promise<Bool>}
   * @example
   * jsonCollection.save("/home/container/json.json")
   */
  async save(path, overwrite = true) {
    if (typeof path !== "string") throw new TypeError("Path must be a non-empty string.");
    if (!path.endsWith(".json")) throw new Error("The specified path must be of a json file.");
    if (!path.startsWith(process.cwd())) path = process.cwd() + `${path.startsWith("/") ? `/${path}` : path}`;
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
   * @param {String} path - Path to the json file
   * @param {Bool} [overwrite=true] - Whether to overwrite old entries of the collection with the json data. 
   * @description Loads the json file to the collection
   * @returns {Promise<jsonCollection>}
   * @example
   * jsonCollection.load("/home/container/json.json")
   */
  async load(path, overwrite = true) {
    if (typeof path !== "string") throw new TypeError("Path must be a non-empty string.");
    if (!path.endsWith(".json")) throw new Error("The specified path must be of a json file.");
    if (!path.startsWith(process.cwd())) path = process.cwd() + `${path.startsWith("/") ? `/${path}` : path}`;
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
   * @returns {jsonKey[]} - Array of keys
   * @example
   * jsonCollection.keys;
   */
  get keys() {
    if (!this.size) return [];
    return Object.keys(this.json);
  }

  /**
   * @description Converts the Collection to an array of values
   * @returns {jsonValue[]} - Array of values
   * @example
   * jsonCollection.values
   */
  get values() {
    if (!this.size) return [];
    return Object.values(this.json);
  }

  /**
   * @description Converts the collection into an array of [jsonKey, jsonValue]
   * @returns {Array.<jsonKey, jsonValue>} - Array of [mapKey, jsonValue]
   * @example
   * jsonCollection.entries
   */
  get entries() {
    if (!this.size) return [];
    return Object.entries(this.json);
  }

  /**
   * @description Gets the total number of entries in the collection
   * @returns {Number}
   * @example
   * jsonCollection.count;
   */
  get count() {
    return this.size;
  }

  /**
   * @description Gets the total number of entries in the collection
   * @returns {Number}
   * @example
   * jsonCollection.size
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

/**
 * Exporting {jsonCollection} class
 */
module.exports = jsonCollection;

  /**
   * @callback jsonCollection~3P
   * @param {jsonValue} value - The value
   * @param {jsonKey} key - The key
   * @param {jsonCollection} collection - The Collection
   * @description A callback function with 3 parameters namely value, key, collection
   * @example
   * function(value, key, collection) {
   *   console.log(value, key, collection);
   * }
   */

  /**
   * @callback jsonCollection~2P
   * @param {jsonValue} value - The value
   * @param {jsonKey} key - The Key
   * @description A callback function with 2 parameters namely value, key
   * @example
   * function(value, key) {
   *   console.log(value, key);
   * }
   */

  /**
   * @callback jsonCollection~VP
   * @param {jsonValue} value - The value
   * @description A callback function with 1 parameter i.e. value
   * @example
   * function(value) {
   *   console.log(value);
   * }
   */

  /**
   * @callback jsonCollection~KP
   * @param {jsonKey} key - The key
   * @description A callback function with 1 parameter i.e. key
   * @example
   * function(key) {
   *   console.log(key);
   * }
   */

  /**
   * @callback jsonCollection~CP
   * @param {jsonCollection} collection - The collection
   * @description A callback function with 1 parameter i.e. collection
   * @example
   * function(collection) {
   *   console.log(collection.toJSON());
   * }
   */

  /**
   * The key for {@link jsonCollection} class
   * @typedef {(Number|Object|String)} jsonKey
   */

  /**
   * The value for {@link jsonCollection} class.
   * @typedef {Any} jsonValue
   */
