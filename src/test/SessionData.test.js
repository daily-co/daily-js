import {
  UNIT_TEST_EXPORTS,
  REPLACE_STRATEGY,
  SHALLOW_MERGE_STRATEGY,
  SessionDataUpdate,
  SessionDataClientUpdateQueue,
  SessionDataServerStore,
} from '../shared-with-pluot-core/SessionData';

const { SessionData } = UNIT_TEST_EXPORTS;

describe('SessionDataUpdate', () => {
  it('defaults to undefined data', () => {
    expect(new SessionDataUpdate().data).toStrictEqual(undefined);
    expect(new SessionDataUpdate({}).data).toStrictEqual(undefined);
  });

  it('defaults to the "replace" merge strategy', () => {
    expect(
      new SessionDataUpdate({ data: { foo: 'bar' } }).mergeStrategy
    ).toStrictEqual(REPLACE_STRATEGY);
  });

  it('validates its mergeStrategy', () => {
    expect(
      new SessionDataUpdate({
        data: { foo: 'bar' },
        mergeStrategy: REPLACE_STRATEGY,
      }).mergeStrategy
    ).toStrictEqual(REPLACE_STRATEGY);
    expect(
      new SessionDataUpdate({
        data: { foo: 'bar' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      }).mergeStrategy
    ).toStrictEqual(SHALLOW_MERGE_STRATEGY);
    expect(
      () =>
        new SessionDataUpdate({
          data: { foo: 'bar' },
          mergeStrategy: 'foo',
        }).mergeStrategy
    ).toThrow(/Unrecognized mergeStrategy provided/);
  });

  it('validates that data is null, undefined, or a plain object', () => {
    expect(
      new SessionDataUpdate({
        data: undefined,
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      }).data
    ).toStrictEqual(undefined);
    expect(
      new SessionDataUpdate({
        data: null,
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      }).data
    ).toStrictEqual(null);
    expect(
      new SessionDataUpdate({
        data: { foo: 'bar' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      }).data
    ).toStrictEqual({ foo: 'bar' });
    expect(
      () =>
        new SessionDataUpdate({
          data: 'hello',
          mergeStrategy: SHALLOW_MERGE_STRATEGY,
        }).data
    ).toThrow(/plain/);
  });

  it('allows data that will be lost during serialization (though it prints a warning)', () => {
    expect(
      new SessionDataUpdate({ data: { foo: new Set([1, 2, 3]) } }).data
    ).toStrictEqual({ foo: new Set([1, 2, 3]) });
  });

  it('validates that data is serializable', () => {
    const circularReference = {};
    circularReference.myself = circularReference;
    expect(
      () => new SessionDataUpdate({ data: { foo: circularReference } })
    ).toThrow(/must be serializable/);
  });
});

describe('SessionData', () => {
  it('defaults to empty-object data', () => {
    expect(new SessionData().data).toStrictEqual({});
  });

  it('no-ops on "replace" updates with null', () => {
    const sessionData = new SessionData();
    const update = new SessionDataUpdate({
      data: null,
      mergeStrategy: REPLACE_STRATEGY,
    });
    sessionData.update(update);
    expect(sessionData.data).toStrictEqual({});
  });

  it('no-ops on "shallow-merge" updates with null', () => {
    const sessionData = new SessionData();
    const update = new SessionDataUpdate({
      data: null,
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
    sessionData.update(update);
    expect(sessionData.data).toStrictEqual({});
  });

  it('no-ops on "replace" updates with undefined', () => {
    const sessionData = new SessionData();
    const update = new SessionDataUpdate({
      data: undefined,
      mergeStrategy: REPLACE_STRATEGY,
    });
    sessionData.update(update);
    expect(sessionData.data).toStrictEqual({});
  });

  it('no-ops on "shallow-merge" updates with undefined', () => {
    const sessionData = new SessionData();
    const update = new SessionDataUpdate({
      data: undefined,
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
    sessionData.update(update);
    expect(sessionData.data).toStrictEqual({});
  });

  it('supports the "shallow-merge" strategy', () => {
    const sessionData = new SessionData();

    const update1 = new SessionDataUpdate({
      data: { foo: 'boo' },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
    sessionData.update(update1);
    expect(sessionData.data).toStrictEqual({ foo: 'boo' });

    const update2 = new SessionDataUpdate({
      data: { bar: 10 },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
    sessionData.update(update2);
    expect(sessionData.data).toStrictEqual({ foo: 'boo', bar: 10 });

    const update3 = new SessionDataUpdate({
      data: {},
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
    sessionData.update(update3);
    expect(sessionData.data).toStrictEqual({ foo: 'boo', bar: 10 });
  });

  it('supports the "replace" strategy', () => {
    const sessionData = new SessionData();

    const update1 = new SessionDataUpdate({
      data: { foo: 'boo' },
      mergeStrategy: REPLACE_STRATEGY,
    });
    sessionData.update(update1);
    expect(sessionData.data).toStrictEqual({ foo: 'boo' });

    const update2 = new SessionDataUpdate({
      data: { foo: 10 },
      mergeStrategy: REPLACE_STRATEGY,
    });
    sessionData.update(update2);
    expect(sessionData.data).toStrictEqual({ foo: 10 });

    const update3 = new SessionDataUpdate({
      data: {},
      mergeStrategy: REPLACE_STRATEGY,
    });
    sessionData.update(update3);
    expect(sessionData.data).toStrictEqual({});
  });

  it('supports top-level key deletion', () => {
    const data = {
      foo: 'bar',
      hello: { planet: 'world', person: 'alice' },
      a: 1,
    };

    const sessionData1 = new SessionData();
    sessionData1.update(new SessionDataUpdate({ data }));
    sessionData1.deleteKeys(['hello']);
    expect(sessionData1.data).toStrictEqual({ foo: 'bar', a: 1 });

    const sessionData2 = new SessionData(data);
    sessionData2.update(new SessionDataUpdate({ data }));
    sessionData2.deleteKeys(['hello', 'foo']);
    expect(sessionData2.data).toStrictEqual({ a: 1 });
  });
});

// NOTE: SessionDataClientUpdateQueue tests don't validate all the various ways
// an update can be merged into existing data, since that's covered by
// SessionData tests.
describe('SessionDataClientUpdateQueue', () => {
  it('if no updates have been enqueued, has no server update to flush', () => {
    const queue = new SessionDataClientUpdateQueue();
    expect(queue.flushToServerUpdatePayload()).toStrictEqual(null);
  });

  it('if a no-op update has been enqueued, has no server update to flush', () => {
    const queue1 = new SessionDataClientUpdateQueue();
    queue1.enqueueUpdate(new SessionDataUpdate({ data: null }));
    expect(queue1.flushToServerUpdatePayload()).toStrictEqual(null);

    const queue2 = new SessionDataClientUpdateQueue();
    queue2.enqueueUpdate(new SessionDataUpdate({ data: undefined }));
    expect(queue2.flushToServerUpdatePayload()).toStrictEqual(null);

    const queue3 = new SessionDataClientUpdateQueue();
    queue3.enqueueUpdate(
      new SessionDataUpdate({ data: {}, mergeStrategy: SHALLOW_MERGE_STRATEGY })
    );
    expect(queue3.flushToServerUpdatePayload()).toStrictEqual(null);
  });

  it('if only one update has been enqueued, flushes a server update with just that update', () => {
    const queue = new SessionDataClientUpdateQueue();
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: 'bar' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    const payload = queue.flushToServerUpdatePayload();
    expect(payload).toStrictEqual({
      data: { foo: 'bar' },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
  });

  it('if only "shallow-merge" updates have been enqueued, flushes a squashed "shallow-merge" server update', () => {
    const queue = new SessionDataClientUpdateQueue();
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: 'bar' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: 10 },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { hello: 'world' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    const payload = queue.flushToServerUpdatePayload();
    expect(payload).toStrictEqual({
      data: { foo: 10, hello: 'world' },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
  });

  it('if at least one "replace" update has been enqueued, flushes a squashed "replace" server update', () => {
    const queue = new SessionDataClientUpdateQueue();
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: 'bar' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: {},
        mergeStrategy: REPLACE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { hello: 'world' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    const payload = queue.flushToServerUpdatePayload();
    expect(payload).toStrictEqual({
      data: { hello: 'world' },
      mergeStrategy: REPLACE_STRATEGY,
    });
  });

  it('if top-level fields are undefined in "shallow-merge" updates, flushes a server update with keysToDelete', () => {
    const queue = new SessionDataClientUpdateQueue();
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: 'bar', baz: 'boo' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: undefined, baz: undefined },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { hello: 'world' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    const payload = queue.flushToServerUpdatePayload();
    expect(payload).toStrictEqual({
      data: { hello: 'world' },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
      keysToDelete: ['foo', 'baz'],
    });
  });

  it('if a "replace" update is enqueued after "shallow-merge" updates that delete top-level keys, flushes a server update with no keysToDelete', () => {
    const queue = new SessionDataClientUpdateQueue();
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: 'bar', baz: 'boo' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { foo: undefined, baz: undefined },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    queue.enqueueUpdate(
      new SessionDataUpdate({
        data: { hello: 'world' },
        mergeStrategy: REPLACE_STRATEGY,
      })
    );
    const payload = queue.flushToServerUpdatePayload();
    expect(payload).toStrictEqual({
      data: { hello: 'world' },
      mergeStrategy: REPLACE_STRATEGY,
      // No keysToDelete
    });
  });
});

describe('SessionDataServerStore', () => {
  it('defaults to empty-object data', () => {
    const store = new SessionDataServerStore();
    expect(store.sessionData.data).toStrictEqual({});
  });

  it('updates properly from client payloads, including deleting keys', () => {
    const store = new SessionDataServerStore();

    // Step 1: shallow merge (which overwrites initial undefined)
    store.updateFromClient({
      data: { foo: 'bar' },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
    expect(store.sessionData.data).toStrictEqual({ foo: 'bar' });

    // Step 2: replace (overwites data)
    store.updateFromClient({
      data: { a: 1, hello: 'world' },
      mergeStrategy: REPLACE_STRATEGY,
    });
    expect(store.sessionData.data).toStrictEqual({ a: 1, hello: 'world' });

    // Step 3: shallow merge (deletes field, adds field)
    store.updateFromClient({
      data: { b: 2 },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
      keysToDelete: ['hello'],
    });
    expect(store.sessionData.data).toStrictEqual({ a: 1, b: 2 });
  });

  describe('updateFromClient()', () => {
    it('returns true when data has changed', () => {
      const store = new SessionDataServerStore();

      // Step 1: replace
      let hasChanged = store.updateFromClient({
        data: { foo: 'bar' },
        mergeStrategy: REPLACE_STRATEGY,
      });
      expect(hasChanged).toStrictEqual(true);

      // Step 2: shallow merge
      hasChanged = store.updateFromClient({
        data: { hello: 'world' },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      });
      expect(hasChanged).toStrictEqual(true);

      // Step 3: key deletion
      hasChanged = store.updateFromClient({
        data: {},
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
        keysToDelete: ['hello'],
      });
      expect(hasChanged).toStrictEqual(true);
    });
    it('returns false when data has not changed', () => {
      const store = new SessionDataServerStore();

      // Step 1: replace (don't validate here, as data HAS changed)
      let hasChanged = store.updateFromClient({
        data: { foo: 'bar' },
        mergeStrategy: REPLACE_STRATEGY,
      });

      // Step 2: shallow merge empty object
      hasChanged = store.updateFromClient({
        data: {},
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      });
      expect(hasChanged).toStrictEqual(false);

      // Step 3: replace with same object
      hasChanged = store.updateFromClient({
        data: { foo: 'bar' },
        mergeStrategy: REPLACE_STRATEGY,
      });
      expect(hasChanged).toStrictEqual(false);
    });
  });
});
