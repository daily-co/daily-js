# daily-js

The official front-end library for the Daily.co video call API.

- Manage the call lifecycle and participant state
- Respond to in-call events
- Customize call layout and UI

## Getting started

You can use this library from a `<script>` tag, as a CommonJS-style
module with `require`, or as in ES6-style module with `import`
(including within a `<script type="module">` context).

The easiest way to get started is loading `dist/daily-iframe.js` in a
script tag, then calling the `window.DailyIframe.wrap()` factory method.

```
<html>
<head><title>basic video call events demo</title>
</head>
<body>

<iframe id="call-frame"
        width=350 height=425
        allow="camera; microphone; autoplay"
        style="position: absolute;
               right: 1em;
               bottom: 3em;"></iframe>

<script>
function showEvent(e) {
  console.log('VIDEO CALL EVENT -->', e);
}

function run() {
  window.callFrame = window.DailyIframe
                        .wrap(document.getElementById('call-frame'));
  callFrame.on('joining-meeting', showEvent)
           .on('joined-meeting', showEvent)
           .on('left-meeting', showEvent)
           .on('participant-joined', showEvent)
           .on('participant-updated', showEvent)
           .on('participant-left', showEvent)
           .on('error', showEvent);

  console.log('VIDEO CALL WRAPPER -->', callFrame);

  callFrame.join({ url: YOUR_DAILY_CO_MEETING_URL });
}
</script>
<script src="../dist/daily-iframe.js" onload="run()"></script>

</body>
</html>
```

## The DailyIframe class

This main entry point for this library's functionality is the
`DailyIframe` class.

Loading the module with a `<script>` tag exposes the class as
`window.DailyIframe`. You can also use a bundler like Webpack or
Rollup and `require` or `import` like this:

```
// webpack/node-style require
//
const DailyIframe = require('daily-iframe');
let callFrame = DailyIframe().wrap(MY_IFRAME);

// cutting-edge, super-whizzy import
//
import DailyIframe from 'daily-iframe';
let callFrame = DailyIframe().wrap(MY_IFRAME);
```

The class exposes methods and events for managing the call lifecycle,
managing participant state, and customizing video element
layout and styling.

## Methods

- static methods
  - `wrap(iframe, properties`)
  - `createTransparentFrame(properties)`
- instance methods
  - `join(properties)`
  - `leave()`
  - `startScreenShare()`
  - `stopScreenShare()`
  - `iframe()`
  - `meetingState()`
  - `participants()`
  - `updateParticipant(sessionId, properties)`
  - `updateParticipants(propertiesObject)`
  - `localAudio()`
  - `localVideo()`
  - `setLocalAudio()`
  - `setLocalVideo()`

## Events

`DailyIframe` implements the
`[EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)`
interface.

You can install callbacks for the following events:

- joining-meeting
- joined-meeting
- left-meeting
- participant-joined
- participant-updated
- participant-left
- error

The `on()`, `once()`, and `off()` methods add and remove
callbacks. All of these methods return the `this` object, so that it's
easy to chain calls.

```
// example of using on() to add event callbacks
//
callFrame.on('joining-meeting', (evt) => { 
               console.log('joining-meeting event', evt);
               showSpinner();
            })
         .on('joined-meeting', (evt) => {
               console.lg('joined-meeting event', evt);
               callFrame.iframe().style.visibility = 'visible';
            });
```

The event object passed to the callbacks always includes an `action`
property with the event's name, so that your callback functions can
handle multiple event types.

### `joining-meeting`

Emitted when the `join()` method is called, while the call is loading
and connecting.

```
// example event object
{ action: 'joining-meeting' }
```

### `joined-meeting`

Emitted when the call has connected. The `participants` property lists
the current participants in the call.

```
// example event object
{
  action: 'joined-meeting'
  participants: {
    local: {
      audio: true
      joinedAt: Date(Mon Apr 29 2019 15:18:20 GMT-0700)
      local: true
      owner: true
      screen: false
      session_id: '42fb115a-6d42-4155-ae4f-c96629f5217d'
      user_id: 'f26added-7821-49fc-9cb1-f9e22924b2c4'
      user_name: "kwindla-desktop"
      video: true
    }
  }
}
```

### `left-meeting`

Emitted when the call disconnects.

```
// example event object
{ action: 'left-meeting' }
```

### `participant-joined`

Emitted when a new participant joins the call. The event's
`participant` property contains all available information about the participant.

Please note that this
event may arrive for a remote participant before the
`participant-joined` event, because remote participant data can become
available before audio and video streams are ready.

```
// example event object
{
  action: 'participant-joined'
  participant: {
    audio: false
    joinedAt: Date(Mon Apr 29 2019 15:29:20 GMT-0700)
    local: false
    owner: false
    screen: false
    session_id: '049ebba2-523b-4e6c-9a9f-1f8bb956670d'
    user_id: '049ebba2-523b-4e6c-9a9f-1f8bb956670d'
    user_name: ''
    video: false
  }
}
```

### `participant-updated`

Emitted when participant state changes. This event is fired for both
local and remote participant state changes. The event's `participant`
property contains all available information about the participant.

```
// example event object
{
  action: 'participant-updated'
  participant: { ... }
}
```

### `participant-left`

Emitted when a remote participant state leaves the call. The event's
`participant` property contains all of the available information about
the participant just before the participant disconnected.

```
// example event object
{
  action: 'participant-left'
  participant: { ... }
}
```

### `error`

Emitted when an unrecoverable call error is encountered. The event's
`errorMsg` property will contain a string with additional information.

If a call is in progress when the error is thrown, a `left-meeting`
event should be emitted immediately after the `error` event.

// example event object
{
  action: 'error',
  errorMsg: 'network unreachable'
}
```


