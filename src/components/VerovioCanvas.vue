<script setup>
import { ref, toRefs } from 'vue';
import { useVerovio } from '../composables/useVerovio';
import Loading from './Loading.vue';

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
    viewMode: {
        type: String,
        required: false,
        default: 'vertical',
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
    header: {
        type: String,
        required: false,
        default: 'none',
    },
    footer: {
        type: String,
        required: false,
        default: 'none',
    },
});

const verovioCanvas = ref(null);

const {
    renderedScore,
    loadingMessage,
    dimensions,
    page,
    nextPage,
    prevPage,
    setPage,
} = useVerovio(toRefs(props), verovioCanvas);

defineExpose({
    dimensions,
    page,
    nextPage,
    prevPage,
    setPage,
});

</script>

<template>
    <div class="verovio-container">
        <div class="verovio-canvas" :class="`verovio-canvas-${viewMode}`" ref="verovioCanvas">
            <div v-if="renderedScore === null" class="verovio-canvas-loading">
                <Loading :message="loadingMessage" />
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
