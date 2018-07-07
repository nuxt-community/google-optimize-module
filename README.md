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

- Support multiply experiments (AB or MVT)
- Auto assign experiment/variant to users
- SSR support using cookies
- CSS and State injection
- Automatically revoke expired experiments from testers

## Setup

- Add `nuxt-google-optimize` dependency using yarn or npm to your project
- Add `nuxt-google-optimize` to `modules` section of `nuxt.config.js`

```js
{
  modules: [
    'nuxt-google-optimize',
  ],

  // Optional options
  googleOptimize: {
    experimentsDir: '~/experiments'
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
  sections: 1,

  // [optional] maxAge for a user to test this experiment
  maxAge: 60 * 60 * 24, // 24 hours

  // Implemented variants and their weights
  variants: [
    { weight: 0 }, // <-- This is the default variant
    { weight: 2 },
    { weight: 1 }
  ],
}
```

### `$experiment`

Global object `$experiment` will be universally injected to the context to determine current active experiment.

It has the following keys:

```json
{
  // Index of current active experiment
  "$experimentIndex": 0,

  // Indext of current active experiment variants
  "$variantIndexes": [
    1
  ],

  // Same as $variantIndexes but each item is real variant object
  "$activeVariants": [
    {
      /* */
    }
  ],

  // Classes to be globally injected (see global style tests section)
  "$classes": [
    "exp-background-color-1"
  ],

  // All of the keys of current active experiment are available
  "name": "background-color",
  "experimentID": "testid",
  "sections": 1,
  "maxAge": 60,
  "variants": [
    /* alll variants */
  ]
}
```

**Using inside components:**

```html
<script>
export default {
  methods: {
    foo() {
      // You can use this.$experiment here
    }
  }
}
</script>
```

**Using inside template:**

```html
<div v-if="$experiment.name === 'something'">
  <!-- You can optionally use $experiment.$activeVariants and $experiment.$variantIndexes here -- >
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
                class: this.$experiment.$classes.join(' ')
            }
        }
    },
}
</script>
```

If you have custom CSS for each test, you can import it inside experiment js file.

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
- Start development server using `npm run dev`

## License

[MIT License](./LICENSE) - Alibaba Travels Co

