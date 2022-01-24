import DailyIframe from '../module';
// const { createCallObject } = DailyIframe;

// let djs;

// const versionFn = () => {
//   return 'JEST_VERSION';
// };

// beforeEach(() => {
//   delete DailyIframe.version;
//   DailyIframe.version = versionFn;
//   djs = createCallObject();
// });

const validateFunc = DailyIframe.__get__(
  'validateRemotePlayerEncodingSettings'
);

it('Track constraints must be Object Type', () => {
  const validateTcIsObject = {
    state: 'play',
    simulcastEncodings: [{}],
  };

  expect(() => validateFunc(validateTcIsObject)).toThrowError();
});
