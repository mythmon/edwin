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

    // Empty the stores
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_BUGS,
      newBugs: [],
    });
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_PRS,
      newPRs: [],
    });
  });

  it('makes a mapping from PRs to Bugs', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_BUGS,
      newBugs: [{id: 0, whiteboard: ''}, {id: 1, whiteboard: ''}],
    });
    let prs = [{number: 0, title: '[Bug 0] Bar'}, {number: 1, title: '[Bug 1] Foo'}];
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_PRS,
      newPRs: prs,
    });

    expect(BugToPRStore.get(0)).to.equal(Immutable.fromJS([prs[0]]));
    expect(BugToPRStore.get(1)).to.equal(Immutable.fromJS([prs[1]]));
  });

  it('returns an empty list for known bugs with no PRs', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_BUGS,
      newBugs: [{id: 0, whiteboard: ''}, {id: 1, whiteboard: ''}],
    });

    expect(BugToPRStore.get(0)).to.equal(new Immutable.List());
    expect(BugToPRStore.get(1)).to.equal(new Immutable.List());
  });

  it('returns an empty list for unknown bugs', () => {
    expect(BugToPRStore.get(0)).to.equal(new Immutable.List());
    expect(BugToPRStore.get(1)).to.equal(new Immutable.List());
  });

  it('returns the entire mapping', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_BUGS,
      newBugs: [{id: 0, whiteboard: ''}, {id: 1, whiteboard: ''}],
    });
    let prs = [{number: 0, title: '[Bug 0] Bar'}, {number: 1, title: '[Bug 1] Foo'}];
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_PRS,
      newPRs: prs,
    });

    let expected = new Immutable.Map().withMutations((map) => {
      map.set(0, Immutable.fromJS([prs[0]]));
      map.set(1, Immutable.fromJS([prs[1]]));
    });

    expect(BugToPRStore.getAll()).to.equal(expected);
  });
});
