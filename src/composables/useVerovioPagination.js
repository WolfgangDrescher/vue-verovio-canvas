import { ref, readonly, watch } from 'vue';

export function useVerovioPagination(verovioToolkit, renderedScore, verovioIsReady) {

    const page = ref(1);

    let renderCurrentPageTimeout = null;

    watch(page, () => {
        renderCurrentPage();
    });

    function nextPage() {
        page.value = validate(page.value + 1);
    };

    function prevPage() {
        page.value = validate(page.value - 1);
    };

    function setPage(value) {
        page.value = validate(value);
    }

    function validate(value) {
        if (!Number.isInteger(Number(value))) {
            throw new Error(`Page must be an integer, "${value}" given.`);
        }
        return Math.min(Math.max(value, 1), verovioToolkit.value.getPageCount());
    };

    function renderCurrentPage() {
        if (verovioIsReady.value) {
            clearTimeout(renderCurrentPageTimeout);
            // isLoading.value = true;
            renderCurrentPageTimeout = setTimeout(() => {
                setRenderedScoreToPage(page.value);
            }, 100);
        }
    };

    function setRenderedScoreToPage(page) {
        renderedScore.value = verovioToolkit.value.renderToSVG(page, {});
    };

    return {
        page: readonly(page),
        nextPage,
        prevPage,
        setPage,
        setRenderedScoreToPage,
    };
};
