import chai, {expect} from 'chai';
import chaiImmutable from 'chai-immutable';
import Immutable from 'immutable';
import _ from 'lodash';


// TODO: Move this somewhere useful.
const getId = (function() {
  let id = 0;
  return function() {
    return id++;
  }
})();


// TODO: Move this somewhere useful.
// TODO: Standardize something about "model makers"
function makeBug(opts) {
  let defaults = {
    id: getId(),
    whiteboard: '',
    assigned_to: 'nobody@mozilla.com',
    state: 'NEW',
  };
  return _.merge(defaults, opts);
}


describe('BugStateStore', () => {
  let BugStateStore;
  let TimelineDispatcher;
  let TimelineConstants;

  beforeEach(() => {
    BugStateStore = require('../BugStateStore');
    TimelineDispatcher = require('../../dispatcher/TimelineDispatcher');
    TimelineConstants = require('../../constants/TimelineConstants');

    // Empty the stores
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [],
    });
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: [],
    });
  });

  it('recognizes a not ready bug', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [makeBug({id: 0, whiteboard: 'p=?'})],
    });
    expect(BugStateStore.get(0)).to.equal(TimelineConstants.BugStates.NOT_READY);
  });

  it('recognizes a ready bug', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [makeBug({id: 0, whiteboard: 'p=2'})],
    });
    expect(BugStateStore.get(0)).to.equal(TimelineConstants.BugStates.READY);
  });

  it('recognizes a started bug', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [makeBug({id: 0, assigned_to: 'mcooper@mozilla.com', state: 'ASSIGNED'})],
    });
    expect(BugStateStore.get(0)).to.equal(TimelineConstants.BugStates.STARTED);
  });

  it('recognizes an in-review bug', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [makeBug({id: 0, assigned_to: 'mcooper@mozilla.com', state: 'ASSIGNED'})],
    });
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: [{title: '[Bug 0] Fix it'}],
    });
    expect(BugStateStore.get(0)).to.equal(TimelineConstants.BugStates.IN_REVIEW);
  });

  it('recognizes an assigned bug', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [makeBug({id: 0, assigned_to: 'mcooper@mozilla.com', state: 'ASSIGNED'})],
    });
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: [{title: '[Bug 0] Fix it', merged: true}],
    });
    expect(BugStateStore.get(0)).to.equal(TimelineConstants.BugStates.MERGED);
  });

  it('recognizes a done bug', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [makeBug({id: 0, assigned_to: 'mcooper@mozilla.com', status: 'RESOLVED'})],
    });
    expect(BugStateStore.get(0)).to.equal(TimelineConstants.BugStates.DONE);
  });
});
