import PEG from 'pegjs';

// TODO: Build these at compile time instead of runtime.

/**
 * Parses whiteboard strings like "p=2 [good first bug]" into objects like
 * `{p: 2, 'good first bug': true}`. This object will have a method,
 * `.parse()`, which takes a string and returns the parsed representation.
 */
export const whiteboardData = PEG.buildParser(`
  {
    function merge(one, two) {
      var result = {};
      var key;
      for (key in one) {
        result[key] = one[key];
      }
      for (key in two) {
        result[key] = two[key];
      }
      return result;
    }
  }

  start
    = tokens

  tokens
    = token:token " "* tokens:tokens { return merge(token, tokens) }
    / token:token { return token }

  token
    = name:ident "=" value:value? {
      var ret = {};
      ret[name] = value;
      return ret;
    }
    / "[" name:[^\\[\\]]+ "]" {
      var ret = {};
      ret[name.join('')] = true;
      return ret;
    }

  ident
    = chars:[a-zA-Z0-9._-]+ { return chars.join('') }

  value
    = int:[0-9]+ "." frac:[0-9]+ { return parseFloat(int.join('') + '.' + frac.join('')) }
    / digits:[0-9]+ { return parseInt(digits.join(''), 10); }
    / ident
`);


/**
 * Parses bug references like '[Bug 123, 456][Bug 789] Foo' into a list like
 * [123, 456, 789]. This object will have a method, `.parse()`, which takes a
 * string and returns the parsed representation.
 */
export const bugReferences = PEG.buildParser(`
  start
    = summary

  summary
    = first:bugRef " "* rest:summary { return first.concat(rest) }
    / .* { return [] }

  bugRef
    = "[" "bug"i " "* ids:intSeq "]" { return ids }

  intSeq
    = head:int "," " "* tail:intSeq { return [head].concat(tail) }
    / id:int { return [id] }

  int
    = digits:[0-9]+ { return parseInt(digits.join('')); }
`);
