<script setup>
import { ref, toRefs } from 'vue';
import { useVerovio } from '../composables/useVerovio';

const props = defineProps({
    url: {
        type: String,
        required: true,
    },
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

const verovioCanvas = ref(null);

const { renderedScore, loadingMessage } = useVerovio(toRefs(props), verovioCanvas);

</script>

<template>
    {{ dimensions }}
    <div class="verovio-container">
        <div class="verovio-canvas" :class="`verovio-canvas-${viewMode}`" ref="verovioCanvas">
            <div v-if="renderedScore === null" class="verovio-canvas-loading">
                {{ loadingMessage }}
            </div>
            <div v-else class="verovio-canvas-stage" v-html="renderedScore"></div>
        </div>
    </div>
</template>

<style scoped>
.verovio-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: gray;
}
.verovio-canvas {
    position: relative;
    min-width: 100%;
    min-height: 100%;
}

.verovio-canvas-vertical {
    overflow-x: auto;
}

.verovio-canvas-horizontal {
    overflow-y: auto;
}

.verovio-canvas-stage {
    display: flex;
    justify-content: center;
    flex-direction: column;
}
</style>
