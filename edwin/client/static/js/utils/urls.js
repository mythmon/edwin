import _ from 'lodash';

/**
 * @param {string} base Base of the url, such as 'http://example.com/api'
 * @param {string} endpoint Endpoint of the url, such as "/book/create".
 * @param {Object} [query={}] Parameters to serialize into the query string.
 * @returns {string} A URL incorporating input pieces.
 */
export function buildUrl(base, endpoint, query={}) {
  let qs = '';
  let qsParts = _.map(query, (value, key) => `${key}=${value}`);

  if (qsParts.length > 0) {
    qs = '?' + qsParts.join('&');
  }

  return base + endpoint + qs;
}
