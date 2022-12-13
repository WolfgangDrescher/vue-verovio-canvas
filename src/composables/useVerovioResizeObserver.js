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
            dimensions.width = elem.clientWidth;
            dimensions.height = elem.clientHeight;
            resizeObserver = new ResizeObserver(([entry]) => {
                dimensions.width = entry.target.clientWidth;
                dimensions.height = entry.target.clientHeight;
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
