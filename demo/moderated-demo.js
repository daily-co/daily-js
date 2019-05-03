//
// sample code for wrapping iframe, initiating a call, handling
// events, and positioning video
//

//
// from demo/.env, get a meeting url, on owner token, and a member token
//
let MEETING_URL,
    MEETING_OWNER_TOKEN,
    MEETING_MEMBER_TOKEN;

async function fetchConfig() {
  let res = await fetch('/env');
  let config = await res.json();
  console.log('CONFIG', config);
  MEETING_URL = config.MODERATED_DEMO_MEETING_URL;
  MEETING_OWNER_TOKEN = config.MODERATED_DEMO_MEETING_OWNER_TOKEN,
  MEETING_MEMBER_TOKEN = config.MODERATED_DEMO_MEETING_MEMBER_TOKEN;
}


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
// html elements we'll use in the javascript code.
//
let callFrame,
    localInfoDiv,
    remoteInfoDiv;

//
// -- meeting owner functions --
//

//
// called on body load. sets up the iframe for our call, then sets up
// the html elements we'll use for displaying/managing the call
// 
async function main_Owner() {
  await fetchConfig();

  // call the createTransparentFrame() factory function to create a
  // full-width, full-height, transparent iframe and a wrapper class
  // that allows us to control the call and respond to call events
  callFrame = window.DailyIframe.createTransparentFrame();
  callFrame.on('joining-meeting', showEvent)
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
      cssFile: 'moderated-demo-owner.css'
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
  return `<span onclick="updateRemoteMicState(this,'${participant.session_id}',{setAudio:${!participant.audio}})">[ toggle ]</span>`;
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
// -- member --
//


async function main_Member() {
  await fetchConfig();

  callFrame = window.DailyIframe.createTransparentFrame();
  callFrame.on('joining-meeting', handleJoining)
           .on('joined-meeting', showEvent)
           .on('left-meeting', cleanupAfterLeaving)
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
    cssFile: 'moderated-demo-member.css'
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

  // demonstrate positioning/styling in javascript. here we display
  // owner video whenever we see it. in a real app we probably
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
              width: 320, height: 180,
              bottom: '1em', left: '1em'
            }
          }
        }
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

//
// callback for left-meeting event
//
function cleanupAfterLeaving(e) {
  showEvent(e);
  localInfoDiv.innerHTML = NOT_IN_MEETING_HTML;
}

function updateLocalInfo(local) {
  // show camera and mic state as text above the video
  localInfoDiv.innerHTML = `
<pre>
camera: ${local.video ? 'on' : 'off'}
mic:    ${local.audio ? 'on' : 'off'}
</pre>
  `;
}
