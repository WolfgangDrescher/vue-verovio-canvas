<script setup>
import LoadingSpinner from './LoadingSpinner.vue';

defineProps({
    message: {
        type: String,
        default: 'Loading…',
    },
    showMessage: {
        type: Boolean,
        default: true,
    },
    spinnerSize: {
        type: Number,
        default: 64,
    },
    spinnerColor: {
        type: String,
        default: '#000',
    },
});
</script>

<template>
    <div class="loading-component">
        <div class="loading-component-inner">
            <div class="loading-component-spinner">
                <LoadingSpinner :size="spinnerSize" :stroke="spinnerColor" />
            </div>
            <div v-if="showMessage" class="loading-component-message">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.loading-component {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-component-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-component-message {
    text-align: center;
    margin-top: 0.5rem;
}
</style>
