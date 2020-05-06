import CallObjectLoader from './CallObjectLoader';
import { callObjectBundleUrl } from '../utils';

export default class CallObjectLoaderReactNative extends CallObjectLoader {
  load(meetingUrl, callback) {
    const url = callObjectBundleUrl(meetingUrl);
    fetch(url)
      .then((res) => {
        return res.text();
      })
      .then((code) => {
        eval(code);
      })
      .then(() => {
        callback(false); // false = "wasn't no-op"
      })
      .catch((e) => {
        console.error('Failed to load RN call object bundle', e);
      });
  }
}
