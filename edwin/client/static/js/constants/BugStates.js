import {constantMap} from '../utils/constants';

const BugStates = constantMap([
  'UNKNOWN',
  'NOT_READY',
  'READY',
  'STARTED',
  'IN_REVIEW',
  'MERGED',
  'DONE',
]);

export default BugStates;
