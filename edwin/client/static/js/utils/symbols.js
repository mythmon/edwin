export function symbolMap(names) {
  let map = {};
  for (var key of names) {
    map[key] = Symbol(key);
  }
  return map;
}
