jest.autoMockOff();

describe('PRStore', () => {
  let PRStore;
  let TimelineDispatcher;
  let TimelineConstants;

  beforeEach(() => {
    PRStore = require('../PRStore');
    TimelineDispatcher = require('../../dispatcher/TimelineDispatcher');
    TimelineConstants = require('../../constants/TimelineConstants');
  });

  it('recieves PR data.', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_PRS,
      newPRs: [{id: 1}, {id: 2}],
    });
    let prs = PRStore.getAll();
    expect(prs.getIn([0, 'id'])).toEqual(1);
    expect(prs.getIn([1, 'id'])).toEqual(2);
  });

  it('augments PRs with referenced bug ids.', () => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.SET_RAW_PRS,
      newPRs: [{title: '[Bug 123] Fix it'}, {title: '[Bug 456, 789] fix it fix it'}],
    });
    let prs = PRStore.getAll();
    expect(prs.getIn([0, 'bugs_referenced']).toJS()).toEqual([123]);
    expect(prs.getIn([1, 'bugs_referenced']).toJS()).toEqual([456, 789]);
  });
});
