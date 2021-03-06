/* eslint import/no-require:0 */
import {expect} from 'chai';

describe('urls', () => {
  describe('buildUrl', () => {
    let buildUrl;

    beforeEach(() => {
      buildUrl = require('../urls').buildUrl;
    });

    it("doesn't require query params", () => {
      let url = buildUrl('http://example.com', '/api/2');
      expect(url).to.equal('http://example.com/api/2');
    });

    it('builds querystrings', () => {
      let url = buildUrl('http://example.com', '/api', {foo: 'bar'});
      expect(url).to.equal('http://example.com/api?foo=bar');
    });

    it('allows lists of values in querystrings', () => {
      let url = buildUrl('https://example.com', '/api', {foo: ['bar', 'baz']});
      expect(url).to.equal('https://example.com/api?foo=bar&foo=baz');
    });
  });
});
