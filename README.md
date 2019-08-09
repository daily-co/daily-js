# daily-js

The official front-end library for the Daily.co video calling API.

- Manage call lifecycle and participant state
- Respond to in-call events
- Customize call layout and UI

More information about the Daily.co API for video calls here:

  https://www.daily.co/api

API "getting started" info and reference docs for creating and
managing rooms, permission tokens, recordings, and other resources are
here:

  https://docs.daily.co/reference

Demos and sample code for this library are here:

  https://github.com/daily-co/daily-js/tree/master/demo

## Using this library

You can use this library from a `<script>` tag, as a CommonJS-style
module with `require`, or as an ES6-style module with `import`
(including within a `<script type="module">` context).

The easiest way to get started is to load this library from unpkg,
and add a couple of lines of code to your web page or app.

```
<script crossorigin src="https://unpkg.com/@daily-co/daily-js"></script>
<script>
function createFrameAndJoinRoom() {
  window.callFrame = window.DailyIframe.createFrame();
  callFrame.join({ url: A_DAILY_CO_ROOM_URL });
}
</script>
```

Here's a very simple working demo/template:

  https://github.com/daily-co/daily-js/blob/master/demo/basics.html

More demos are available in the [demo/](demo/) directory.

Of course, you can also use a bundler like webpack or rollup.

```
npm install @daily-co/daily-js

```

Then in your application code:

```
// webpack/node-style require
//
const DailyIframe = require('@daily-co/daily-js');
let callFrame = DailyIframe.wrap(MY_IFRAME);

// or, cutting-edge, super-whizzy import
//
import DailyIframe from '@daily-co/daily-js';
let callFrame = DailyIframe.wrap(MY_IFRAME);
```

## The DailyIframe class

This main entry point for this library's functionality is the
`DailyIframe` class.

The class exposes methods and events for managing the call lifecycle,
managing participant state, and customizing video element
layout and styling.

## Methods

- factory methods
  - `createFrame(parentEl, properties)`
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
  - `sendAppMessage()`
  - `setBandwidth({ kbs, trackConstraints })`
  - `getNetworkStats()`
  - `setShowNamesMode(mode)`
  - `startRecording()`
  - `stopRecording()`
  - `cycleCamera()`
  - `getInputDevices()`
  - `setInputDevices()`
  - `setOutputDevice()`
  - `addFakeParticipant({ aspectRatio })`
  - `on(eventName, callback)`
  - `once(eventName, callback)`
  - `off(eventName, callback)`

### Factory methods and top-level configuration

You don't ever need to call the `DailyIframe` constructor
directly. Instead, use one of the factory methods, `createFrame()`,
`wrap()` or `createTransparentFrame()`.

The factory methods accept a `properties` object. (You can also set
these properties when you call the `load` or `join()` methods.)

```
// top-level configuration properties. can be passed to the factory
// method that creates the DailyIframe object, or to the join()
// method.
{
  url: <required: url of the meeting to join>
  token: <optional: meeting join token>
  iframeStyle: <optional: used only by `createFrame()`>
  customLayout: <optional: use a custom in-call UI>
  cssFile: <optional: for a custom UI, an external css stylesheet to load>
  cssText: <optional: for a custom UI, an inline css style text to load>
  bodyClass: <optional: for a custom UI, class attributes to apply to the iframe body element>
}
```

#### `createFrame(parentEl, properties)`

Use this method to create a call `iframe` element and insert it into
the DOM.

Both arguments are optional. If you provide a `parentEl`, the new
`iframe` will be appended as a child of that element. Otherwise, the
new `iframe` will be appended as a child of `document.body`.

The second argument is the properties object defined above. If you
don't set at least the `url` property here, you'll need to set it
later when you call the `join()` or `load()` method.

You can set the css properties of the new `iframe` by passing a
javascript-style css properties hash in the `iframeStyle`
property. For example:

```
// for a full-page video call with the standard Daily.co UI
//
callFrame = window.DailyIframe.createFrame({
  iframeStyle: {
    position: 'fixed',
    width: '100%',
    height: '100%'
  }
});
```

The default `iframeStyle` (styles applied to the `iframe` if you don't
supply any) depend on whether the new `iframe` is a child of
`document.body` or not. If the new `iframe` is a child of
`document.body`, the defaults position the `iframe` as a floating
window in the bottom right of the page. If, on the other hand, you
specify a `parentEl` deeper in the DOM tree, the defaults are to fill
the width and height of the parent element.

#### `wrap(iframe, properties)`

Use this factory method to wrap an `iframe` DOM element that you've
already defined.

The first argument is the iframe you want to wrap. The second argument
is the properties object defined above. A properties argument is
optional.

You will need to set `allow="microphone; camera; autoplay"` on your
`iframe` to be able to turn on the camera and microphone.

#### `createTransparentFrame(properties)`

A convenience method that creates a full-page overlay, transparent iframe
that ignores all pointer events.

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
  <div class="daily-video-toplevel-div (toplevel classes...)
       style=" (toplevel style variables...) ">

    <div class="daily-videos-wrapper (call-state classes)">

      <div class="daily-video-div (video classes...)"
           style=" --aspect-ratio:(aspect ratio) (participant div styles...) "
           data-user-name=" (user_name) "
           data-user-id=" (user_id) ">
        <div class="daily-video-overlay (video classes...)"
             style=" --aspect-ratio:(aspect ratio) (participant overlay styles...) "
             data-user-name=" (user_name) "
             data-user-id=" (user_id) ">
        <video class="daily-video-element (video classes...)">
               style=" --aspect-ratio:(aspect ratio) (participant video styles...) "
               data-user-name=" (user_name) "
               data-user-id=" (user_id) ">
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
  pointer-events: none;
}
.daily-video-element {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
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

The local video element (the user's own camera view) is flipped
horizontally. This is the norm in video conferencing user interfaces.

Lists of classes that depend on call and participant state are
attached to the various elements listed above.

##### Additional classes of `.daily-video-toplevel-div`:

- `recording`: the call is being recorded
- `recording-uploading`: the recording is being done locally and saved to the cloud, and uploading to the cloud is in progress. This should *always* be true during a local cloud recording, and will stay true until the upload completes, even after the recording is stopped.

##### Additional classes of `.daily-videos-wrapper`:

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

##### Additional classes and styles of `.daily-video-div`,
`.daily-video-overlay`, and `.daily-video-element`

The same set of additional classes is set for each "bundle" of these
DOM elements.

- `local`: this is video from the local participant
- `remote`: this is video from a remote participant
- `cam`: this is camera video
- `screen`: this is screen sharing video
- `cam-on`: the camera for this participant is turned on and streaming
- `cam-muted`: the camera for this participant is unavailable, blocked, or muted
- `mic-on`: the mic for this participant is turned on and streaming
- `mic-muted`: the mic for this participant is unavailable, blocked, or muted

Per-participant styles set with the `updateParticipant()` method are
applied to each element.

The participant `user_name` and `user_id` supplied in HTML
`data-user-name` and `data-user-id` attributes. This allows the
display of usernames in pure css layouts. For example.

```
.show-names .daily-video-overlay::after {
  font-family: 'Lato', sans-serif;
  font-weight: bold;
  content: attr(data-user-name);
  position: absolute;
  padding: 0.65em;
  bottom: 0.25em;
  left: 0.25em;
}
```

The video stream aspect ratio is supplied as a css variable. This can
be helpful in dynamic/responsive sizing, as it's difficult with
css-only approaches to preserve video aspect ratio while also
precisely sizing container and overlay elements. For example, here is
css for sizing all video streams to 320 pixels wide, with height
flexible depending on each video's aspect ratio.

```
.daily-video-div {
  width: 320;
  height: calc(320px / var(--aspect-ratio));
}
```

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

#### `sendAppMessage(data, to)`

Sends a message to other participants in the call. `data` should be a
javascript object that can be serialized into JSON. `to` should be
either a participant `session_id`, or `"*"`. The `"*"` value is the
default, and means that the message is a "broadcast" message intended
for all participants.

You can listen for these messages by installing a handler for the
`app-message` event.

Messages are delivered to participants currently in the call. They are
not stored. If a recipient is not in the call when the message is
sent, the recipient will never receive the message.

Note that the `to` address is the `session_id`, not the `user_id`.

Broadcast messages are not delivered to the sender of the message.

Returns `this`.

#### `setLocalVideo(bool)`

Updates the local camera state. Does nothing if not in a call. Syntactic sugar for `this.updateParticipant('local', { video: bool })`.

Returns `this`.

#### `setBandwidth({ kbs, trackConstraints })`

**Experimental method**: Sets a cap on the combined upstream video
bandwidth used for WebRTC peer connections. This API may change in the
future.

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

This method will be extended to support simulcast soon.

Returns `this`.

#### `getNetworkStats()`

Returns a Promise that resolves with an array of network
statistics.

```
{
  stats: {
    latest: {
      timestamp: 1558918282005
      videoRecvBitsPerSecond: 648973
      videoRecvPacketLoss: 0
      videoRecvStreamCount: 1
      videoSendBitsPerSecond: 656493
      videoSendPacketLoss: 0
      videoSendStreamCount: 1
    }
    worstVideoRecvPacketLoss: 0
    worstVideoSendPacketLoss: 0
  }
}
```

#### `setShowNamesMode(mode)`

Determines whether user names are shown overlaying the video elements
in the standard Daily.co call user interface. Has no effect on custom UIs.

The `mode` argument must be one of `"always"`, `"never"`, or
`null`. `null` is the default UI behavior: names are shown when a user
is muted or the chat panel is open.

Returns `this`.

#### `startRecording()`

Starts a recording if recording is enabled for the
room/participant. Has no effect if recording is not enabled.

#### `stopRecording()`

Stops a recording if the participant is currently recording. Has no
effect if there's no current recording.

#### `cycleCamera()`

Switches the local camera stream to use the next available camera
device. Has no effect if there is only one camera.

Returns a Promise that resolves with data about the camera
device. (The data is copied from the camera's [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) struct.)

#### `enumerateDevices()`

This is a wrapper around [navigator.mediaDevices.enumerateDevices()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices).

Returns a promise that resolves with a list of available video input
devices, and audio input and output devices.

#### `getInputDevices()`

Returns a Promise that resolves to return data about the camera and
mic devices that are currently being used. The data is copied from the
[MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo)
struct for each device.

#### `setInputDevices({ audioDeviceId, videoDeviceId })`

Switch to using a specific local audio device, video device, or
both. Takes device id arguments that match ids returned by
`enumerateDevices()`.

#### `setOutputDevice({ outputDeviceId })`

Sets the output output device. Takes a device id argument that matches
ids returned by `enumerateDevices()`.

Browser support for this API varies. Safari does not support setting
an audio output device, for example. (Apple users need to set audio
output at the OS level.)

#### `addFakeParticipant({ aspectRatio })`

Add a fake video stream to the call, to help with implementing custom
layouts. Has no effect unless you are using a custom layout.

The `aspectRatio` argument defaults to `16/9`. Other supported aspect
ratios are `3/4` and `4/3`.

Returns `this`.

#### `on(eventName, callback) once(eventName, callback)
off(eventName, callback)`

Adds and removes event callbacks. See documentation for [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter).


## Events

`DailyIframe` implements the [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) interface.

You can install callbacks for the following events:

- loading
- loaded
- started-camera
- camera-error
- joining-meeting
- joined-meeting
- left-meeting
- participant-joined
- participant-updated
- participant-left
- recording-started
- recording-stopped
- recording-stats
- recording-error
- recording-upload-completed
- app-message
- click
- mousedown
- mouseup
- mouseover
- mousemove
- touchstart
- touchmove
- touchend
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

#### `click`, `mousedown`, `mouseup`, `mouseover`, `mousemove`, `touchstart`, `touchmove`, `touchend`

Emitted when corresponding input event fires for a participant video.

```
// example event object
{
  action: 'click',
  event: {
    type: 'click'
    altKey: false
    button: 0
    ctrlKey: false
    metaKey: false
    offsetX: 40
    offsetY: 46
    pageX: 134
    pageY: 46
    screenX: 2706
    screenY: 298
    shiftKey: false
    x: 134
    y: 46
  },
  participant: <participant object>
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
