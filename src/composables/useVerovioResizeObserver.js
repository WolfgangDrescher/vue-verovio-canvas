import { reactive, readonly, onMounted } from 'vue';
import { Deferred } from '../classes/deferred';

export function useVerovioResizeObserver(templateRef) {
    const dimensions = reactive({
        width: null,
        height: null,
    });

    let resizeObserver = null;

    const elemDidMount = new Deferred();

    onMounted(() => {
        initResizeObserver(templateRef.value);
        elemDidMount.resolve(templateRef.value);
    });

    function initResizeObserver(elem) {
        if (elem instanceof HTMLElement) {
            const { width, height } = elem.getBoundingClientRect();
            dimensions.width = Math.floor(width);
            dimensions.height = Math.floor(height);
            resizeObserver = new ResizeObserver(([entry]) => {
                const { width: targetWidth, height: targetHeight } = entry.target.getBoundingClientRect();
                dimensions.width = Math.floor(targetWidth);
                dimensions.height = Math.floor(targetHeight);
            });
        }
    }

    async function observe() {
        const elem = await elemDidMount.promise;
        if (resizeObserver) {
            resizeObserver.observe(elem);
        }
    }

    async function unobserve() {
        const elem = await elemDidMount.promise;
        if (resizeObserver) {
            resizeObserver.unobserve(elem);
        }
    }

    return {
        observe,
        unobserve,
        dimensions: readonly(dimensions),
    };
}
