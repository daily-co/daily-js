# 🎥 Get started with Daily

Please check our [our documentation site](https://docs.daily.co/) to get started. If you're building a web app with our `daily-js` front-end JavaScript library, you may be particularly interested in:

- The [`daily-js` reference docs](https://docs.daily.co/reference#using-the-dailyco-front-end-library), for help adding video calls to your app
- The [REST API reference docs](https://docs.daily.co/reference), for help creating video call rooms, configuring features for those rooms, and managing users and permissions

# ⚠ Upcoming changes that may require action

## Turning off the camera will turn off the indicator light by default

Today, calls are by default configured to leave the camera indicator light on even after the camera has been turned off. In an upcoming release, the default behavior will switch, so that turning off the camera turns off the indicator light. This is usually a much better experience for users and worth the tradeoff of slightly slower camera toggling.

There's already been a way to get what will be the new default behavior: specifying `dailyConfig: { experimentalChromeVideoMuteLightOff: true }`. Once the switch to the new default behavior happens, `experimentalChromeVideoMuteLightOff` won't be needed anymore and so will be deprecated.

For those who want to keep the current default behavior of leaving the indicator light on to speed up camera toggling, they can specify `dailyConfig: { keepCamIndicatorLightOn: true }`. This flag is available today.

## `avoidEval` will become `true` by default

Today you can opt in to making `daily-js` behave in a CSP-friendly way by specifying `dailyConfig: { avoidEval: true }` wherever you provide your [call options](https://docs.daily.co/reference/daily-js/daily-iframe-class/properties). You can read more about this option and how to set up your CSP (Content Security Policy) in [this guide](https://docs.daily.co/guides/privacy-and-security/content-security-policy#custom-call-object).

Starting in an upcoming version of `daily-js`, `avoidEval` will switch to defaulting to `true`. To prepare for this change, please make sure that your CSP's `script-src` directive contains `https://*.daily.co` (or explicitly opt out of the new behavior by setting `avoidEval: false`).
