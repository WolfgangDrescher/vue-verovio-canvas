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
        validator: (value) => {
            return value >= 1 && value <= 1000;
        },
    },
    viewMode: {
        type: String,
        required: false,
        default: 'vertical',
        validator: (value) => {
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
    spacingSystem: {
        type: Number,
        required: false,
        default: 12,
    },
});

const verovioCanvas = ref(null);

const { isLoading, isError, renderedScore, message, dimensions, page, nextPage, prevPage, setPage } = useVerovio(
    toRefs(props),
    verovioCanvas
);

defineExpose({
    isLoading,
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
            <div
                v-if="renderedScore === null"
                class="verovio-canvas-status"
                :class="{ 'verovio-canvas-status-error': isError }"
            >
                <Loading :message="message" v-if="!isError" />
                <div v-else class="verovio-canvas-status-error-message" v-text="message"></div>
            </div>
            <div v-else class="verovio-canvas-stage" v-html="renderedScore"></div>
        </div>
    </div>
</template>

<style scoped>
*,
*:before,
*:after {
    box-sizing: border-box;
}

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

.verovio-canvas-status {
    width: 100%;
    height: 100%;
    background-color: rgba(243, 244, 246, 0.8);
    border-radius: 3px;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.verovio-canvas-status-error {
    background-color: rgba(254, 226, 226, 0.8);
    border-color: #fecaca;
}
</style>
