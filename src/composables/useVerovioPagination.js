import { ref, readonly, watch } from 'vue';

export function useVerovioPagination(verovioToolkit, renderedScore, verovioIsReady, isLoading) {
    const page = ref(1);

    let renderCurrentPageTimeout = null;

    watch(page, () => {
        renderCurrentPageWithTimeout();
    });

    async function nextPage() {
        page.value = await validate(page.value + 1);
    }

    async function prevPage() {
        page.value = await validate(page.value - 1);
    }

    async function setPage(value) {
        page.value = await validate(value);
    }

    async function validate(value) {
        if (!Number.isInteger(Number(value))) {
            throw new Error(`Page must be an integer, "${value}" given.`);
        }
        return Math.min(Math.max(value, 1), await verovioToolkit.getPageCount());
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
        page.value = await validate(page.value);
        setRenderedScoreToPage(page.value);
    }

    async function setRenderedScoreToPage(p) {
        renderedScore.value = await verovioToolkit.renderToSVG(p, {});
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
