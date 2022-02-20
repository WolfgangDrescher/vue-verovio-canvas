<script setup>
import { ref } from 'vue';

const props = defineProps({
    scale: {
        type: Number,
        required: false,
        default: 40,
        validator: value => {
            return value >= 1 && value <= 1000;
        },
    },
    width: {
        type: Number,
        required: false,
        default: 640,
    },
    height: {
        type: Number,
        required: false,
        default: 360,
    },
    viewMode: {
        type: String,
        required: false,
        default: 'page', // page, horizontal, vertical
    },
    pageMargin: {
        type: Number,
        required: false,
        default: 0,
    },
    pageMarginTop: {
        type: Number,
        required: false,
        default: 0,
    },
    pageMarginRight: {
        type: Number,
        required: false,
        default: 0,
    },
    pageMarginBottom: {
        type: Number,
        required: false,
        default: 0,
    },
    pageMarginLeft: {
        type: Number,
        required: false,
        default: 0,
    },
});

const style = ref({
    width: props.width === 0 ? '100%'  : `${parseInt(props.width, 10)}px`,
    backgroundColor: 'grey',
});

</script>

<template>
  <div class="verovio-canvas" :style="style">
    <pre>{{ style }}</pre>
  </div>
</template>
