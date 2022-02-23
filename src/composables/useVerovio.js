import { ref, readonly, watch } from 'vue';
import verovio from 'verovio-humdrum';
import { useVerovioPagination } from './useVerovioPagination';
import { useVerovioResizeObserver } from './useVerovioResizeObserver';

let verovioRuntimeInitialized = false;

export function useVerovio(options, templateRef) {
    const {
        url,
        data,
        scale,
        viewMode,
        pageMargin,
        pageMarginTop,
        pageMarginRight,
        pageMarginBottom,
        pageMarginLeft,
        header,
        footer,
        spacingSystem,
    } = options;

    const renderedScore = ref(null);
    const isLoading = ref(true);
    const isError = ref(false);
    const message = ref(null);
    const verovioToolkit = ref(null);
    const verovioIsReady = ref(false);
    let redoLayoutTimeout = null;
    let verovioRuntimeInterval = null;

    const { page, nextPage, prevPage, setPage, setRenderedScoreToPage } = useVerovioPagination(
        verovioToolkit,
        renderedScore,
        verovioIsReady,
        isLoading
    );
    const { dimensions } = useVerovioResizeObserver(templateRef);

    message.value = 'Initializing Verovio WebAssembly runtime';

    verovio.module.onRuntimeInitialized = onRuntimeInitializedEvent;

    verovioRuntimeInterval = setInterval(() => {
        if (verovioRuntimeInitialized) {
            clearInterval(verovioRuntimeInterval);
            onRuntimeInitializedEvent();
        }
    }, 50);

    function onRuntimeInitializedEvent() {
        verovioRuntimeInitialized = true;
        verovioToolkit.value = new verovio.toolkit();
        // emit('verovioToolkitRuntimeInitialized');
        setVerovioOptions();
        loadScoreFile();
    }

    watch([scale, dimensions, viewMode], () => {
        redoLayout();
    });

    watch(data, () => {
        loadScoreFile();
    });

    function setVerovioOptions() {
        verovioToolkit.value.setOptions(generateVerovioOptions());
    }

    function generateVerovioOptions() {
        const options = {
            spacingSystem: spacingSystem.value,
            scale: scale.value,
            header: header.value,
            footer: footer.value,
            pageWidth: Math.min(Math.max(dimensions.width * (100 / scale.value), 100), 60000),
            pageHeight: Math.min(Math.max(dimensions.height * (100 / scale.value), 100), 60000),
            pageMarginTop: (pageMarginTop.value ? pageMarginTop.value : pageMargin.value) * (100 / scale.value),
            pageMarginRight: (pageMarginRight.value ? pageMarginRight.value : pageMargin.value) * (100 / scale.value),
            pageMarginBottom:
                (pageMarginBottom.value ? pageMarginBottom.value : pageMargin.value) * (100 / scale.value),
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
    }

    function redoLayout() {
        if (verovioIsReady.value) {
            clearTimeout(redoLayoutTimeout);
            isLoading.value = true;
            redoLayoutTimeout = setTimeout(() => {
                setVerovioOptions();
                verovioToolkit.value.redoLayout();
                setRenderedScoreToPage(page.value);
            }, 100);
        }
    }

    async function loadScoreFile() {
        try {
            if(verovioRuntimeInitialized) {
                const data = await getData();
                message.value = 'Load score with verovio';
                // verovio wont throw on invlaid input files
                verovioToolkit.value.loadData(data);
                verovioIsReady.value = true;
                message.value = 'Render current page with verovio';
                setRenderedScoreToPage(page.value);
            }
        } catch (e) {
            isError.value = true;
            message.value = `Cannot display score with verovio (${e.message})`;
            console.error(e);
        }
    }

    async function getData() {
        if (data.value) {
            return data.value;
        } else if(url.value) {
            message.value = 'Fetching score file from server';
            const response = await fetch(url.value);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            return await response.text();
        }
        throw new Error('Input missing: pass url or data prop');
    }

    return {
        renderedScore: readonly(renderedScore),
        page: readonly(page),
        isLoading: readonly(isLoading),
        isError: readonly(isError),
        message: readonly(message),
        dimensions: readonly(dimensions),
        nextPage,
        prevPage,
        setPage,
    };
}
