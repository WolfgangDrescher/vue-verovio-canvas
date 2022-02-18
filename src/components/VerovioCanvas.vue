<script setup>
import { ref } from 'vue';

const props = defineProps({
  width: {
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
