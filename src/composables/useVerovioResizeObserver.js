import { reactive, readonly, onMounted } from 'vue';

export function useVerovioResizeObserver(templateRef) {
    const dimensions = reactive({
        width: null,
        height: null,
    });

    let resizeObserver = null;

    onMounted(() => {
        initResizeObserver(templateRef.value);
    });

    function initResizeObserver(elem) {
        if (elem) {
            dimensions.width = elem.clientWidth;
            dimensions.height = elem.clientHeight;
            resizeObserver = new ResizeObserver(([entry]) => {
                dimensions.width = entry.target.clientWidth;
                dimensions.height = entry.target.clientHeight;
            });
            resizeObserver.observe(elem);
        }
    }

    return {
        dimensions: readonly(dimensions),
    };
}
