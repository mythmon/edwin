import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import TimelineConstants from '../constants/TimelineConstants';
import {List} from 'immutable';
import * as whiteboard from '../utils/whiteboard';

let bugs = List();

class _BugStore extends BaseStore {
  getAll() {
    return bugs;
  }
}

function augmentBug(bug) {
  bug.whiteboard_parsed = whiteboard.grammar.parse(bug.whiteboard);
  return bug;
}

const BugStore = new _BugStore();

BugStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.SET_RAW_BUGS:
      bugs = List(action.newBugs.map(augmentBug));
      BugStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugStore;
