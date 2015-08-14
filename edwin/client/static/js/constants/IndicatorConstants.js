/**
 * Constants for IndicatorStore.
 */
import {constantMap} from '../utils/constants';

export const ActionTypes = constantMap([
  'UPDATE_LOAD_STATE',
]);

export const LoadingStates = constantMap([
  'USER_RESTORE',
  'LOAD_TEAMS',
  'LOAD_BUGS',
  'LOAD_PRS',
  'DONE',
]);

export default {
  ActionTypes,
  LoadingStates,
};
