# daily-js

The official front-end library for the Daily.co video calling API.

- Manage call lifecycle and participant state
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

- factory methods
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
  - `on(eventName, callback)`
  - `once(eventName, callback)`
  - `off(eventName, callback)`

### Factory methods and top-level configuration

You don't ever need to call the `DailyIframe` constructor
directly. Instead, use one of the factory methods, `wrap()` or
`createTransparentFrame()`.

Both factory methods accept a `properties` object. (You can also set
these properties when you call the `join()` method.)

```
// top-level configuration properties. can be passed to the factory
// method that creates the DailyIframe object, or to the join()
// method.
{
  url: <required: url of the meeting to join>
  token: <optional: meeting join token>
}
```

#### `wrap(iframe, properties)`

Use this factory method to wrap an `iframe` DOM element that you've
already defined.

The first argument is the iframe you want to wrap. The second argument
is the properties object defined above. A properties argument is
optional. You can also set these properties when you call the `join()`
method.

#### `createTransparentFrame(properties)`

Use this factory method when you want to implement the call user
interface yourself. This method creates a full-width, full-height,
transparent iframe that ignores all pointer events. The iframe is
appended to the `document.body`.

### Instance methods reference

#### `join(properties)`

Joins a meeting.

Takes the same `properties` object that the factory methods take. The
properties argument is optional, but the meeting `url` must be set
either here or previously.

Returns a promise, which resolves when the join completes. The promise
resolves with a participants object. This is the same participants
object that is passed to the `joined-meeting` event. You will often
want to do some call setup or UI updating as soon as a meeting is
joined. You can do that when the `join()` promise resolves, or by
installing a `joined-meeting` event listener. The two approaches are
pretty much equivalent.

```
async function joinExample() {
  let participants;
  try {
    participants await callFrame.join();
  } catch (e) {
    console.error('ERROR while joining meeting', e);
    return;
  }
  console.log('local mic is', participants.local.audio ? 'on': 'off');
}
```

#### `leave`()

Leaves the meeting. If there is no meeting, this method does
nothing. Returns `null`;

#### `startScreenShare()`

Starts a screen share from the local participant. If there is no
meeting, or this is not a browser that supports screen sharing, this
method does nothing.

There's no way to know if the user ignores or cancels the browser's
screen share confirmation dialog.

To confirm that screen sharing started, listen for
`update-participant` events and check the local user's `screen`
property.

You can call `startScreenShare()` even if the `enable_screenshare`
property is set to `false` for the current
[room](https://docs.daily.co/reference#rooms) or [meeting
token](https://docs.daily.co/reference#meeting-tokens). `enable_screenshare`
only configures whether the default Daily.co in-call UI allows screen
sharing.

Returns `null`.

#### `stopScreenShare()`

Stops a current screen share, if there is one.

Returns `null`.

#### `iframe()`

Returns the `iframe` DOM element that this object wraps.

#### `meetingState()`

Returns the current meeting state.

- new
- joining-meeting
- joined-meeting
- left-meeting
- error

If an error is thrown, the meeting state will transition to 'error',
not 'left-meeting', even though the meeting connection will also be
terminated by the error.

#### `participants()`

Returns the current meeting participants. The participants information
is an object that looks like this:

```
{
  "local": {
    "user_id": "user_123",
    "audio": true,
    "video": true,
    "screen": false,
    "joinedAt": Date(2019-04-30T00:06:16.011Z),
    "local": true,
    "owner": true,
    "session_id": "3c9ba1ea-baab-4876-d501-21a1d49c0902",
    "user_name": "A. User Name"
  },
  "e20b7ead-54c3-459e-800a-ca4f21882f2f": {
    "user_id": "e20b7ead-54c3-459e-800a-ca4f21882f2f",
    "audio": true,
    "video": true,
    "screen": false,
    "joinedAt": Date(2019-04-30T00:06:32.485Z),
    "local": false,
    "owner": "",
    "session_id": "e20b7ead-54c3-459e-800a-ca4f21882f2f",
    "user_name": ""
  }
}
```

The object keys are 'local' for the local participant and the
participant's `session_id` for remote participants.

Participant properties are as follows:

- `session_id` - a unique id generated each time a participant joins a meeting
- `user_id` - the user's id if set by a meeting token, otherwise the session_id
- `user_name` - the user's name if set by a meeting token or set from the account if the user is logged into a Daily.co account
- `local` - `true` for the local user
- `owner` - `true` if set by a meeting token or the user is logged into a Daily.co account and is a member of the room's team
- `joined_at` - js Date object, the time that the user joined the room
- `audio` - `true` if the user's mic is active
- `video` - `true` if the user's camera is active
- `screen` - `true` if the user is screen sharing

#### `updateParticipant(sessionId, config)`

Modify a participant, either by sending a message to change its state,
or by changing the local view.


Returns `this`.


The first argument is the participant's `session_id`, or `'local'` for
the local participant.

The second argument is a set of actions to take.

Actions:

- `setAudio`: `true` | `false`,
- `setVideo`: `true` | `false`,
- `eject`: `true`
- `styles`: custom layout (see below)

`setAudio`, `setVideo`, and `eject` on remote participants require
meeting owner permission. If an action is not possible (or if there is
no current meeting) the action will not be attempted.

**Please note that remotely controlling a user's microphone and
camera is a potential privacy issue. This functionality is important
for some use cases, but should not be a general feature of video call
user interfaces. Think carefully before you enable remote control of
cameras and microphones. And be aware that browsers will require that
a user explicitly allow mic/camera device access at least once. Chrome
will prompt the first time a user joins a call on a specific
subdomain. Safari will prompt once each meeting session.**

The `styles` action is only used if you are implementing your own custom in-call video layout. The format of the `styles` property is


```
styles: {
  cam: {
    div: { ...css properties }
    video: { ...css properties }
  },
  screen: {
    div: { ...css properties }
    video: { ...css properties }
  }
}
```

Each available video stream in the video call iframe is wrapped in a div, so that you can style both a container and the video element itself.

```
<div class="daily-video-toplevel-div>

  <div class="daily-video-div cam">
    <video class="daily-video-element cam"></video>
  </div>

  ... additional video elements
</div>
```

The `styles.cam.div` style css properties are applied to the container div for the participant's camera stream. The `styles.cam.video` css properties are applied to the video element for the participant's camera stream. The `styles.screen.div` and `styles.screen.video` are applied to the container and video element for the participant's screen share feed.

Here are the default styles for the container and video element classes.

```
      .daily-video-toplevel-div {
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
      }
      .daily-video-div {
        position: fixed;
        visibility: hidden;
      }
      .daily-video-element {
        position: relative;
        width: 100%;
        overflow: hidden;
        height: 100%
      }
      .daily-video-element.local {
        transform: scale(-1,1);
      }
```


To make the video feed for the local participant visible, and position it, you only need to set a few css properties of the local participant's `styles.cam.div`. Here's how you might "shadow" the position and size of a placeholder div you've created:


```
let bounds = localVidPositioningDiv.getBoundingClientRect();
callFrame.updateParticipant('local', {
  styles: {
    cam: {
      div: {
        visibility: 'visible',
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
      }
    }
  }
});  
```

#### `updateParticipants(propertiesObject)`

Syntactic sugar for updating multiple participants with a single call. The `propertiesObject`'s keys are participant session ids and values are the `properties` objects described above. Internally, loops over the keys and calls `updateParticipant()` multiple times.

Returns `this`.

#### `localAudio()`

Returns the local mic state or null if not in a call. Syntactic sugar for `this.participants.local.audio`.

#### `localVideo()`

Returns the local camera state or null if not in a call. Syntactic sugar for `this.participants.local.video`.

#### `setLocalAudio(bool)`

Updates the local mic state. Does nothing if not in a call. Syntactic sugar for `this.updateParticipant('local', { audio: bool })`.

Returns `this`.

#### `setLocalVideo(bool)`

Updates the local camera state. Does nothing if not in a call. Syntactic sugar for `this.updateParticipant('local', { video: bool })`.

Returns `this`.

#### `on(eventName, callback)  once(eventName, callback)  off(eventName, callback)`

Adds and removes event callbacks. See documentation for [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter).


## Events

`DailyIframe` implements the [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) interface.

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

### events reference

#### `joining-meeting`

Emitted when the `join()` method is called, while the call is loading
and connecting.

```
// example event object
{ action: 'joining-meeting' }
```

#### `joined-meeting`

Emitted when the call has connected. The `participants` property lists
the current participants in the call. See the `participants()` method
above for a description of the participant object.

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

#### `left-meeting`

Emitted when the call disconnects.

```
// example event object
{ action: 'left-meeting' }
```

#### `participant-joined`

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

#### `participant-updated`

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

#### `participant-left`

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

#### `error`

Emitted when an unrecoverable call error is encountered. The event's
`errorMsg` property will contain a string with additional information.

If a call is in progress when the error is thrown, a `left-meeting`
event should be emitted immediately after the `error` event.

// example event object
{
  action: 'error',
```
  errorMsg: 'network unreachable'
}
```

