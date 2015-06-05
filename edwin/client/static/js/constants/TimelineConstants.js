import {constantMap} from '../utils/constants';

export const ActionTypes = constantMap([
  /* Update the Bugzilla search query. */
  'UPDATE_SEARCH',
  /* Reset all the bugs in the store to the provided raw bugs. */
  'SET_RAW_BUGS',
  /* Reset all the PRs in the store to the provided raw prs. */
  'SET_RAW_PRS',
  /* Reset all the teams in the store to the provided raw teams. */
  'SET_RAW_TEAMS',
  /* Reset the comment tags on a given bug. */
  'SET_BUG_COMMENT_TAGS',
]);

window.ActionTypes = ActionTypes;

export const BugStates = constantMap([
  'UNKNOWN',
  'NOT_READY',
  'READY',
  'STARTED',
  'IN_REVIEW',
  'MERGED',
  'DONE',
]);
