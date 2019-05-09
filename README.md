# daily-js

The official front-end library for the Daily.co video calling API.

- Manage call lifecycle and participant state
- Respond to in-call events
- Customize call layout and UI

## Getting started

You can use this library from a `<script>` tag, as a CommonJS-style
module with `require`, or as an ES6-style module with `import`
(including within a `<script type="module">` context).

The easiest way to get started is to clone and build this repo, use
`dist/daily-iframe.js` in a script tag, then in your application code
call the `window.DailyIframe.wrap()` factory method.

```
git clone https://github.com/daily-co/daily-js.git
cd daily-js
npm install
npm run build
```

To explore the capabilities of this front-end API, see see [demo/](demo/)
and [demo/README.md](demo/README.md) for running a local demo.

Sample html/js:

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

Of course, you can also use a bundler like webpack or rollup.  Install
this github repo into your `package.json` and `node_modules`.

```
npm install --save daily-co/daily-js

```

Then in your application code:

```
// webpack/node-style require
//
const DailyIframe = require('@daily-co/daily-js');
let callFrame = DailyIframe().wrap(MY_IFRAME);

// or, cutting-edge, super-whizzy import
//
import DailyIframe from '@daily-co/daily-js';
let callFrame = DailyIframe().wrap(MY_IFRAME);
```

## The DailyIframe class

This main entry point for this library's functionality is the
`DailyIframe` class.

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
  - `loadCss({ bodyClass, cssText, cssFile })`
  - `updateParticipants(propertiesObject)`
  - `localAudio()`
  - `localVideo()`
  - `setLocalAudio()`
  - `setLocalVideo()`
  - `setBandwidth({ kbs, trackConstraints })`
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
  cssFile: <optional: an external css stylesheet to load>
  cssText: <optional: inline css style text to load>
  bodyClass: <optional: class attributes to apply to the iframe body element>
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
meeting, or this is not a browser that supports screen sharing, or
`enable_screenshare` is set to false for either the room or the
meeting token, this method does nothing.

There's no way to know if the user ignores or cancels the browser's
screen share confirmation dialog.

To confirm that screen sharing started, listen for
`update-participant` events and check the local user's `screen`
property.

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
  local: {
    user_id: "user_123",
    audio: true,
    cam_info: {
      height: 180,
      left: 286,
      top: 16,
      video_height: 720,
      video_width: 1280,
      width: 320,
    },
    video: true,
    screen: false,
    screen_info: {},
    joinedAt: Date(2019-04-30T00:06:16.011Z),
    local: true,
    owner: true,
    session_id: "3c9ba1ea-baab-4876-d501-21a1d49c0902",
    user_name: "A. User Name"
  },
  "e20b7ead-54c3-459e-800a-ca4f21882f2f": {
    user_id: "e20b7ead-54c3-459e-800a-ca4f21882f2f",
    audio: true,
    cam_info: {}
    video: false,
    screen: false,
    screen_info: {}.
    joinedAt: Date(2019-04-30T00:06:32.485Z),
    local: false,
    owner: false,
    session_id: "e20b7ead-54c3-459e-800a-ca4f21882f2f",
    user_name: ""
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
- `cam_info` - properties of the participant's `video` element. `top`, `left`, `width` and `height` are the video element's global position as returned by the `getBoundingClientRect()` DOM method. `video_width` and `video_height` are the current width and height of the live video stream. `video_width` and `video_height` can change as network conditions change. If there is no current camera stream, this will be an empty object.
- `screen_info` - properties of the participant's `screen` video element. This has the same properties as `cam_info`.

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
no current meeting) the action will be silently ignored.

**Please note that remotely controlling a user's microphone and
camera is a potential privacy issue. This functionality is important
for some use cases, but should not be a general feature of video call
user interfaces. Think carefully before you enable remote control of
cameras and microphones. And be aware that browsers will require that
a user explicitly allow mic/camera device access at least once. Chrome
will prompt the first time a user joins a call on a specific
subdomain. Safari will prompt once each meeting session.**

The `styles` action is only used if you are implementing your own
custom in-call video layout. The format of the `styles` property is:


```
styles: {
  cam: {
    div: { ...css properties }
    overlay: { ...css properties }
    video: { ...css properties }
  },
  screen: {
    div: { ...css properties }
    overlay: { ...css properties }
    video: { ...css properties }
  }
}
```

The `styles.cam.div` style css properties are applied to the container
div for the participant's camera stream. The `style.cam.overlay` style
css properties are applied to the overlay element for the
participant's camera stream. The `styles.cam.video` css properties are
applied to the video element for the participant's camera stream. The
`styles.screen.div` and `styles.screen.video` are applied to the
container and video element for the participant's screen share feed.

For example, to position the local camera feed and make it visible,
you only need to set a few css properties of the local participant's
`styles.cam.div`. Here's how you might "shadow" the position and size
of a placeholder div you've created:


```
let bounds = localVidPositioningEl.getBoundingClientRect();
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

See the next section, about the `loadCss()` method, for more
information about implementing custom layouts.

#### `loadCss({ bodyClass, cssFile, cssText })`

You can call this function any time to (re-)set the body classes and
CSS that you've passed into the iframe.

These three styling properties are used to implement completely custom
layouts. They are ignored unless you have constructed the DailyIframe
object using the `createTransparentFrame()` factory function.

The three styling properties can be passed to the factory function, to
the `join()` method, or to this `loadCss()` method.

See the `demo/layout-css.html` and `demo/layout-css.css` files for an
example of a custom layout with several dynamic options, implemented
entirely in css.

The `bodyClass` property is a string. The `class` attribute of the
`body` element inside the call iframe will be set to this string. You
can include multiple class names in the string. (Just separate the
class names with spaces.)


```
callFrame.loadCss({ bodyClass: 'theme-bubbles minimized-view' });

```

The `cssFile` property is the url of a stylesheet to fetch
externally. The url can be an absolute url, or a relative url. If it's
relative, the url will be resolved relative to the parent iframe.

Each call to `loadCss()` will replace the previous `cssFile`
stylesheet, if a `cssFile` property is passed to the method. (It can
sometimes be useful to switch stylesheets in the middle of a call.) To
remove the previous stylesheet, pass an empty string (`''`) as the
`cssFile` property.


```
 callFrame.loadCss({ cssFile: '/static/call-theme-bubbles.css' });
```

The `cssText` property is a string of css to load into the iframe
inside a `<style>` element. 

Each call to `loadCss()` will replace the previous `cssText`
style element, if a `cssText` property is passed to the method.


```
// a very simple custom layout:
// this css will display every participant's
// video streams in a column down the right side
// of the window
//
callFrame.loadCss({ cssText: `
  .daily-video-div {
    position: relative;
    visibility: visible;
    width: 320;
    height: 180;
    margin: 1em;
    margin-left: auto;
  }
`});
```

The `loadCss()` method returns `this`.

#### CSS for custom layouts

Each available video stream in the video call iframe is wrapped in a
div, and has a sibling element that is a div you can use as an
overlay. You can style the video container, the overlay, and the video
element. You can also style a separate top level div, a div that
wraps all of the video elements, and an info div.

Here is the DOM structure of the elements in a call that you can
style.


```
<body class=" (bodyClass classes...) ">
  <div class="daily-video-toplevel-div (toplevel classes...)">

    <div class="daily-videos-wapper (call-state classes)">

      <div class="daily-video-div (video classes...)"
           data-user-name=" (user_name) ">
        <div class="daily-video-overlay (video classes...)"
             data-user-name=" (user_name) "></div>
        <video class="daily-video-element (video classes...)">
               data-user-name=" (user_name) "></video>
      </div>
      ... additional video elements

    </div>

    <div class="info-div"></div>
  </div>
</body>
```

Here are the default styles for the container and video element classes.

```
.daily-video-toplevel-div {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
}
.daily-videos-wrapper {
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
.daily-video-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.daily-video-element {
  position: absolute;
  width: 100%;
  overflow: hidden;
  height: 100%
}
.daily-video-element.local.cam {
  transform: scale(-1,1);
}
```

As you can see above, the `visibility` of the `.daily-video-div`
container elements is set to `hidden` initially. This means that until
you override the default styles, no video streams are displayed.

Note that all available audio is always played. Even when a
participant's video stream is hidden, that participant's audio is
audible.

Lists of classes that depend on call and participant state are
attached to the various elements listed above.

Additional classes of `.daily-video-toplevel-div`:

- `recording`: the call is being recorded
- `recording-uploading`: the recording is being done locally and saved to the cloud, and uploading to the cloud is in progress. This should *always* be true during a local cloud recording, and will stay true until the upload completes, even after the recording is stopped.

Additional classes of `.daily-videos-wrapper`:

- `local-cam-on`: the local camera is turned on
- `local-cam-muted`: the local camera is unavailable, blocked, or muted
- `local-screen`: a local screen share is in progress
- `remote-cams-N`: there are N remote video participants in the
  call. This counts all video participants, even those that have no
  camera or have muted their camera. It does not count dial-in
  participants.
- `remote-cams-on-N`: there are N remote cameras turned on
- `remote-cams-muted-N`: there are N remote cameras unavailable or
  muted
- `remote-screens-N`: there are N remote screen shares in progress

Additional classes of `.daily-video-div`, `.daily-video-overlay`, and
`.daily-video-element` (the same set of additional classes is set for
each "bundle" of these elements):

- `local`: this is video from the local participant
- `remote`: this is video from a remote participant
- `cam`: this is camera video
- `screen`: this is screen sharing video
- `cam-on`: the camera for this participant is turned on and streaming
- `cam-muted`: the camera for this participant is unavailable, blocked, or muted
- `mic-on`: the mic for this participant is turned on and streaming
- `mic-muted`: the mic for this participant is unavailable, blocked, or muted

For example CSS-driven layouts, see the `/demo` directory.

#### `updateParticipants(propertiesObject)`

Syntactic sugar for updating multiple participants with a single
call. The `propertiesObject`'s keys are participant session ids and
values are the `properties` objects described above. Internally, this
method just loops over the keys and calls `updateParticipant()`
multiple times.

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

#### `setBandwidth({ kbs, trackConstraints })`

**Experimental method**: Sets a cap on the upstream video bandwidth
used for each WebRTC peer connection. This API may change in the future.

In general we try to hide all the complexity of WebRTC so that you can
focus on your own application rather than the details of audio and
video network streams! We do bandwidth management, for example, that
is "the right thing" for most use cases (based on lots of empirical
call data, plus experience working around cross-platform quirks).

But sometimes you might need to reach down through the abstraction
boundary to do specialized things. We want to make that possible,
too. This method is an experiment in that direction. Please let us
know if you're using it, and whether it helps you, and what other
functionality you need for your applications.

The `kbs` property is a soft cap on the upstream video bandwidth used
for each peer connection. Currently this is implemented by setting
[b=AS](https://tools.ietf.org/html/rfc4566#section-5.8) for each local
participant SDP `m=video` section. This mechanic may change in the
future, though, as browsers evolve.

Note that the `kbs` cap does not take into account audio bandwidth. We
don't currently support customizing audio bandwidth settings.

The `trackConstraints` property is a [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints) dictionary that will be applied to the local video track, if possible. Browser support for the [MediaStreamTrack.applyConstraints()](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/applyConstraints) is still a work in progress. But support is improving rapidly.

Here's an example of using `setBandwidth()` to transmit 64x64 images
at a target video bandwidth cap of 32 kilobits per second.

```
callFrame.setBandwidth({
  kbs: 32,
  trackConstraints: { width: 64, height: 64 }
});
```

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
  action: 'joined-meeting',
  participants: {
    local: {
      audio: true,
      cam_info: {
        height: 180,
        left: 286,
        top: 16,
        video_height: 720,
        video_width: 1280,
        width: 320,
      },
      joinedAt: Date(Mon Apr 29 2019 15:18:20 GMT-0700),
      local: true,
      owner: true,
      screen: false,
      screen_info: {},
      session_id: '42fb115a-6d42-4155-ae4f-c96629f5217d',
      user_id: 'f26added-7821-49fc-9cb1-f9e22924b2c4',
      user_name: "kwindla-desktop",
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
  action: 'participant-joined',
  participant: {
    audio: false,
    cam_info: {},
    joinedAt: Date(Mon Apr 29 2019 15:29:20 GMT-0700),
    local: false,
    owner: false,
    screen: false,
    screen_info: {},
    session_id: '049ebba2-523b-4e6c-9a9f-1f8bb956670d',
    user_id: '049ebba2-523b-4e6c-9a9f-1f8bb956670d',
    user_name: '',
    video: false,
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

```
// example event object
{
  action: 'error',
  errorMsg: 'network unreachable'
}
```
