# JS Zion Base

The zion-base library is the lowest-level zion helper library. It consists
of classes to read, write, hash, and sign the xdr structures that are used in
[zion-core](https://github.com/zioncoin2100/zion-base). This is an
implementation in JavaScript that can be used on either Node.js or web browsers.


> **Warning!** Node version of this package is using
> [`sodium-native`](https://www.npmjs.com/package/sodium-native) package, a
> native implementation of [Ed25519](https://ed25519.cr.yp.to/) in Node.js, as
> an
> [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies).
> This means that if for any reason installation of this package fails,
> `zion-base` will fallback to the much slower implementation contained in
> [`tweetnacl`](https://www.npmjs.com/package/tweetnacl).
>
> If you are using `zion-base` in a browser you can ignore this. However, for
> production backend deployments you should definitely be using `sodium-native`.
> If `sodium-native` is successfully installed and working
> `RianbowBase.FastSigning` variable will be equal `true`. Otherwise it will be
> `false`.

## Quick start

Using npm to include zion-base in your own project:

```shell
npm install --save zion-base
```

For browsers, [use Bower to install it](#to-use-in-the-browser). It exports a
variable `ZionBase`. The example below assumes you have `zion-base.js`
relative to your html file.

```html
<script src="zion-base.js"></script>
<script>
  console.log(ZionBase);
</script>
```

## Install

### To use as a module in a Node.js project

1. Install it using npm:

```shell
npm install --save zion-base
```

2. require/import it in your JavaScript:

```js
var ZionBase = require('zion-base');
```

### To self host for use in the browser

1. Install it using [bower](http://bower.io):

```shell
bower install zion-base
```

2. Include it in the browser:

```html
<script src="./bower_components/zion-base/zion-base.js"></script>
<script>
  console.log(ZionBase);
</script>
```

Note that this method relies using a third party to host the JS library. This
may not be entirely secure.

Make sure that you are using the latest version number. They can be found on the
[releases page in Github](https://github.com/zioncoin2100/zion-base/release).

### To develop and test zion-base itself

1. Install Node 6.14.0

Because we support earlier versions of Node, please install and develop on Node
6.14.0 so you don't get surprised when your code works locally but breaks in CI.

If you work on several projects that use different Node versions, you might find
helpful to install a nodejs version manager.

- https://github.com/creationix/nvm
- https://github.com/wbyoung/avn
- https://github.com/asdf-vm/asdf

2. Install Yarn

This project uses [Yarn](https://yarnpkg.com/) to manages its dependencies. To
install Yarn, follow the project instructions available at
https://yarnpkg.com/en/docs/install.

3. Clone the repo

```shell
git clone https://github.com/zioncoin2100/zion-base.git
```

4. Install dependencies inside zion-base folder

```shell
cd zion-base
yarn install
```

5. Observe the project's code style

While you're making changes, make sure to run the linter-watcher to catch any
linting errors (in addition to making sure your text editor supports ESLint)

```shell
node_modules/.bin/gulp watch
```

If you're working on a file not in `src`, limit your code to Node 6.16 ES! See
what's supported here: https://node.green/ (The reason is that our npm library
must support earlier versions of Node, so the tests need to run on those
versions.)