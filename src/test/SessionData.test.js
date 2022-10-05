import { MAX_SESSION_DATA_SIZE } from '../shared-with-pluot-core/CommonIncludes';
import {
  REPLACE_STRATEGY,
  SHALLOW_MERGE_STRATEGY,
  SessionData,
  SessionDataUpdate,
  SessionDataClientUpdateQueue,
} from '../shared-with-pluot-core/SessionData';

describe('SessionDataUpdate', () => {
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

  it('validates that data is a plain object', () => {
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
    expect(
      () =>
        new SessionDataUpdate({
          data: undefined,
          mergeStrategy: SHALLOW_MERGE_STRATEGY,
        }).data
    ).toThrow(/plain/);
    expect(
      () =>
        new SessionDataUpdate({
          data: null,
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

  it('reports whether its data has exceeded max allowed size via exceedsMaxSize()', () => {
    const sessionData1 = new SessionData();
    sessionData1.update(
      new SessionDataUpdate({
        data: { a: 1 },
        mergeStrategy: REPLACE_STRATEGY,
      })
    );
    expect(sessionData1.exceedsMaxSize()).toStrictEqual(false);

    let strData = '';
    const scaffolding = '"{"a":}"';
    for (let i = 0; i < MAX_SESSION_DATA_SIZE - scaffolding.length; i++) {
      strData += '0';
    }
    const sessionData2 = new SessionData();
    sessionData2.update(
      new SessionDataUpdate({
        data: { a: strData },
        mergeStrategy: REPLACE_STRATEGY,
      })
    );
    expect(sessionData2.exceedsMaxSize()).toStrictEqual(false);

    sessionData2.update(
      new SessionDataUpdate({
        data: { b: 1 },
        mergeStrategy: SHALLOW_MERGE_STRATEGY,
      })
    );
    expect(sessionData2.exceedsMaxSize()).toStrictEqual(true);
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
    const queue = new SessionDataClientUpdateQueue();
    queue.enqueueUpdate(
      new SessionDataUpdate({ data: {}, mergeStrategy: SHALLOW_MERGE_STRATEGY })
    );
    expect(queue.flushToServerUpdatePayload()).toStrictEqual(null);
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
