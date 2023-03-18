# vue-verovio-canvas

A Vue 3 component to display music scores with [Verovio](https://www.verovio.org/index.xhtml).

This component requires the use of an async wrapper around `VerovioToolkit` to
ensure compatibility when using Verovio as a web worker. To set everything up
quickly this package exports helper functions: `createAsyncVerovioToolkit`,
`createWorkerVerovioToolkit` and `createVerovioWorker`.

## Installation

```shell
npm i vue-verovio-canvas verovio
```

## Usage with a web worker

How to use a web worker requires a somewhat advanced setup. And a bundler like
[Vite](https://vitejs.dev/) to get access to the web worker.

### composables/verovio-worker.js:

If you want to use the VerovioCanvas in several places in your project, it is
best to save the verovio worker in a pinia store. Otherwiese, you can import it
directly where you need it.

```js
import { defineStore } from 'pinia';
import createVerovioWorker from '../workers/verovio.js?worker';

export const useVerovioWorker = defineStore('verovio_worker', {
    state: () => {
        return {
            verovioWorker: createVerovioWorker(),
        };
    },
});
```

### workers/verovio.js:

```js
import createVerovioModule from 'verovio/wasm'; // use verovio/wasm-hum for humdrum support
import { VerovioToolkit, enableLog, LOG_OFF as logLevel } from 'verovio/esm';
import { createVerovioWorker } from 'vue-verovio-canvas';

createVerovioWorker(createVerovioModule, VerovioToolkit, enableLog, logLevel);
```

### components/VerovioCanvas.vue:

```vue
<script setup>
import 'vue-verovio-canvas/style.css';
import { VerovioCanvas, createWorkerVerovioToolkit } from 'vue-verovio-canvas';

const { verovioWorker } = useVerovioWorker();
const toolkit = createWorkerVerovioToolkit(verovioWorker);
</script>

<template>
    <VerovioCanvas :toolkit="toolkit" />
</template>
```

### vite.config.js 

To set up the web worker as an ES module, the following Vite configuration is
required:

```js
import { defineConfig } from 'vite';
export default defineConfig({
    //...
    worker: {
        format: 'es',
    },
});
```

Note that worker modules are currently (March 2023) not support in Firefox
(https://caniuse.com/mdn-api_worker_worker_ecmascript_modules). But it looks
like Firefox version 111 will implement this:
https://bugzilla.mozilla.org/show_bug.cgi?id=1247687,
https://github.com/mdn/content/issues/24402,
https://github.com/mdn/content/pull/25030.

If you need to support Firefox it's recommended to setup your own worker file
and not import `import { createVerovioWorker } from 'vue-verovio-canvas';` as
Firefox will throw an error `import declarations may only appear at top level of
a module. Use `importScripts()` instead.

## Basic usage

### components/VerovioCanvas.vue:

```vue
<script setup>
import 'vue-verovio-canvas/style.css';
import { VerovioCanvas, createAsyncVerovioToolkit } from 'vue-verovio-canvas';
import { VerovioToolkit } from 'verovio/esm';
import createVerovioModule from 'verovio/wasm-hum';

const toolkit = ref(null);
createVerovioModule().then(VerovioModule => {
    toolkit.value = createAsyncVerovioToolkit(new VerovioToolkit(VerovioModule));
});
</script>

<template>
    <VerovioCanvas :toolkit="toolkit" />
</template>
```

## Props

| Prop       | Default    | Description                                                                                                                                                                              |
|------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| toolkit    | –          | A `createWorkerVerovioToolkit` or `createAsyncVerovioToolkit` instance                                                                                                                   |
| url        | –          | URL of the score file to display                                                                                                                                                         |
| data       | –          | String of the score to display when url prop is not set                                                                                                                                  |
| scale      | `40`       | Scale of the output in percent (min: 1; max: 1000) and fallback value for `options.scale`                                                                                                |
| viewMode   | `vertical` | `page`, `horizontal`, `vertical`                                                                                                                                                         |
| pageMargin | `0`        | Change all page margins at once and fallback value when top, right, left or bottom page margins are not set                                                                              |
| options    | –          | Pass options to verovio; Use `verovio -h` in the CLI to check all options and values                                                                                                     |
| select     | `{}`       | Select a portion of a score; e.g. `{measureRange: '8-end'}`, `{start: 'measure-L337', end: 'measure-L355'}`                                                                              |
| lazy       | `false`    | Lazy load verovio score when visible on screen                                                                                                                                           |
| unload     | `false`    | Emits unload event when `VerovioCanvas` component is not intersecting with the viewport; loading and unloading the toolkit needs to be handled manually (see `load` and `unload` events) |
| loadDelay  | `0`        | Delay before lazy loading the score to prevent always loading the toolkit with fast scrolling                                                                                            |

## Emitted Events

| Event           | Description                                                                       |
|-----------------|-----------------------------------------------------------------------------------|
| `moduleIsReady` | Emitted when the emscripten module is ready                                       |
| `scoreIsReady`  | Emitted when verovio toolkit method `loadData` did load the score                 |
| `load`          | Emitted when `lazy` prop is `true` and component is intersecting with viewport    |
| `unload`        | Emitted when `lazy` prop is `true` and component stops intersecting with viewport |

## Info

If you want to display the whole score at once with the available width of the
parent container element and the hight of the score adjusted to the required
height use the `vertical` view mode:

```vue
<VerovioCanvas url="/file.mei" view-mode="vertical" />
```

Or use the `horizontal` view mode to make the score scrollable on the x-axis:

```vue
<VerovioCanvas url="/file.mei" view-mode="horizontal" />
```

If you want to use pagination wrap the `<VerovioCanvas />` component in a
container element with specific dimensions:

```vue
<div style="width: 640px; height: 360px;">
    <VerovioCanvas url="/file.mei" view-mode="page" />
</div>
```

You can also use the wrapper element with specific dimensions if you want to use
`vertical` view mode but with scrollable on the y-axis.

## Exposed variables and methods

The `<VerovioCanvas>` component exposes the following options

```js
defineExpose({
    isLoading,
    dimensions,
    page,
    callVerovioMethod,
    nextPage,
    prevPage,
    setPage,
});
```

These exposed variables and methods can be used to interact with the
`VerovioCanvas` component:

```vue
<script setup>
import { ref, computed } from 'vue';

const scale = ref(30);
const score = ref(null);
const viewMode = ref('page');

function next() {
    score.value.nextPage();
}

function prev() {
    score.value.prevPage();
}

const page = computed({
    get() {
        return score.value && score.value.page;
    },
    set(value) {
        score.value.setPage(value);
    },
});
</script>

<template>
    <input type="range" min="1" max="100" v-model.number="scale" />
    <select v-model="viewMode">
        <option value="page">page</option>
        <option value="horizontal">horizontal</option>
        <option value="vertical">vertical</option>
    </select>
    <button @click="prev">prev page</button>
    <input type="text" v-model.lazy="page" />
    <button @click="next">next page</button>
    <div style="width: 640px; height: 360px">
        <VerovioCanvas ref="score" url="https://raw.githubusercontent.com/WolfgangDrescher/lassus-geistliche-psalmen/master/kern/01-beatus-vir.krn" :scale="scale" :view-mode="viewMode" />
    </div>
</template>
```

## Custom Verovio method calls

Use `callVerovioMethod` to call other methods on the Verovio toolkit instance.
`callVerovioMethod` is async to ensure that the Verovio runtime is initialized
and the score if already loaded.

```vue
<script setup>
import { ref, onMounted } from 'vue';

const score = ref(null);
onMounted(() => {
    score.value.callVerovioMethod('renderToMIDI', {
        midiTempoAdjustment: 1.25,
    }).then(midiBase64 => {
        console.log(midiBase64);
    });
});
</script>

<template>
    <VerovioCanvas ref="score" url="https://raw.githubusercontent.com/WolfgangDrescher/lassus-geistliche-psalmen/master/kern/01-beatus-vir.krn" />
</template>

```

## Manually load and unload toolkit

When you have a lot of scores per page that need to be rendered with verovio it
might be useful to not only lazy load the component, but also only create the
toolkit when the component is actually needed and within the viewport and detroy
the toolkit when it is outside of the viewport. Use in combination with `lazy`
and `lazyDelay` props.

### components/VerovioCanvas.vue:

```vue
<script setup>
import { ref } from 'vue';
import 'vue-verovio-canvas/style.css';
import { VerovioCanvas, createWorkerVerovioToolkit } from 'vue-verovio-canvas';

const toolkit = ref();
const { verovioWorker } = useVerovioWorker();

function loadToolkit() {
    toolkit.value = createWorkerVerovioToolkit(verovioWorker);
}

function unloadToolkit() {
    if (toolkit.value) {
        toolkit.value.removeToolkit();
        toolkit.value = null;
    }
}
</script>

<template>
    <VerovioCanvas :toolkit="toolkit" lazy unload :load-delay="1000" @load="loadToolkit" @unload="unloadToolkit" />
</template>
```

## Avoid use with SSR

Errors may occur when the component is loaded with server side rendering. Try to
load the `VerovioCanvas` component in wrapped in `ClientOnly`. If not available
you can try something like this:

```vue
<script setup>
import { defineAsyncComponent } from 'vue';
import 'vue-verovio-canvas/dist/style.css';
const AsyncVerovioCanvas = defineAsyncComponent(() => import('vue-verovio-canvas'));
</script>

<template>
    <component :is="AsyncVerovioCanvas"></component>
</template>
```
