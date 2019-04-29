//
// sample code for wrapping iframe, initiating a call, handling
// events, and positioning video
//

//
// meeting url to join
//
const MEETING_URL = 'https://api-demo.daily.co/moderated-demo';

//
// example meeting owner token, should be created with is_owner=true
//
const MEETING_OWNER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvIjp0cnVlLCJhbyI6ZmFsc2UsInZvIjpmYWxzZSwiZCI6ImVjMzNmYzdkLThiZjAtNDg4Ny05MDg1LTljNjNkNWNjNDY3OSIsImlhdCI6MTU1NjUwOTM2Nn0.I2bhpbXorbTaFyumF4-Viz_vu8U1YK996qDWePzmrL0';

//
// example meeting member token, should be created with a user_id, a user_name,
// and start_video_off=true
//
const MEETING_MEMBER_TOKEN = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1ZCI6MTIzLCJ1IjoiQS4gQi4gTmFtZSIsImQiOiJlYzMzZmM3ZC04YmYwLTQ4ODctOTA4NS05YzYzZDVjYzQ2NzkiLCJpYXQiOjE1NTY1MDkzOTB9.lJAzfLkUouyZoyp2To0e--RTSLimvRC-YCNy616gIeU`;

//
// text to display when we're not in a meeting
//
const NOT_IN_MEETING_HTML = '(not in meeting)';

//
// video element width and height on the page.
//
const LOCAL_VIDEO_WIDTH = 320,
  LOCAL_VIDEO_HEIGHT = 180;

//
// html elements we'll use in the javascript code. the first four of
// these are defined in the parent html pages, the last one
// (mutedOverlay) will be constructed here dynamically
//
let callFrame,
  localInfoDiv,
  remoteInfoDiv,
  localVidPositioningDiv,
  mutedOverlay;

//
// -- meeting owner functions --
//

//
// called on body load. sets up the iframe for our call, then sets up
// the html elements we'll use for displaying/managing the call
//
function main_Owner() {
  // call the createTransparentFrame() factory function to create a
  // full-width, full-height, transparent iframe and a wrapper class
  // that allows us to control the call and respond to call events
  callFrame = window.DailyIframe.createTransparentFrame();
  callFrame
    .on('joining-meeting', showEvent)
    .on('joined-meeting', showEvent)
    .on('left-meeting', cleanupAfterLeaving)
    .on('participant-joined', updateUI)
    .on('participant-updated', updateUI)
    .on('participant-left', updateUI)
    .on('error', showEvent);
  window.callFrame = callFrame;

  // set up the div where we will display info about ourself
  localInfoDiv = document.getElementById('local-info');
  localInfoDiv.innerHTML = NOT_IN_MEETING_HTML;

  // set up the div that we'll use to position the local video element
  // and overlay the video with a mute icon. whenever we need to
  // re-position the video element, we will pass styles properties
  // into the iframe. we'll use the viewport-relative top, left,
  // width, and height of this vid.
  localVidPositioningDiv = document.getElementById('local-vid-positioning-div');
  localVidPositioningDiv.style.cssText = `
    position: relative;
    z-index: 99;
    width: ${LOCAL_VIDEO_WIDTH};
    height: ${LOCAL_VIDEO_HEIGHT};
  `;
  // create the element we'll display on top of the video when we're
  // muted
  mutedOverlay = createMutedOverlay();

  // set up the div where we will display info about remote participants
  // in the call
  remoteInfoDiv = document.getElementById('remote-participants-list');
}

//
// join meeting. called from our [ join mtg ] button
//
async function joinMtg_Owner() {
  // callFrame.join() returns a promise. so we can use
  // then() and catch(), or await on it.
  try {
    await callFrame.join({
      url: MEETING_URL,
      token: MEETING_OWNER_TOKEN,
    });
  } catch (e) {
    console.error('ERROR while joining meeting', e);
  }

  // check and make sure we are a meeting owner, otherwise remote audio
  // mute/unmute won't work
  if (!callFrame.participants().local.owner) {
    console.error('OOPS local participant is not a meeting owner');
  }
  // we're in the meeting now, so we'll have participant data about
  // ourselves, and any other participants in the call so far. update
  // the ui.
  updateUI();
}

//
// callback for left-meeting event
//
function cleanupAfterLeaving(e) {
  showEvent(e);
  localInfoDiv.innerHTML = NOT_IN_MEETING_HTML;
}

//
// callback for all participant events. also called manually from
// joinMtg_Owner as an example of awaiting on the join() method
//
function updateUI(e) {
  if (e) {
    showEvent(e);
  }

  // we call this method from several different events, so let's just do
  // the easiest thing and operate on the full participants list each
  // time. (we could handle each event separately if we want to update
  // the UI only for individual participants)
  let ps = window.callFrame.participants();

  // if we have information about ourselves, update that part of the UI
  if (ps.local) {
    updateLocalInfo(ps.local);
    positionVideo_Owner();
  }

  let remoteText = '';
  for (var id in ps) {
    let participant = ps[id];
    if (participant.local) {
      continue;
    }
    remoteText += `
${participant.user_name || participant.user_id || participant.session_id}:
  user_id: ${participant.user_id}
  mic:     ${participant.audio ? 'on' : 'off'} ${micToggleButton(participant)}
    `;
  }
  remoteInfoDiv.innerHTML = `
<pre>
${remoteText}
</pre>
  `;
}

//
// create a "button" that will toggle a remote participant's mute state
//
function micToggleButton(participant) {
  if (participant.fromPhoneNumber) {
    // can't control audio remotely for phone dial-in, yet
    return '';
  }
  return `<span onclick="updateRemoteMicState(this,'${
    participant.session_id
  }',{setAudio:${!participant.audio}})">[ toggle ]</span>`;
}

//
// update remote participant's mute state. it takes about 1s to
// transmit the mute message to the remote client, and another 1s to
// upate our local view of the remote client's mic state. so it's
// worth modifying the local UI to let the user know that the mute is
// in progress. we'll modify our button text, here, and then let
// upateUI() change it back when we get any new participant info. note
// that this doesn't tie the button UI state *specifically* to this
// participant update event flow, but that's probably an ok shortcut
//
function updateRemoteMicState(button, participantId, newMicState) {
  button.onclick = null;
  button.innerHTML = '[ ...... ]';
  callFrame.updateParticipant(participantId, newMicState);
}

//
// position our local video display using the bounding rectangle of
// our placeholder/container div
//
function positionVideo_Owner() {
  let bounds = localVidPositioningDiv.getBoundingClientRect();
  callFrame.updateParticipant('local', {
    styles: {
      cam: {
        div: {
          visibility: 'visible',
          top: bounds.top,
          left: bounds.left,
          width: bounds.width,
          height: bounds.height,
        },
      },
    },
  });
}

//
// -- member --
//

function main_Member() {
  callFrame = window.DailyIframe.createTransparentFrame();
  callFrame
    .on('joining-meeting', handleJoining)
    .on('joined-meeting', showEvent)
    .on('participant-joined', updateMember)
    .on('participant-updated', updateMember)
    .on('participant-left', updateMember)
    .on('error', showEvent);
  window.callFrame = callFrame;

  localInfoDiv = document.getElementById('local-info');
}

async function joinMtg_Member() {
  await callFrame.join({
    url: MEETING_URL,
    token: MEETING_MEMBER_TOKEN,
  });
  updateMember();
}

function handleJoining() {
  localInfoDiv.innerHTML = '( joining meeting )';
}

function updateMember() {
  let ps = window.callFrame.participants();

  if (ps.local) {
    updateLocalInfo(ps.local);
  }

  // display owner video whenever we see it. in a real app we probably
  // wouldn't do this every time we get any participant event, but
  // this is just sample code. ;-)
  for (var id in ps) {
    let participant = ps[id];
    if (participant.owner) {
      callFrame.updateParticipant(id, {
        styles: {
          cam: {
            div: {
              visibility: 'visible',
              width: 320,
              height: 180,
              bottom: '1em',
              left: '1em',
            },
          },
        },
      });
    }
  }
}

//
// -- shared functions --
//

function showEvent(e) {
  console.log('PARENT FRAME GOT EVENT -->', e);
}

function leaveMtg() {
  callFrame.leave();
}

function updateLocalInfo(local) {
  // show camera and mic state as text above the video
  localInfoDiv.innerHTML = `
<pre>
camera: ${local.video ? 'on' : 'off'}
mic:    ${local.audio ? 'on' : 'off'}
</pre>
  `;

  // we only display video for the call moderator (owner). so since
  // this is a shared utility function, we need to return here if
  // we're not an owner.
  if (!local.owner) {
    return;
  }

  // overlay a mute icon if mic is off
  if (local.audio) {
    try {
      localVidPositioningDiv.removeChild(mutedOverlay);
    } catch (e) {}
  } else {
    localVidPositioningDiv.appendChild(mutedOverlay);
  }
}

function createMutedOverlay(fillColor = '#ffffff') {
  let wrapperDiv = document.createElement('div'),
    scrimDiv = document.createElement('div'),
    svgDiv = document.createElement('div');

  // 50% opaque overlay
  scrimDiv.style.cssText = `
    position: absolute;
    background-color: darkgray;
    opacity: 0.5;
    width: 100%;
    height: 100%;
  `;

  // center svg vertically
  svgDiv.style.cssText = `
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `;

  wrapperDiv.appendChild(scrimDiv);
  wrapperDiv.appendChild(svgDiv);
  svgDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g id="Symbols" stroke="none" stroke-width="1" fill-rule="evenodd" fill="${fillColor}"><path d="M15.8931049,12.3495358 L15.8883757,12.354265 C15.7702192,12.7237203 15.5976472,13.0928313 15.3634551,13.4334743 C14.9080287,14.0959127 14.281481,14.5761112 13.4232304,14.8194102 L11,17.2426407 L11,18.9906311 C11,18.9937578 11.0000137,18.9968808 11.0000409,19 L9.99077797,19 C9.45097518,19 9,19.4477153 9,20 C9,20.5561352 9.44358641,21 9.99077797,21 L14.009222,21 C14.5490248,21 15,20.5522847 15,20 C15,19.4438648 14.5564136,19 14.009222,19 L12.9999626,19 C12.999986,18.9968804 13,18.9937574 13,18.9906311 L13,16.9383953 C14.793746,16.7093537 16.1268712,15.8533183 17.0115375,14.566531 C17.631941,13.6641258 17.9116422,12.769082 17.9922726,12.124039 C18.0567667,11.6080864 17.715976,11.1348845 17.2185349,11.0241058 L17.2162194,11.0264213 C17.1758852,11.0160463 17.1430789,11.0101085 17.12403,11.0077274 C16.5760096,10.9392248 16.076219,11.3279514 16.0077165,11.8759725 C15.9990827,11.9450424 15.9659776,12.1062504 15.8970768,12.3267333 C15.8944966,12.3349898 15.8931939,12.3425837 15.8931049,12.3495358 Z M14.8100942,4.94726512 C14.3837386,3.80970165 13.2864273,3 12,3 C10.3431458,3 9,4.34314575 9,6 L9,10.7573593 L14.8100942,4.94726512 Z M7.97590142,11.7814579 C7.86511978,11.2840207 7.39191988,10.9432336 6.87596978,11.0077274 C6.32795032,11.0762298 5.93922497,11.5760196 6.0077274,12.124039 C6.05291889,12.4855709 6.16064541,12.9256367 6.35584336,13.401516 L7.97590142,11.7814579 Z M20.4877316,2.09805481 C20.8769027,1.70888376 21.506248,1.70725811 21.8994949,2.10050506 C22.2900192,2.49102936 22.2956069,3.1186067 21.9019452,3.51226838 L3.51226838,21.9019452 C3.12309732,22.2911162 2.49375202,22.2927419 2.10050506,21.8994949 C1.70998077,21.5089706 1.70439313,20.8813933 2.09805481,20.4877316 L20.4877316,2.09805481 Z" id="Combined-Shape"></path></g></svg>`;

  // set the size of the SVG
  svgDiv.childNodes[0].style.cssText = `
    width: 100%;
    height: 25%;
  `;

  return wrapperDiv;
}
