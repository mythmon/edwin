/**
 * The dispatcher for the Timeline app.
 */
import {Dispatcher} from 'flux';

const disp = new Dispatcher();
export default disp;

disp.register((action) => {
  if (action.type === undefined) {
    throw `Action with undefined type emitted: ${JSON.stringify(action)}`;
  }
  console.log('Dispatched action:', action);
});
