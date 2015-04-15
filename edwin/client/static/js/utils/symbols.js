/**
 * Generates a mapping from names to Symbols bearing those names.
 *
 * @param {Array.<string>} names Symbol names to use.
 */
export function symbolMap(names) {
  let map = {};
  for (var key of names) {
    map[key] = Symbol(key);
  }
  return map;
}
