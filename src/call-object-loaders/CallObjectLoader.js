import { notImplementedError } from '../utils';

export default class CallObjectLoader {
  /**
   * Loads the call object bundle (if needed), then invokes the callback
   * function, which takes one boolean argument whose value is true if the
   * load was a no-op.
   *
   * No-op loads can happen when leaving a meeting and then later joining one.
   * Since the call object bundle sets up global state in the same scope as the
   * app code consuming it, it only needs to be loaded and executed once ever.
   *
   * @param callback Callback function that takes a wasNoOp argument.
   * @param meetingUrl Meeting URL, used to determine where to load the bundle from.
   */
  load(meetingUrl, callback) {
    return notImplementedError();
  }
}
