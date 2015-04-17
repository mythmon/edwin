import Symbol from 'es6-symbol'; // Polyfill
import {expect} from 'chai';

describe('symbols', () => {
  describe('symbolMap', () => {
    let symbolMap;

    beforeEach(() => {
      symbolMap = require('../symbols').symbolMap;
    });

    it('makes a map of names to symbols', () => {
      let map = symbolMap(['foo', 'bar']);
      // since symbols are (supposed to be) opaque, this is about the best we can do.
      expect(map.foo).to.exist;
      expect(map.bar).to.exist;
    });
  });
});
