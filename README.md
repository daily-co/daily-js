# 🎥 Get started with Daily

Please check our [our documentation site](https://docs.daily.co/) to get started. If you're building a web app with our `daily-js` front-end JavaScript library, you may be particularly interested in:

- The [`daily-js` reference docs](https://docs.daily.co/reference#using-the-dailyco-front-end-library), for help adding video calls to your app
- The [REST API reference docs](https://docs.daily.co/reference), for help creating video call rooms, configuring features for those rooms, and managing users and permissions

# ⚠ Upcoming changes that may require action

## Refactoring of Logic around Gathering and Updating Local Media

**Project Code Name: v2 Cam And Mic**

We are gradually rolling out a complete refactor of our internal logic that deals with gathering and updating a client's local media (unmuting, changing devices, etc). This refactor will resolve a number of known issues around local device handling and simplify usage and permissions gathering that have long been a source of customer frustrations🎉. We will be porting all domains to use this new logic in the 0.47.0 or 0.48.0 release (depending on timing and success of the rollout).

Nothing is required of you to adopt these changes at the time of rollout, but if you would like to opt in early to try the refactor beforehand, simply specify `dailyConfig: { v2CamAndMic: true }` wherever you provide your [call options](https://docs.daily.co/reference/daily-js/daily-iframe-class/properties). While we are comprehensively testing the refactor to catch any issues, we recommend previewing and testing this behavior if you have unique or complicated setups around local media devices.

### Prebuilt Users:
This behavior is already being rolled out gradually across a percentage of prebuilt calls. If you believe you are seeing an increase in issues around local media, please reach out to help@daily.co.

### In the dashboard:
To determine if a given user session is using new (v2) or old logic, look for the log line:

```
using v2 cam and mic logic: <true/false>
```

## `avoidEval` will become `true` by default

Today you can opt in to making `daily-js` behave in a CSP-friendly way by specifying `dailyConfig: { avoidEval: true }` wherever you provide your [call options](https://docs.daily.co/reference/daily-js/daily-iframe-class/properties). You can read more about this option and how to set up your CSP (Content Security Policy) in [this guide](https://docs.daily.co/guides/privacy-and-security/content-security-policy#custom-call-object).

Starting in an upcoming version of `daily-js`, `avoidEval` will switch to defaulting to `true`. To prepare for this change, please make sure that your CSP's `script-src` directive contains `https://*.daily.co` (or explicitly opt out of the new behavior by setting `avoidEval: false`).
