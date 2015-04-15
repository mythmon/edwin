jest.autoMockOff();

describe('whiteboardData', () => {
  describe('parse', () => {
    let whiteboardData;

    beforeEach(() => {
      whiteboardData = require.requireActual('../parsers').whiteboardData;
    });

    it('parses a single simple key/value.', () => {
      expect(whiteboardData.parse('p=1')).toEqual({p: 1});
    });

    it('parses multiple simple key/values.', () => {
      expect(whiteboardData.parse('p=2 u=dev')).toEqual({p: 2, u: 'dev'});
    });

    it('parses a tokenized item.', () => {
      expect(whiteboardData.parse('[good first bug]')).toEqual({'good first bug': true});
    });

    it('parses multiple tokenized items.', () => {
      expect(whiteboardData.parse('[foo bar] [baz]')).toEqual({'foo bar': true, baz: true});
    });

    it('parses mixed items', () => {
      expect(whiteboardData.parse('u=dev c=user [good first bug] s=2015.6 p=2 [need-verify]'))
        .toEqual({
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
      bugReferences = require.requireActual('../parsers').bugReferences;
    });

    it('parses a line with no refs.', () => {
      expect(bugReferences.parse('Fix the foo.')).toEqual([]);
    });

    it('parses a simple bug ref.', () => {
      expect(bugReferences.parse('[Bug 123] Fix the foo.')).toEqual([123]);
    });

    it('parses a double bug ref.', () => {
      expect(bugReferences.parse('[Bug 123, 456] Fix the foo.')).toEqual([123, 456]);
    });

    it('parses two bug refs.', () => {
      expect(bugReferences.parse('[Bug 123][Bug 456] Fix the foo.')).toEqual([123, 456]);
    });

    it('parses a complex set of bug refs.', () => {
      expect(bugReferences.parse('[Bug 123,456][Bug 789] Fix the foo.')).toEqual([123, 456, 789]);
    });
  });
});
