<script setup>
import { VerovioCanvas, createWorkerVerovioToolkit } from './index.js';

const props = defineProps({
    worker: Object,
});

const toolkit = createWorkerVerovioToolkit(props.worker);
</script>

<template>
    <VerovioCanvas :toolkit="toolkit" />
</template>
