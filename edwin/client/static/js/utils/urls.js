import _ from 'lodash';

export function buildUrl(base, endpoint, query={}) {
  let qs = '';
  let qsParts = _.map(query, (value, key) => `${key}=${value}`);

  if (qsParts.length > 0) {
    qs = '?' + qsParts.join('&');
  }

  return base + endpoint + qs;
}
