# 🎥 Get started with Daily

Please check our [our documentation site](https://docs.daily.co/) to get started. If you're building a web app with our `daily-js` front-end JavaScript library, you may be particularly interested in:

- The [`daily-js` reference docs](https://docs.daily.co/reference#using-the-dailyco-front-end-library), for help adding video calls to your app
- The [REST API reference docs](https://docs.daily.co/reference), for help creating video call rooms, configuring features for those rooms, and managing users and permissions

# ⚠ Upcoming changes that may require action

## Turning off the camera will turn off the indicator light by default

Today, calls are by default configured to leave the camera indicator light on even after the camera has been turned off. In an upcoming release, the default behavior will switch, so that turning off the camera turns off the indicator light. This is usually a much better experience for users and worth the tradeoff of slightly slower camera toggling.

There's already been a way to get what will be the new default behavior: specifying `dailyConfig: { experimentalChromeVideoMuteLightOff: true }`. Once the switch to the new default behavior happens, `experimentalChromeVideoMuteLightOff` won't be needed anymore and so will be deprecated.

For those who want to keep the current default behavior of leaving the indicator light on to speed up camera toggling, they can specify `dailyConfig: { keepCamIndicatorLightOn: true }`. This flag is available today.

## Duplicate call instances will not be allowed

Today we do not support multiple call objects to be instantiated and running simultaneously. Doing so causes a smorgasbord of issues, some more obvious than others. After detecting this to be a common issue in development we will be making this setup impossible. Starting in 0.42.0, two currently unsupported behaviors will now throw an `Error` instead of silently failing or simply logging the error. The constructor of a call will throw an `Error` if another one exists and has not been destroyed. And attempting to use a call instance that has been destroyed will throw an `Error`. To see if you are using multiple call objects or using a call after it has been detroyed, check your logs for `Dual call object instances detected`, `Duplicate call object instances detected`, or `You are attempting to use a call instance that was previously destroyed`.

If you think this will affect you, you can turn on the 0.42.0 behavior and have an `Error` thrown by passing adding `strictMode: true` to your iframe properties passed in at construction:

```
try {
  let call = DailyIframe.createCallObject({strictMode: true});
  call = DailyIframe.createCallObject({strictMode: true});
} catch (e) {
  console.error(e); // 'Error: Duplicate DailyIframe instances are not allowed'
  console.log('more info about my code and where this happened');
}
```

```
  try {
    call.destroy();
    call.join();
  } catch (e) {
    console.error(e); // 'Error: Use after destroy'
    console.log('more info about my code and where this happened');
  }
```

Please note, there are two supported ways of leaving and rejoining.

1. A single call instance can be re-used, so long as you properly await each call to ensure the prior action has completed:

    ```
      await call.join();
      await call.leave();
      await call.join();
      // rinse and repeat
    ```

2. Use a new call instance for each new join, but be sure to leave and destroy the prior one.

    ```
      let call1 = DailyIframe.createCallObject({strictMode: true});
      await call1.join({url: 'https://myDailyDomain.daily.co/myRoom'});
      await call.destroy(); // this will also leave the call
      let call2 = DailyIframe.createCallObject({strictMode: true});
      await call2.join({url: 'https://myDailyDomain.daily.co/myRoom'});
    ```

    Without the call to `destroy()`, the above code would be unsupported and will throw an `Error`.

Also of note: to help with the handling of this, we have introduced a new static method: `getCallInstance()` so that you can get a handle to your call instance from anywhere in ase you lost track of it.

```
try {
  call = DailyIframe.createCallObject({strictMode: true});
} catch (e) {
  console.error(e); // 'Duplicate DailyIframe instances are not allowed'
  console.log('more info about my code and where this happened');
  call = DailyIframe.getCallInstance();
  await call.destroy();
  call = DailyIframe.createCallObject({strictMode: true});
  // ^ should work now, though maybe you just wanted the handle and don't want to leave the call :)
}
```

## `avoidEval` will become `true` by default

Today you can opt in to making `daily-js` behave in a CSP-friendly way by specifying `dailyConfig: { avoidEval: true }` wherever you provide your [call options](https://docs.daily.co/reference/daily-js/daily-iframe-class/properties). You can read more about this option and how to set up your CSP (Content Security Policy) in [this guide](https://docs.daily.co/guides/privacy-and-security/content-security-policy#custom-call-object).

Starting in an upcoming version of `daily-js`, `avoidEval` will switch to defaulting to `true`. To prepare for this change, please make sure that your CSP's `script-src` directive contains `https://*.daily.co` (or explicitly opt out of the new behavior by setting `avoidEval: false`).
