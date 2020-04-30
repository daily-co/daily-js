export function isReactNative() {
  return (typeof navigator !== 'undefined' && navigator.product && navigator.product === 'ReactNative');
}