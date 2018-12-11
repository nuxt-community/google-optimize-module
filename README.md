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

- Support multiple experiments (AB or MVT[Multi-Variant])
- Auto assign experiment/variant to users
- SSR support using cookies
- CSS and state injection
- Automatically revoke expired experiments from testers
- Ability to assign experiments based on context conditions (Route, State, etc)
- Support external experiment source using axios

## Setup

- Add `nuxt-google-optimize` dependency using yarn or npm to your project
```sh
yarn add nuxt-google-optimize
```
OR
```sh
npm install nuxt-google-optimize --save
```

- Add `nuxt-google-optimize` to `modules` section of `nuxt.config.js`

```js
{
  modules: [
    'nuxt-google-optimize',
  ],

  // Optional options
  googleOptimize: {
    // experimentsDir: '~/experiments',
    // maxAge: 60 * 60 * 24 * 7 // 1 Week
    // pushPlugin: true,
    // externalExperimentsSrc: 'https://my.experi.ment/list',
  }
}
```

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

  // Indext of currently active experiment variants
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

### Global style tests

Inject global styles to page body.

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

If you have custom CSS for each test, you can import it inside your experiment's `.js` file.

`experiments/background-color/index.js`:

```js
import './styles.scss'
```

**With Sass:**

```scss
.exp-background-color {
  // ---------------- Variant 1 ----------------
  &-1 {
    background-color: red;
  }
  // ---------------- Variant 2 ----------------
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

## Development

- Clone this repository
- Install dependencies using `yarn install` or `npm install`
- Start development server using `yarn run dev` or `npm run dev`
- Point your browser to `http://localhost:3000`
- You will see a different colour based on the variant set for you
- In order to test your luck, try clearing your cookies and see if the background colour changes or not

## License

[MIT License](./LICENSE) - Alibaba Travels Co

