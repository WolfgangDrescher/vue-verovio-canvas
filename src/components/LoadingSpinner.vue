<script setup>
defineProps({
    color: {
        type: String,
        default: '#000',
    },
    size: {
        type: Number,
        default: 64,
    },
});
</script>

<template>
    <svg
        class="loading-spinner"
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        :height="size"
        :stroke="color"
    >
        <g fill="none" fill-rule="evenodd">
            <g transform="translate(1 1)" stroke-width="2">
                <circle stroke-opacity=".25" cx="18" cy="18" r="18" />
                <path d="M36 18c0-9.94-8.06-18-18-18"></path>
            </g>
        </g>
    </svg>
</template>

<style scoped>
.loading-spinner {
    animation: spin-animation 0.8s infinite linear;
}

@keyframes spin-animation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
