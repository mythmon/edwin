import {constantMap} from '../utils/constants';

export const ActionTypes = constantMap([
  /* Update the Bugzilla search query. */
  'UPDATE_SEARCH',
  /* Reset all the bugs in the store to the provided raw bugs. */
  'SET_RAW_BUGS',
  /* Reset all the PRs in the store to the provided raw bugs. */
  'SET_RAW_PRS',
]);

export const BugStates = constantMap([
  'UNKNOWN',
  'NOT_READY',
  'READY',
  'STARTED',
  'IN_REVIEW',
  'MERGED',
  'DONE',
]);
