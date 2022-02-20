import { ref, readonly, onMounted, watch } from 'vue';
import verovio from 'verovio';

export function useVerovio(scoreData, options) {

    const {
        scale,
        width,
        height,
        viewMode,
        pageMargin,
        pageMarginTop,
        pageMarginRight,
        pageMarginBottom,
        pageMarginLeft,
    } = options;

    const page = ref(1);
    const renderedScore = ref(null);
    let verovioToolkit = null;
    let verovioIsReady = false;
    let redoLayoutTimeout = null;
    let renderCurrentPageTimeout = null;

    onMounted(() => {
        verovio.module.onRuntimeInitialized = async () => {
            verovioToolkit = new verovio.toolkit();
            setVerovioOptions();
            loadScoreFile();
        };
    });

    watch(width, () => {
        redoLayout();
    });

    watch(height, () => {
        redoLayout();
    });

    watch(scale, () => {
        redoLayout();
    });

    watch(page, () => {
        renderCurrentPage();
    });

    watch(viewMode, () => {
        redoLayout();
    });

    function setVerovioOptions() {
        verovioToolkit.setOptions(generateVerovioOptions());
    };

    function generateVerovioOptions() {
        const options = {
            scale: scale.value,
            header: 'none',
            footer: 'none',
            pageWidth: Math.min(Math.max(width.value * (100 / scale.value), 100), 60000),
            pageHeight: Math.min(Math.max(height.value * (100 / scale.value), 100), 60000),
            pageMarginTop: (pageMarginTop.value ? pageMarginTop.value : pageMargin.value) * (100 / scale.value),
            pageMarginRight: (pageMarginRight.value ? pageMarginRight.value : pageMargin.value) * (100 / scale.value),
            pageMarginBottom: (pageMarginBottom.value ? pageMarginBottom.value : pageMargin.value) * (100 / scale.value),
            pageMarginLeft: (pageMarginLeft.value ? pageMarginLeft.value : pageMargin.value) * (100 / scale.value),
        };
        if (viewMode.value === 'vertical') {
            options.adjustPageHeight = true;
            options.pageHeight = 60000;
        } else if (viewMode.value === 'horizontal') {
            options.adjustPageHeight = true;
            options.breaks = 'none';
            options.pageWidth = 60000;
        }
        return options;
    };

    function redoLayout() {
        if (verovioIsReady) {
            clearTimeout(redoLayoutTimeout);
            redoLayoutTimeout = setTimeout(() => {
                setVerovioOptions();
                verovioToolkit.redoLayout();
                setRenderedScoreToPage(page.value);
            }, 100);
        }
    };

    function renderCurrentPage() {
        if (verovioIsReady) {
            clearTimeout(renderCurrentPageTimeout);
            renderCurrentPageTimeout = setTimeout(() => {
                setRenderedScoreToPage(page.value);
            }, 100);
        }
    };

    function setRenderedScoreToPage(page) {
        renderedScore.value = verovioToolkit.renderToSVG(page, {});
    };

    function loadScoreFile() {
        verovioToolkit.loadData(scoreData);
        verovioIsReady = true;
        setRenderedScoreToPage(page.value);
    };

    return {
        renderedScore: readonly(renderedScore),
        page: readonly(page),
    };
};
