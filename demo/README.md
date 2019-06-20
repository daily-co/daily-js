# daily-js demos

Demos and sample code. Links below to both the code for each demo and to a live version you can run without checking out this repo locally.

When running the live demos, it’s useful to have your js console open.

Jump to a demo:

1) Super-simple Demo: a simple iframe demo
2) Standard/Custom UI Demo: toggle between our default UI and custom UI
3) Custom CSS Grid Demo: a customized, colorful demo that uses CSS grid
4) Remote monitoring use case: One-way video, and managing bandwidth use dynamically

---

## 1. Super-simple Demo

![Demo example](https://raw.githubusercontent.com/daily-co/daily-js/demo-readme-images/demo/image-demo-simple.png)

This demo showcases is very simple. A video call is created in an iframe and rendered in our default UI. All embedded API video calls come with our default interface and UX controls.

[View Code](https://github.com/daily-co/daily-js/blob/master/demo/simple.html) | [Open Demo](https://daily-co.github.io/daily-js/demo/simple.html)

## 2. Standard/Custom UI Demo

![Demo example](https://raw.githubusercontent.com/daily-co/daily-js/demo-readme-images/demo/image-demo-basics.png)

Our Standard-Custom demo highlights the UI elements that you have control over. Try joining the meeting and toggling your camera or starting a screen share using the buttons above the demo. You can add your own custom controls to better integrate the video call into your product.

[View Code](https://github.com/daily-co/daily-js/blob/master/demo/basics.html) | [Open Demo](https://daily-co.github.io/daily-js/demo/basics.html)

## 3. Mobile-sized screen demo

A demo of laying out small call "bubbles" for a mobile device UI. Also
shows responding to click/touch events. Load the page, click "Create
room" then copy the URL and load the page in another tab or on another
device.

[View HTML Code](https://github.com/daily-co/daily-js/blob/master/demo/mobile-touches.html) | [View CSS Code](https://github.com/daily-co/daily-js/blob/master/demo/mobile-touches.css) | [Open Demo](https://daily-co.github.io/daily-js/demo/mobile-touches.html)

## 4. Custom CSS Grid Demo

![Demo example](https://raw.githubusercontent.com/daily-co/daily-js/demo-readme-images/demo/image-demo-css-grid.png)

A fully customized UI that uses CSS grid to layout the video call. You can style and adjust your API video call to better work for your project. This demo was built using CSS grid and is responsive as well. Try resizing your browser once you open the demo.

[View HTML Code](https://github.com/daily-co/daily-js/blob/master/demo/demo-css-grid.html) | [View CSS Code](https://github.com/daily-co/daily-js/blob/master/demo/demo-css-grid.css) | [Open Demo](https://daily-co.github.io/daily-js/demo/demo-css-grid.html)

## 5. Remote Monitoring Demo

Remote monitoring use case. One-way video, and managing bandwidth use dynamically.

[View HTML Human Code](https://github.com/daily-co/daily-js/blob/master/demo/remote-monitoring-human.html) | [View HTML Device Code](https://github.com/daily-co/daily-js/blob/master/demo/remote-monitoring-device.html) | [Open Demo](https://daily-co.github.io/daily-js/demo/remote-monitoring-human.html)

---

## For developers...

To modify these demos and develop locally, you can execute these
commands from the top-level directory in this repo:

```
npm install
npm run build-dev
npm run demo
```

Unless there is a port conflict, the demo web server will start on port 3000.

  http://localhost:3000/demo/
