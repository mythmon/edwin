/**
 * The dispatcher for the Timeline app.
 */
import {Dispatcher} from 'flux';

const TimelineDispatcher = new Dispatcher();
export default TimelineDispatcher;


TimelineDispatcher.register((action) => {
  if (action.type === undefined) {
    throw `Action with undefined type thrown: ${JSON.stringify(action)}`;
  }
  console.log(`Dispatched action: ${action.type.name}`, action);
});
