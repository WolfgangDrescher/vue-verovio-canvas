<script setup>
import { ref, toRefs } from 'vue';
import { useVerovio } from '../composables/useVerovio';

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
        default: 'page',
        validator: value => {
            return ['page', 'horizontal', 'vertical'].includes(value);
        },
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

const { renderedScore, loadingMessage } = useVerovio(toRefs(props));

const style = ref({
    width: props.width === 0 ? '100%'  : `${parseInt(props.width, 10)}px`,
    backgroundColor: 'grey',
});

</script>

<template>
    <div class="verovio-canvas" :style="style">
        <div v-if="renderedScore === null" class="verovio-canvas-loading">
            {{ loadingMessage }}
        </div>
        <div v-else class="verovio-canvas-stage" ref="verovioCanvasStage" v-html="renderedScore"></div>
    </div>
</template>
