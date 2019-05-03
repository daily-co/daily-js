const handler = require('serve-handler');
require('dotenv').config()

const config = {
  DEMO_MEETING_URL: process.env.DEMO_MEETING_URL,
  DEMO_MEETING_TOKEN: process.env.DEMO_MEETING_TOKEN
};

module.exports = async (req, res) => {
  console.log(req.url);
  if (req.url === '/env') {
    res.end(JSON.stringify(config));
    return;
  }
  await handler(req, res, {
    public: '..',
    cleanUrls: false
  });
}
