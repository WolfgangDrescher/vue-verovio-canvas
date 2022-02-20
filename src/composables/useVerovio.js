import { ref, readonly, onMounted, watch, reactive } from 'vue';
import verovio from 'verovio';
import { useVerovioPagination } from './useVerovioPagination';

export function useVerovio(options, templateRef) {

    const {
        url,
        scale,
        viewMode,
        pageMargin,
        pageMarginTop,
        pageMarginRight,
        pageMarginBottom,
        pageMarginLeft,
        header,
        footer,
    } = options;

    const dimensions = reactive({
        width: null,
        height: null,
    });
    const renderedScore = ref(null);
    const loadingMessage = ref(null)
    let verovioToolkit = ref(null);
    let verovioIsReady = ref(false);
    let redoLayoutTimeout = null;
    let resizeObserver = null;

    const { page, nextPage, prevPage, setPage, setRenderedScoreToPage } = useVerovioPagination(verovioToolkit, renderedScore, verovioIsReady);

    onMounted(() => {
        verovio.module.onRuntimeInitialized = async () => {
            verovioToolkit.value = new verovio.toolkit();
            setVerovioOptions();
            loadScoreFile();
        };
    });

    watch([scale, dimensions, viewMode], () => {
        redoLayout();
    });

    watch(templateRef, elem => {
        initResizeObserver(elem);
    });

    function initResizeObserver(elem) {
        if(elem) {
            dimensions.width = elem.clientWidth;
            dimensions.height = elem.clientHeight;
            resizeObserver = new ResizeObserver(([entry]) => {
                dimensions.width = entry.target.clientWidth;
                dimensions.height = entry.target.clientHeight;
            });
            resizeObserver.observe(elem);   
        }
    };

    function setVerovioOptions() {
        verovioToolkit.value.setOptions(generateVerovioOptions());
    };

    function generateVerovioOptions() {
        const options = {
            scale: scale.value,
            header: header.value,
            footer: footer.value,
            pageWidth: Math.min(Math.max(dimensions.width * (100 / scale.value), 100), 60000),
            pageHeight: Math.min(Math.max(dimensions.height * (100 / scale.value), 100), 60000),
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
        if (verovioIsReady.value) {
            clearTimeout(redoLayoutTimeout);
            redoLayoutTimeout = setTimeout(() => {
                setVerovioOptions();
                verovioToolkit.value.redoLayout();
                setRenderedScoreToPage(page.value);
            }, 100);
        }
    };

    async function loadScoreFile() {
        loadingMessage.value = 'Fetching score file from server';
        const response = await fetch(url.value);
        const data = await response.text();
        loadingMessage.value = 'Load score with verovio';
        verovioToolkit.value.loadData(data);
        verovioIsReady.value = true;
        loadingMessage.value = 'Render current page with verovio';
        setRenderedScoreToPage(page.value);
    };

    return {
        renderedScore: readonly(renderedScore),
        page: readonly(page),
        loadingMessage: readonly(loadingMessage),
        dimensions: readonly(dimensions),
        nextPage,
        prevPage,
        setPage,
    };
};
