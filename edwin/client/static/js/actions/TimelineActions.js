import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import TimelineConstants from '../constants/TimelineConstants';

export function updateSearch(newVars) {
  TimelineDispatcher.dispatch({
    type: TimelineConstants.UPDATE_SEARCH,
    newVars: newVars,
  });
}


export function setBugs(newBugs) {
  TimelineDispatcher.dispatch({
    type: TimelineConstants.SET_RAW_BUGS,
    newBugs: newBugs,
  });
}
