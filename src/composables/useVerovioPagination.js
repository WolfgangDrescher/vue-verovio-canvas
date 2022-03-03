import { ref, readonly, watch } from 'vue';

export function useVerovioPagination(verovioToolkit, renderedScore, verovioIsReady, isLoading) {
    const page = ref(1);

    let renderCurrentPageTimeout = null;

    watch(page, () => {
        renderCurrentPageWithTimeout();
    });

    function nextPage() {
        page.value = validate(page.value + 1);
    }

    function prevPage() {
        page.value = validate(page.value - 1);
    }

    function setPage(value) {
        page.value = validate(value);
    }

    function validate(value) {
        if (!Number.isInteger(Number(value))) {
            throw new Error(`Page must be an integer, "${value}" given.`);
        }
        return Math.min(Math.max(value, 1), verovioToolkit.value.getPageCount());
    }

    function renderCurrentPageWithTimeout() {
        clearTimeout(renderCurrentPageTimeout);
        renderCurrentPageTimeout = setTimeout(() => {
            renderCurrentPage();
        }, 100);
    }

    async function renderCurrentPage() {
        isLoading.value = true;
        await verovioIsReady.promise;
        page.value = validate(page.value);
        setRenderedScoreToPage(page.value);
    }

    function setRenderedScoreToPage(p) {
        renderedScore.value = verovioToolkit.value.renderToSVG(p, {});
        isLoading.value = false;
    }

    return {
        page: readonly(page),
        nextPage,
        prevPage,
        setPage,
        renderCurrentPage,
    };
}
