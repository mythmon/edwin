import {constantMap} from '../utils/constants';

export const ActionTypes = constantMap([
  // Reset all the bugs in the store to the provided raw bugs.
  'SET_RAW_BUGS',
  // Reset "blocked" bugs for all bugs in the store.
  'SET_BLOCKER_BUGS',
  // Reset all the PRs in the store to the provided raw prs.
  'SET_RAW_PRS',
  // Reset all the teams in the store to the provided raw teams.
  'SET_RAW_TEAMS',
  // Reset the comment tags on a given bug.
  'SET_COMMENT_TAGS',
  // Change a bug so it is assigned to the current user and in the STARTED state
  'ASSIGN_BUG',
  // Change a bug's internal sortOrder. Usually in preparation for a full sort later.
  'BUG_SET_INTERNAL_SORT',
  // Walk through the bugs accordint to sortOrder and update comment tags to match.
  'BUGS_COMMIT_SORT_ORDER',
  // Set the currenty active team
  'SET_CURRENT_TEAM',
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


export default {
  ActionTypes,
  BugStates,
};
