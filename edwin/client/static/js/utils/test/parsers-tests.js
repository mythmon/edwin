/* eslint import/no-require:0 */
import {expect} from 'chai';

describe('whiteboardData', () => {
  describe('parse', () => {
    let whiteboardData;

    beforeEach(() => {
      whiteboardData = require('../parsers').whiteboardData;
    });

    it('parses a single simple key/value.', () => {
      expect(whiteboardData.parse('p=1')).to.deep.equal({p: 1});
    });

    it('parses multiple simple key/values.', () => {
      expect(whiteboardData.parse('p=2 u=dev')).to.deep.equal({p: 2, u: 'dev'});
    });

    it('parses a tokenized item.', () => {
      expect(whiteboardData.parse('[good first bug]')).to.deep.equal({'good first bug': true});
    });

    it('parses multiple tokenized items.', () => {
      expect(whiteboardData.parse('[foo bar] [baz]')).to.deep.equal({'foo bar': true, baz: true});
    });

    it('parses p=?', () => {
      expect(whiteboardData.parse('p=?')).to.deep.equal({'p': '?'});
    });

    it('parses mixed items', () => {
      expect(whiteboardData.parse('u=dev c=user [good first bug] s=2015.6 p=2 [need-verify]'))
        .to.deep.equal({
          u: 'dev',
          c: 'user',
          s: 2015.6,
          p: 2,
          'good first bug': true,
          'need-verify': true,
        });
    });
  });
});

describe('bugReferences', () => {
  describe('parse', () => {
    let bugReferences;

    beforeEach(() => {
      bugReferences = require('../parsers').bugReferences;
    });

    it('parses a line with no refs', () => {
      expect(bugReferences.parse('Fix the foo.')).to.deep.equal([]);
    });

    it('parses a simple bug ref', () => {
      expect(bugReferences.parse('[Bug 123] Fix the foo.')).to.deep.equal([123]);
    });

    it('parses a double bug ref', () => {
      expect(bugReferences.parse('[Bug 123, 456] Fix the foo.')).to.deep.equal([123, 456]);
    });

    it('parses two bug refs', () => {
      expect(bugReferences.parse('[Bug 123][Bug 456] Fix the foo.')).to.deep.equal([123, 456]);
    });

    it('parses a complex set of bug refs', () => {
      expect(bugReferences.parse('[Bug 123,456][Bug 789] Fix the foo.')).to.deep.equal([123, 456, 789]);
    });

    it('returns integers', () => {
      expect(bugReferences.parse('[Bug 123] Fix it.')[0]).to.be.a('number');
    });
  });
});
