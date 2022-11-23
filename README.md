# vue-verovio-canvas

A Vue 3 component to display music scores with [Verovio](https://www.verovio.org/index.xhtml).

## Props

| Prop       | Default    | Description                                                                                                 |
|------------|------------|-------------------------------------------------------------------------------------------------------------|
| url        | –          | URL of the score file to display                                                                            |
| data       | –          | String of the score to display when url prop is not set                                                     |
| scale      | 40         | Scale of the output in percent (min: 1; max: 1000) and fallback value for `options.scale`                   |
| viewMode   | `vertical` | `page`, `horizontal`, `vertical`                                                                            |
| pageMargin | 0          | Change all page margins at once and fallback value when top, right, left or bottom page margins are not set |
| options    | –          | Pass options to verovio; Use `verovio -h` in the CLI to check all options and values                        |
| select     | {}         | Select a portion of a score; e.g. `{measureRange: '8-end'}`, `{start: 'measure-L337', end: 'measure-L355'}` |
| lazy       | false      | Lazy load verovio score when visible on screen                                                              |

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

These exposed variables and methods can be used to interact with the `VerovioCanvas` component:

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

Use `callVerovioMethod` to call other methods on the Verovio toolkit instance. `callVerovioMethod` is async
to ensure that the Verovio runtime is initialized and the score if already loaded.

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
    <component :is="AsyncVerovioCanvas" v-bind="{...$attrs, ...$props}"></component>
</template>
```
