<script setup>
import { ref } from 'vue';
import { VerovioCanvas, createWorkerVerovioToolkit } from './index.js';

const props = defineProps({
    worker: Object,
});

const toolkit = ref();

function loadToolkit() {
    toolkit.value = createWorkerVerovioToolkit(props.worker);
}

function unloadToolkit() {
    if (toolkit.value) {
        toolkit.value.removeToolkit();
        toolkit.value = null;
    }
}
</script>

<template>
    <VerovioCanvas :toolkit="toolkit" @load="loadToolkit" @unload="unloadToolkit" />
</template>
