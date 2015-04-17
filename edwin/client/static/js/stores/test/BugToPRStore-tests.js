import {expect} from 'chai';
import Immutable from 'immutable';

describe('PRStore', () => {
  let BugToPRStore;
  let TimelineDispatcher;
  let TimelineConstants;

  beforeEach(() => {
    BugToPRStore = require('../BugToPRStore');
    TimelineDispatcher = require('../../dispatcher/TimelineDispatcher');
    TimelineConstants = require('../../constants/TimelineConstants');
  });

  it('makes a mapping from PRs to Bugs', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_BUGS,
      newBugs: [{id: 0, whiteboard: ''}, {id: 1, whiteboard: ''}],
    });
    let prs = [{id: 0, title: '[Bug 0] Bar'}, {id: 1, title: '[Bug 1] Foo'}];
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_PRS,
      newPRs: prs,
    });

    expect(BugToPRStore.prsFor(0).toJS()).to.deep.equal([prs[0]]);
    expect(BugToPRStore.prsFor(1).toJS()).to.deep.equal([prs[1]]);
  });
});
