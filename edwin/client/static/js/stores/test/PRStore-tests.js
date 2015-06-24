import chai, {expect} from 'chai';
import chaiImmutable from 'chai-immutable';
import Immutable from 'immutable';


describe('PRStore', () => {
  let PRStore;
  let Dispatcher;
  let TimelineConstants;

  beforeEach(() => {
    PRStore = require('../PRStore');
    Dispatcher = require('../../dispatcher');
    TimelineConstants = require('../../constants/TimelineConstants');

    // Empty the stores
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs: [],
    });
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: [],
    });
  });

  it('recieves PR data', () => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: [{number: 1, title: ''}, {number: 2, title: ''}],
    });
    let prs = PRStore.getAll();
    expect(prs.getIn([0, 'number'])).to.equal(1);
    expect(prs.getIn([1, 'number'])).to.equal(2);
  });

  it('augments PRs without bug references with an empty list', () => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: [{title: 'Fix it'}],
    });
    let prs = PRStore.getAll();
    expect(prs.getIn([0, 'bugsReferenced']).toJS()).to.deep.equal([]);
  });

  it('augments PRs with referenced bug ids', () => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: [{title: '[Bug 123] Fix it'}, {title: '[Bug 456, 789] fix it fix it'}],
    });
    let prs = PRStore.getAll();
    expect(prs.getIn([0, 'bugsReferenced']).toJS()).to.deep.equal([123]);
    expect(prs.getIn([1, 'bugsReferenced']).toJS()).to.deep.equal([456, 789]);
  });
});
