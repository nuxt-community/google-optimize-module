# nuxt-google-optimize

[![npm (scoped with tag)](https://img.shields.io/npm/v/nuxt-google-optimize/latest.svg?style=flat-square)](https://npmjs.com/package/nuxt-google-optimize)
[![npm](https://img.shields.io/npm/dt/nuxt-google-optimize.svg?style=flat-square)](https://npmjs.com/package/nuxt-google-optimize)
[![CircleCI](https://img.shields.io/circleci/project/github/alibaba-aero/nuxt-google-optimize.svg?style=flat-square)](https://circleci.com/gh/alibaba-aero/nuxt-google-optimize)
[![Codecov](https://img.shields.io/codecov/c/github/alibaba-aero/nuxt-google-optimize.svg?style=flat-square)](https://codecov.io/gh/alibaba-aero/nuxt-google-optimize)
[![Dependencies](https://david-dm.org/alibaba-aero/nuxt-google-optimize/status.svg?style=flat-square)](https://david-dm.org/alibaba-aero/nuxt-google-optimize)
[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com)

> SSR friendly Google Optimize module for Nuxt.js

[📖 **Release Notes**](./CHANGELOG.md)

## Features

- Supports multiple experiments (AB or MVT[Multi-Variant])
- Auto assign experiment/variant to users
- SSR support using cookies
- CSS and state injection
- Automatically revoke expired experiments and assign new ones
- Ability to assign experiments based on context conditions (Route, State, etc)
- Works well with Google Tag Manager and Google Analytics

## Setup

Add `nuxt-google-optimize` dependency using yarn or npm to your project.
```sh
# using yarn
yarn add nuxt-google-optimize
# using npm
npm install nuxt-google-optimize --save
```

Add `nuxt-google-optimize` to `modules` section of `nuxt.config.js`

```js
{
  modules: [
    'nuxt-google-optimize',
  ],

  // Options
  googleOptimize: {
    // experimentsDir: '~/experiments',
    // maxAge: 604800 // 1 week (in seconds)
    // pushPlugin: true,
    // excludeBots: true,
    // botExpression: /(bot|spider|crawler)/i
    // emitOnLoad: true,
  }
}
```

## Options
- **experimentsDir**: The directory where your experiments are stored.  It should have an index.js file containing an array of experiments. 

- **maxAge**: The maximum time to keep a user assigned to an experiment. (in seconds)

- **pushPlugin**: Pushes this plugin to the bottom of the plugin list.  This allows you to setup other plugins (such as Google Analytics / Google Tag Manager) before this one initializes.
- **excludeBots**: Exclude robot user agents from experiment assignment.
- **botExpression**: A regular expression to detect robot user agents when excludeRobots is true.
- **emitOnLoad**: Report experiment assignment to Google Analytics when the plugin is loaded.  If your experiment isn't on every page, set this to false and report the experiment to Google Analytics when the user sees it.  If not, your Google Optimize data will be diluted with users who never saw your experiment!

## Usage

Create `experiments` directory inside your project.

Create `experiments/index.js` to define all available experiments:

```js
import backgroundColor from './background-color'

export default [
  backgroundColor
]
```

### Creating an experiment

Each experiment should export an object to define itself.

`experiments/background-color/index.js`:

```js
export default {
  // A helper exp-{name}-{var} class will be added to the root element
  name: 'background-color',

  // Google optimize experiment id
  experimentID: '....',

  // [optional] specify number of sections for MVT experiments
  // sections: 1,

  // [optional] maxAge for a user to test this experiment
  // maxAge: 60 * 60 * 24, // 24 hours,

  // [optional] Enable/Set experiment on certain conditions
  // isEligible: ({ route }) => route.path !== '/foo'

  // Implemented variants and their weights
  variants: [
    { weight: 0 }, // <-- This is the default variant
    { weight: 2 },
    { weight: 1 }
  ],
}
```

### `$exp`

Global object `$exp` will be universally injected in the app context to determine the currently active experiment.

It has the following keys:

```json6
{
  // Index of currently active experiment
  "$experimentIndex": 0,

  // Index of currently active experiment variants
  "$variantIndexes": [
    1
  ],

  // Same as $variantIndexes but each item is the real variant object
  "$activeVariants": [
    {
      /* */
    }
  ],

  // Classes to be globally injected (see global style tests section)
  "$classes": [
    "exp-background-color-1" // exp-{experiment-name}-{variant-id}
  ],

  // All of the keys of currently active experiment are available
  "name": "background-color", 
  "experimentID": "testid",
  "sections": 1,
  "maxAge": 60,
  "token": "testid.0", // the google optimize token
  "variants": [
    /* all variants */
  ]
}
```

**Using inside components:**

```html
<script>
export default {
  methods: {
    foo() {
      // You can use this.$exp here
    }
  }
}
</script>
```

**Using inside templates:**

```html
<div v-if="$exp.name === 'something'">
  <!-- You can optionally use $exp.$activeVariants and $exp.$variantIndexes here -- >
  ...
</div>
<div v-else>
  ...
</div>
```

### Working with experiment styles
If you have custom CSS for each test, you can import it inside your experiment's `.js` file.

`experiments/background-color/index.js`:

```js
import './styles.scss'
```

**With Sass:**

```scss
.exp-background-color {
  // Variant 1
  &-1 {
    background-color: red;
  }
  // Variant 2
  &-2 {
    background-color: blue;
  }
}
```

**With CSS:**

```css
/* Variant 1 */
.exp-background-color-1 {
  background-color: red;
}

/* Variant 2 */
.exp-background-color-2 {
  background-color: blue;
}
```


Inject global styles into your layout.

`layouts/default.vue`:

```vue
<template>
  <nuxt/>
</template>

<script>
export default {
      head () {
        return {
            bodyAttrs: {
                class: this.$exp.$classes.join(' ')
            }
        }
    },
}
</script>
```

This would render:

```html
<body class="exp-background-color-2">
```

## Integrating with Google Tag Manager
There are many ways to integrate Google Optimize with GTM.  Usually you have Google Analytics setup in GTM and you push the experiment token into GTM.

### Method 1 - Push Token To the Data Layer

This method pushes the exp value directly into the dataLayer to be used within a GTM tag.

- In GTM, create a new variable called `exp`.

- Next, create a new variable of type `Google Analytics Settings`.

- Under `Fields to Set`, add a field with the name `exp` and value `{{ exp }}`

- In your code, pass the token value to GTM
```js
// directly
dataLayer.push({ exp: window.$nuxt.$exp.token })

// or using the Nuxt GTM module
this.$gtm.push({ exp: this.$exp.token })
```

Now when you trigger GA pageviews or events the exp value will be attached to the user.

### Method 2 - Call Google Analytics Yourself From GTM

- Create a tag in GTM of type Html
- Use whatever trigger you like
- Fill the tag with the following content
```js
<script>window.ga('set', 'exp', window.$nuxt.$exp.token)</script>
```

This will call the Google Analytics lib directly and report the experiment assignment for the current user whenever you activate the trigger.


## emitOnLoad Caution

By default emitOnLoad is true (for backward compatability).  This means that when a user hits your site this plugin will tell Google Analytics (Optimize) that the user is in the experiment. 

If your experiments aren't on every page, you'll want to turn this off and report the experiment yourself.  If you don't, then your Google Optimize reports will contain a bunch of users who likely never saw your experiment.  In other words **GARBAGE DATA**.

To report users to Optimize yourself, use the token property.

```js
mounted(){
  // call Google Analytics directly and set the experiment for the user
  window.ga('set', 'exp', this.$exp.token)
}

```


## License

[MIT License](./LICENSE) - Alibaba Travels Co

