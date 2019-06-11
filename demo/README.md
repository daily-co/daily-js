# daily-js demos

Demos and sample code. Links below to both the code for each demo and to a live version you can run without checking out this repo locally.

When running the live demos, it’s useful to have your js console open.

Jump to a demo:

1) Super-simple Demo: a simple iframe demo
2) Standard/Custom UI Demo: toggle between our default UI and custom UI
3) Custom CSS Grid Demo: a customized, colorful demo that uses CSS grid
4) Remote monitoring use case: One-way video, and managing bandwidth use dynamically

---

### 1. Super-simple Demo

![Demo example](https://raw.githubusercontent.com/daily-co/daily-js/demo-readme-images/demo/image-demo-simple.png)

<a href="https://github.com/daily-co/daily-js/blob/master/demo/simple.html">View code</a>

<a href="https://daily-co.github.io/daily-js/demo/simple.html">Open demo</a>


### Switch between the standard in-call user interface and a custom UI

![Demo example](https://raw.githubusercontent.com/daily-co/daily-js/demo-readme-images/demo/image-demo-basics.png)

Code

  https://github.com/daily-co/daily-js/blob/master/demo/basics.html

Live

  https://daily-co.github.io/daily-js/demo/basics.html

### A fancy, colorful, css-grid in-call user interface

![Demo example](https://raw.githubusercontent.com/daily-co/daily-js/demo-readme-images/demo/image-demo-css-grid.png)

Code

  https://github.com/daily-co/daily-js/blob/master/demo/demo-css-grid.html <br />
  https://github.com/daily-co/daily-js/blob/master/demo/demo-css-grid.css

Live

  https://daily-co.github.io/daily-js/demo/demo-css-grid.html

### Remote monitoring use case. One-way video, and managing bandwidth use dynamically

Code

  https://github.com/daily-co/daily-js/blob/master/demo/remote-monitoring-human.html <br />
  https://github.com/daily-co/daily-js/blob/master/demo/remote-monitoring-device.html

Live

  https://daily-co.github.io/daily-js/demo/remote-monitoring-human.html



## For developers ...

To modify these demos and develop locally, you can execute these
commands from the top-level directory in this repo:

```
npm install
npm run build-dev
npm run demo
```

Unless there is a port conflict, the demo web server will start on port 3000.

  http://localhost:3000/demo/
