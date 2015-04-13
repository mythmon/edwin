jest.autoMockOff();

describe('whiteboard', () => {
  describe('parse', () => {
    let grammar;

    beforeEach(() => {
      grammar = require.requireActual('../whiteboard').grammar;
    });

    it('parses a single simple key/value.', () => {
      expect(grammar.parse('p=1')).toEqual({p: 1});
    });

    it('parses multiple simple key/values.', () => {
      expect(grammar.parse('p=2 u=dev')).toEqual({p: 2, u: 'dev'});
    });

    it('parses a tokenized item.', () => {
      expect(grammar.parse('[good first bug]')).toEqual({'good first bug': true});
    });

    it('parses multiple tokenized items.', () => {
      expect(grammar.parse('[foo bar] [baz]')).toEqual({'foo bar': true, baz: true});
    });

    it('parses mixed items', () => {
      expect(grammar.parse('u=dev c=user [good first bug] s=2015.6 p=2 [need-verify]'))
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
