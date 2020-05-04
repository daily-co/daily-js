import { notImplementedError } from "../utils";

export default class CallObjectLoader {
  /**
   * Loads the call machine bundle (if needed), then invokes the callback
   * function, which takes one boolean argument whose value is true if the
   * load was a no-op.
   * 
   * No-op loads can happen if the bundle is a "call object" bundle that runs
   * in the same scope as the caller of this function and so only needs to be
   * run once ever since its global setup work is done.
   * 
   * @param callback Callback function that takes a wasNoOp argument.
   * @param meetingUrl Meeting URL, used to determine where to load the bundle from.
   */
  load(meetingUrl, callback) {
    return notImplementedError();
  }
}
