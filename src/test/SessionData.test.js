import SessionData, {
  REPLACE_STRATEGY,
  SHALLOW_MERGE_STRATEGY,
} from '../shared-with-pluot-core/SessionData';

describe('SessionData', () => {
  it('cannot be constructed with bad arguments', () => {
    expect(new SessionData().data).toStrictEqual(undefined);
    expect(new SessionData({}).data).toStrictEqual(undefined);
    expect(new SessionData({ data: null }).data).toStrictEqual(null);
    expect(new SessionData({ data: undefined }).data).toStrictEqual(undefined);
    expect(new SessionData({ data: 1 }).data).toStrictEqual(1);
    expect(new SessionData({ data: 'foo' }).data).toStrictEqual('foo');
    expect(new SessionData({ data: [1, 2, 3] }).data).toStrictEqual([1, 2, 3]);
    expect(new SessionData({ data: { foo: 'bar' } }).data).toStrictEqual({
      foo: 'bar',
    });

    // NOTE: This will print a warning and that's a GOOD thing
    let f = () => {
      console.log('boo');
    };
    expect(new SessionData({ data: f }).data).toStrictEqual(f);

    const circularReference = {};
    circularReference.myself = circularReference;
    expect(() => new SessionData({ data: circularReference })).toThrow(
      /must be serializable/
    );
  });

  it('always has a valid mergeStrategy', () => {
    const sd1 = new SessionData({ data: 1 });
    const sd2 = new SessionData({ data: 1, mergeStrategy: REPLACE_STRATEGY });
    let sd3 = new SessionData({
      data: 1,
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });

    expect(sd1.mergeStrategy).toStrictEqual(undefined);
    expect(sd2.mergeStrategy).toStrictEqual(REPLACE_STRATEGY);
    expect(sd3.mergeStrategy).toStrictEqual(SHALLOW_MERGE_STRATEGY);

    const sd1_cp = sd1.clone();
    expect(sd1_cp.shouldShallowMerge(sd1)).toBeFalsy();
    expect(sd1_cp.shouldShallowMerge(sd2)).toBeFalsy();
    expect(sd1_cp.shouldShallowMerge(sd3)).toBeTruthy();

    sd3.data = null;
    expect(sd3.mergeStrategy).toStrictEqual(SHALLOW_MERGE_STRATEGY);
    expect(sd1_cp.shouldShallowMerge(sd3)).toBeFalsy();
    sd3.data = undefined;
    expect(sd3.mergeStrategy).toStrictEqual(SHALLOW_MERGE_STRATEGY);
    expect(sd1_cp.shouldShallowMerge(sd3)).toBeFalsy();
  });

  it('can be cloned with clone()', () => {
    let sd1 = new SessionData({ data: { foo: 'bar' } });
    let sd2 = sd1.clone();
    expect(sd2.data).toStrictEqual(sd1.data);
    expect(sd2.mergeStrategy).toStrictEqual(sd1.mergeStrategy);
    sd1.data.foo = 'boo';
    sd2.mergeStrategy = SHALLOW_MERGE_STRATEGY;
    expect(sd2.data).not.toStrictEqual(sd1.data);
    expect(sd2.mergeStrategy).not.toStrictEqual(sd1.mergeStrategy);
  });

  it('can be cleared using undefined', () => {
    let sd1 = new SessionData({ data: { foo: 'bar' } });
    let sd2 = new SessionData({ data: undefined });
    let sd1_cp = sd1.clone();

    sd1.updateFrom(sd2);
    expect(sd1.data).toStrictEqual(undefined);
    sd2.mergeStrategy = SHALLOW_MERGE_STRATEGY;
    sd1_cp.updateFrom(sd2);
    expect(sd1_cp.data).toStrictEqual(undefined);
  });

  it('supports null data', () => {
    let sd1 = new SessionData({ data: { foo: 'bar' } });
    let sd2 = new SessionData({ data: null });
    let sd1_cp = sd1.clone();

    sd1.updateFrom(sd2);
    expect(sd1.data).toStrictEqual(null);
    sd2.mergeStrategy = SHALLOW_MERGE_STRATEGY;
    sd1_cp.updateFrom(sd2);
    expect(sd1_cp.data).toStrictEqual(null);
  });

  it('supports the shallow merge strategy', () => {
    let sd1 = new SessionData({ data: { foo: { who: 'you' } } });
    let sd2 = new SessionData({
      data: { foo: 'boo' },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });

    sd1.updateFrom(sd2);
    expect(sd1.data).toStrictEqual({ foo: 'boo' });
    sd2.data = { bar: 10 };
    sd1.updateFrom(sd2);
    expect(sd1.data).toStrictEqual({ foo: 'boo', bar: 10 });

    // merging non-mergeable data is a no-op
    sd2.data = 10;
    expect(sd1.data).toStrictEqual({ foo: 'boo', bar: 10 });
  });

  it('supports the replace strategy', () => {
    let sd1 = new SessionData({ data: { foo: { who: 'you' } } });
    let sd2 = new SessionData({
      data: { foo: 'boo' },
      mergeStrategy: REPLACE_STRATEGY,
    });

    sd1.updateFrom(sd2);
    expect(sd1.data).toStrictEqual({ foo: 'boo' });
    sd2.data = 10;
    sd1.updateFrom(sd2);
    expect(sd1.data).toStrictEqual(10);
  });

  it('supports deletion of top-level keys using undefined', () => {
    let sd1 = new SessionData({ data: { foo: { who: 'you' }, bar: 3 } });
    let sd2 = new SessionData({
      data: { foo: undefined },
    });
    let sd1_cp = sd1.clone();

    sd1.updateFrom(sd2);
    expect(sd1.data).toStrictEqual({});
    sd2.mergeStrategy = SHALLOW_MERGE_STRATEGY;
    sd1_cp.updateFrom(sd2);
    expect(sd1_cp.data).toStrictEqual({ bar: 3 });
  });

  it('returns true from updateFrom() if and only if data actually changed', () => {
    const sd = new SessionData({ data: { foo: { who: 'you' }, bar: 3 } });
    let sd1 = sd.clone();
    let sd2 = sd.clone();

    expect(sd1.updateFrom(sd2)).toBe(false);
    sd1 = sd.clone();
    sd2.data.foo.who = 'me';
    expect(sd1.updateFrom(sd2)).toBe(true);
    sd2 = sd1.clone();
    sd2.data.baz = 'jazz';
    expect(sd1.updateFrom(sd2)).toBe(true);
    sd2.data.bar = undefined;
    expect(sd1.updateFrom(sd2)).toBe(true);
    expect(sd1.data).toStrictEqual({ foo: { who: 'me' }, baz: 'jazz' });
    sd2.data = { baz: 'jazz' };
    expect(sd1.updateFrom(sd2)).toBe(true);
    expect(sd1.data).toStrictEqual({ baz: 'jazz' });

    // same tests but with a shallow merge strategy
    sd1 = sd.clone();
    sd2 = sd.clone();
    sd2.mergeStrategy = SHALLOW_MERGE_STRATEGY;
    expect(sd1.updateFrom(sd2)).toBe(false);
    sd1 = sd.clone();
    sd2.data.foo.who = 'me';
    expect(sd1.updateFrom(sd2)).toBe(true);
    sd2 = sd1.clone();
    sd2.data.baz = 'jazz';
    expect(sd1.updateFrom(sd2)).toBe(true);
    sd2.data.bar = undefined;
    expect(sd1.updateFrom(sd2)).toBe(true);
    expect(sd1.data).toStrictEqual({ foo: { who: 'me' }, baz: 'jazz' });
    sd2.data = { baz: 'jazz' };
    expect(sd1.updateFrom(sd2)).toBe(false);
    expect(sd1.data).toStrictEqual({ foo: { who: 'me' }, baz: 'jazz' });

    // test undefined -> null
    sd1 = new SessionData();
    sd2 = new SessionData({ data: null });
    expect(sd1.updateFrom(sd2)).toBe(true);
    sd1 = new SessionData();
    sd2.mergeStrategy = SHALLOW_MERGE_STRATEGY;
    expect(sd1.updateFrom(sd2)).toBe(true);

    // test non-shallow-mergeable things
    sd1 = new SessionData({ data: 1 });
    sd2 = new SessionData({
      data: { foo: 'bar' },
      mergeStrategy: SHALLOW_MERGE_STRATEGY,
    });
    expect(sd1.updateFrom(sd2)).toBe(false);
    sd1.data = 'whoa';
    sd2.data = { john: 'wayne' };
    expect(sd1.updateFrom(sd2)).toBe(false);
  });

  it('preserves undefined values in JSONObjectFromJSONString()', () => {
    let sd1 = new SessionData({ data: { foo: undefined } });
    expect(
      SessionData.JSONObjectFromJSONString(sd1.toJSONString()).data
    ).toStrictEqual({ foo: undefined });

    sd1.data = [1, undefined, 2];
    expect(
      SessionData.JSONObjectFromJSONString(sd1.toJSONString()).data
    ).toStrictEqual([1, undefined, 2]);
  });
});
