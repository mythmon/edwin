import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import TimelineConstants from '../constants/TimelineConstants';
import {List} from 'immutable';


let bugs = List();


class _BugStore extends BaseStore {
  getAll() {
    return bugs;
  }
}


const BugStore = new _BugStore();


BugStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.SET_BUGS:
      bugs = List(action.newBugs);
      BugStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugStore;
