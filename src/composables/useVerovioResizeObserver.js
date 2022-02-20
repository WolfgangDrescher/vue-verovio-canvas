import { reactive, readonly, watch } from 'vue';

export function useVerovioResizeObserver(templateRef) {

    const dimensions = reactive({
        width: null,
        height: null,
    });

    let resizeObserver = null;

    watch(templateRef, elem => {
        initResizeObserver(elem);
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
