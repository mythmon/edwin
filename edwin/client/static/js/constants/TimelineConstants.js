import {symbolMap} from '../utils/symbols';

export const ActionTypes = symbolMap([
  /* Update the Bugzilla search query. */
  'UPDATE_SEARCH',
  /* Reset all the bugs in the store to the provided raw bugs. */
  'SET_RAW_BUGS',
  /* Reset all the PRs in the store to the provided raw bugs. */
  'SET_RAW_PRS',
]);

export const BugStates = symbolMap([
  'NOT_READY',
  'READY',
  'STARTED',
  'IN_REVIEW',
  'MERGED',
  'DONE',
  'UNKNOWN',
]);
