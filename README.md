# 🎥 Get started with Daily

Please check our [our documentation site](https://docs.daily.co/) to get started. If you're building a web app with our `daily-js` front-end JavaScript library, you may be particularly interested in:

- The [`daily-js` reference docs](https://docs.daily.co/reference#using-the-dailyco-front-end-library), for help adding video calls to your app
- The [REST API reference docs](https://docs.daily.co/reference), for help creating video call rooms, configuring features for those rooms, and managing users and permissions

# ⚠ Upcoming changes that may require action

## `avoidEval` will become `true` by default

Today you can opt in to making `daily-js` behave in a CSP-friendly way by specifying `dailyConfig: { avoidEval: true }` wherever you provide your [call options](https://docs.daily.co/reference/daily-js/daily-iframe-class/properties). You can read more about this option and how to set up your CSP (Content Security Policy) in [this guide](https://docs.daily.co/guides/privacy-and-security/content-security-policy#custom-call-object).

Starting in an upcoming version of `daily-js`, `avoidEval` will switch to defaulting to `true`. To prepare for this change, please make sure that your CSP's `script-src` directive contains `https://*.daily.co` (or explicitly opt out of the new behavior by setting `avoidEval: false`).
