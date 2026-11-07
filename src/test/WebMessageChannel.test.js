import WebMessageChannel from '../shared-with-pluot-core/script-message-channels/WebMessageChannel';
import { IFRAME_MESSAGE_MARKER } from '../shared-with-pluot-core/CommonIncludes';

describe('WebMessageChannel listener identity', () => {
  let channel;
  let addedListeners;

  beforeEach(() => {
    channel = new WebMessageChannel();
    addedListeners = jest.spyOn(window, 'addEventListener');
  });

  afterEach(() => {
    // Also clean up listeners if an assertion fails against a regression.
    addedListeners.mock.calls.forEach(([type, listener]) => {
      if (type === 'message') window.removeEventListener(type, listener);
    });
    addedListeners.mockRestore();
  });

  it.each([
    ['addListenerForMessagesFromCallMachine', 'removeListener', 'embedded'],
    ['addListenerForMessagesFromDailyJs', 'removeListener', 'module'],
    [
      'addListenerForPackagedMessagesFromCallMachine',
      'removeListenerForPackagedMessagesFromCallMachine',
      'embedded',
    ],
  ])(
    'removes same-source closures independently for %s',
    (add, remove, from) => {
      const calls = [];
      const makeListener = (id) => () => calls.push(id);
      const first = makeListener('first');
      const second = makeListener('second');
      expect(first.toString()).toBe(second.toString());

      channel[add](first, 'client');
      const handle = channel[add](second, 'client');
      if (add === 'addListenerForPackagedMessagesFromCallMachine') {
        expect(handle).toBe(second);
      }
      channel[remove](first);

      const dispatch = () =>
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              what: IFRAME_MESSAGE_MARKER,
              action: 'test',
              callClientId: 'client',
              from,
            },
          })
        );
      dispatch();
      expect(calls).toEqual(['second']);

      channel[remove](second);
      dispatch();
      expect(calls).toEqual(['second']);
      expect(() => channel[remove](second)).not.toThrow();
    }
  );

  it('does not remove a registered listener for an unknown same-source closure', () => {
    const calls = [];
    const makeListener = (id) => () => calls.push(id);
    const registered = makeListener('registered');
    channel.addListenerForMessagesFromCallMachine(registered, 'client');
    channel.removeListener(makeListener('unknown'));
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { what: IFRAME_MESSAGE_MARKER, callClientId: 'client' },
      })
    );
    expect(calls).toEqual(['registered']);
    channel.removeListener(registered);
  });
});
