class Constant {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  toString() {
    return this.name;
  }
}

export function constantMap(names) {
  let constants = {};
  names.forEach((name, idx) => {
    constants[name] = new Constant(name, idx);
  });
  return constants;
}
