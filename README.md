# Collection
[![NPM Package](https://github.com/BeastBoyADI/collection/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/BeastBoyADI/collection/actions)
[![Discord Server](https://img.shields.io/discord/888465044868833331?color=5865F2&logo=discord&logoColor=white)](https://discord.gg/bX6AT65PmP)
[![NPM version](https://img.shields.io/npm/v/@beastboyadi/collection.svg?maxAge=3600)](https://www.npmjs.com/package/@beastboyadi/collection)
[![NPM downloads](https://img.shields.io/npm/dt/@beastboyadi/collection.svg?maxAge=3600)](https://www.npmjs.com/package/@beastboyadi/collection)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?maxAge=3600)](https://github.com/feross/standard)
[![LICENSE](https://img.shields.io/github/license/BeastBoyADI/collection.svg?maxAge=3600)](LICENSE)

[![npm package](https://nodei.co/npm/@beastboyadi/collection.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@beastboyadi/collection/)

Collection is a package inspired by @discordjs/collection used for caching and managing keys and values. It's a better version of @discordjs/collection made with Javascript instead of Typescript which makes it more fast. It also has much extra features and functions than @discordjs/collection, making it the best choice for all.

## Install
```sh
# install locally (recommended)
npm install @beastboyadi/collection --save
```

## jsonCollection
In jsonCollection the collection uses JSON for caching which is faster than Map. But it uses a bit more memory as compared to Map.

## mapCollection
In mapCollection the collection uses Map for caching which is memory efficient but not faster than JSON. It also saves all Number type strings into BigInt which uses 5 times less memory

---
Both jsonCollection and mapCollection have same functions making it easy to shift to any of them.

## Usage

### Importing the module
```js
const collection = require("@beastboyadi/collection");
```

### Initiating jsonCollection class
```js
const json = new collection.json();
```

### Initiating mapCollection class
```js
const map = new collection.map();
```

## Differences
| Sl. No. | jsonCollection | mapCollection |
|--------|----------------|---------------|
| 1. | It is faster than mapCollection | It is slower than jsonCollection |
| 2. | It uses more memory as compared to mapCollection | It uses less memory as compared to jsonCollection |
| 3. | It accepts `keys` only of type `String`, `Symbol`, `Object`, `Number` | It accepts `keys` of all types |
| 4. | It caches datas only in `String` or `Symbol` form. | It can store datas in every form i.e. `String`, `Array`, `Object`, `Number`, `BigInt`, `Function` |

## License
Apache-2.0
