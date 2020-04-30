import ScriptMessageChannel from './ScriptMessageChannel';

/**
 * A two-way message channel between daily-js and the call machine (pluot-core),
 * when running in a React Native context.
 */
export default class ReactNativeMessageChannel extends ScriptMessageChannel {}
