# 🎥 Get started with Daily

Please check our [our documentation site](https://docs.daily.co/) to get started. If you're building a web app with our daily-js front-end JavaScript library, you may be particularly interested in:

- The [daily-js reference docs](https://docs.daily.co/reference#using-the-dailyco-front-end-library), for help adding video calls to your app
- The [REST API reference docs](https://docs.daily.co/reference), for help creating video call rooms, configuring features for those rooms, and managing users and permissions

# ⚠️ Notice of upcoming changes

## Dynamic updates to previous daily-js versions will end

Today, if you're using daily-js in [call object](https://docs.daily.co/guides/products/call-object) mode, you may have noticed that certain bugfixes and updates are applied automatically to your client code, regardless of the version of daily-js you're using. Sometimes, these dynamic updates can introduce slight changes to the behavior of the API.

We’ve received feedback from developers who are looking for more stability and want more control over when these fixes and updates end up in their client implementations.

So, starting in an upcoming version of daily-js, bug fixes and updates will no longer be automatically applied to previous versions of daily-js, reducing unexpected changes for users of our library.

Going forward, if you’re using a numbered version of daily-js in call object mode, you will need to periodically update to the latest version in order to receive the latest fixes or improvements.

If you're using daily-js to embed [Daily Prebuilt](https://docs.daily.co/guides/products/prebuilt), there's no change: you'll continue to get the latest Prebuilt experience.

## `avoidEval` will become `true` by default

Today you can opt in to making daily-js behave in a CSP-friendly way by specifying `dailyConfig: { avoidEval: true }` wherever you provide your [call options](https://docs.daily.co/reference/daily-js/daily-iframe-class/properties). You can read more about this option and how to set up your CSP (Content Security Policy) in [this guide](https://docs.daily.co/guides/privacy-and-security/content-security-policy#custom-call-object).

Starting in an upcoming version of daily-js, `avoidEval` will deault to `true`. To prepare for this change, please make sure that your CSP's `script-src` directive contains `https://*.daily.co`.
