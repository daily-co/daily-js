# daily-js demos

To build these demos and start a local web server, execute these
commands from the top-level directory in this repo:

```
npm install
npm run build-dev
npm run demo
```

You'll also need a `.env` file in this directory (`demo/`).

You'll need to log into your Daily.co dashboard, generate an API key, and use
that key with the (create-meeting-token)[create-meeting-token] API method to
generate some meeting tokens.

Make a new file, called `.env` and set several environment variables:

```
DEMO_MEETING_URL=https://foo.daily.co/your-meeting
DEMO_MEETING_TOKEN=a-meeting-token

MODERATED_DEMO_MEETING_URL=https://foo.daily.co/your-meeting
MODERATED_DEMO_MEETING_OWNER_TOKEN=a-meeting-token-with-is_owner-set
MODERATED_DEMO_MEETING_MEMBER_TOKEN=another-meeting-token
```

Unless there is a port conflict, the demo web server will start on port 3000.

Here's a simple demo showing how to do custom layouts using CSS:

  http://localhost:3000/demo/layout-css.html

The css for the layout demo is:
  
  https://github.com/daily-co/daily-js/blob/master/demo/layout-css.css
  
Here's a demo showing a moderated broadcast use case, in which only
the meeting owner's video is displayed, and the meeting owner can turn
on and off remote participant microphones:

  http://localhost:3000/demo/moderated-demo-owner.html
  http://localhost:3000/demo/moderated-demo-member.html

