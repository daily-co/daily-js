# targetnotes

Our goal is to run under

- Node with `require`
- Babel with `import`
- experimental node `import` support
- `<script>` tag as `window.DailyIframe`
- `<script type="module">` tag as an ES6 module

# tests for module format and loading

## basic-script.html

Loading our library via a traditional `<script>` tag. The
`DailyIframe` class is accessible via the `window` variable. To test,
load `test/basic-script.html` in a web browser.

## basic-require.js

Standard node commonjs module `require`.

    node test/basic-require.js

## babel-import.js

Babel transform of `import`. This tests a common webpack bundling scenario.

    babel-node --plugins transform-es2015-modules-commonjs test/basic-import.js

## node-import.mjs

Experimental node `import` module loader. Needs an `.mjs` file extension.

    node --experimental-modules test/node-import.mjs

## module-script.html

ES6 module import in the browser. Experimental, as our build for this
is definitely not optimized. We can't load a script of `type=module`
from a `file` URL, so start a local server with `npx serve`, then load
`test/module-script.html`.
