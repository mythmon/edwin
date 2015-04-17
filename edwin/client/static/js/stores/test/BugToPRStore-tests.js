import chai, {expect} from 'chai';
import chaiImmutable from 'chai-immutable';
import Immutable from 'immutable';

chai.use(chaiImmutable);


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

    expect(BugToPRStore.prsFor(0)).to.equal(Immutable.fromJS([prs[0]]));
    expect(BugToPRStore.prsFor(1)).to.equal(Immutable.fromJS([prs[1]]));
  });

  it('returns an empty list for known bugs with no PRs', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_BUGS,
      newBugs: [{id: 0, whiteboard: ''}, {id: 1, whiteboard: ''}],
    });
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_PRS,
      newPRs: [],
    });

    expect(BugToPRStore.prsFor(0)).to.equal(new Immutable.List());
    expect(BugToPRStore.prsFor(1)).to.equal(new Immutable.List());
  });
});
