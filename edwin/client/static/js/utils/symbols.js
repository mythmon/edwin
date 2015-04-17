import Symbol from 'es6-symbol'; // Polyfill

/**
 * Generates a mapping from names to Symbols bearing those names.
 *
 * @param {Array.<string>} names Symbol names to use.
 */
export function symbolMap(names) {
  let map = {};
  names.forEach((name) => { map[name] = Symbol(name); });
  return map;
}
