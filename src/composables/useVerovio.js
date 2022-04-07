import { ref, readonly, watch } from 'vue';
import { VerovioToolkitProxy } from '../worker/VerovioToolkitProxy';
import { useVerovioPagination } from './useVerovioPagination';
import { useVerovioResizeObserver } from './useVerovioResizeObserver';
import { useDeferred } from './useDeferred';

let verovioRuntimeInitialized = useDeferred();

const defaultOptions = {
    scale: 40,
    pageMarginTop: 0,
    pageMarginRight: 0,
    pageMarginBottom: 0,
    pageMarginLeft: 0,
    header: 'none',
    footer: 'none',
};

export function useVerovio(props, templateRef) {
    const {
        url,
        data,
        scale,
        viewMode,
        pageMargin,
        options,
    } = props;

    const renderedScore = ref(null);
    const isLoading = ref(true);
    const isError = ref(false);
    const message = ref(null);
    const verovioToolkit = new VerovioToolkitProxy();
    const verovioIsReady = useDeferred();
    let redoLayoutTimeout = null;

    const { page, nextPage, prevPage, setPage, renderCurrentPage } = useVerovioPagination(
        verovioToolkit,
        renderedScore,
        verovioIsReady,
        isLoading
    );
    const { dimensions } = useVerovioResizeObserver(templateRef);

    message.value = 'Initializing Verovio WebAssembly runtime';


    verovioToolkit.onRuntimeInitialized().then(async () => {
        onRuntimeInitializedEvent();
        if (import.meta.hot) {
            import.meta.hot.data.verovioRuntimeInitialized = true;
        }
    });

    loadScoreFile();

    if (import.meta.hot) {
        if (import.meta.hot.data.verovioRuntimeInitialized) {
            verovioRuntimeInitialized.resolve();
        }
    }

    function onRuntimeInitializedEvent() {
        verovioRuntimeInitialized.resolve();
    }

    watch([scale, options, dimensions, viewMode], () => {
        redoLayout();
    });

    watch(data, () => {
        loadScoreFile();
    });

    async function setVerovioOptions() {
        await verovioToolkit.setOptions(generateVerovioOptions());
    }

    async function callVerovioMethod(methodName, ...args) {
        await verovioIsReady.promise;
        return await verovioToolkit[methodName](...args);
    }

    function generateVerovioOptions() {
        const opt = Object.assign({}, defaultOptions, {
            scale: scale.value,
        }, options.value);
        Object.assign(opt, {
            pageWidth: Math.min(Math.max(dimensions.width * (100 / opt.scale), 100), 60000),
            pageHeight: Math.min(Math.max(dimensions.height * (100 / opt.scale), 100), 60000),
            pageMarginTop: opt.pageMarginTop ? opt.pageMarginTop : pageMargin.value,
            pageMarginRight: opt.pageMarginRight ? opt.pageMarginRight : pageMargin.value,
            pageMarginBottom: opt.pageMarginBottom ? opt.pageMarginBottom : pageMargin.value,
            pageMarginLeft: opt.pageMarginLeft ? opt.pageMarginLeft : pageMargin.value,
        });
        if (viewMode.value === 'vertical') {
            opt.adjustPageHeight = true;
            opt.pageHeight = 60000;
        } else if (viewMode.value === 'horizontal') {
            opt.adjustPageHeight = true;
            opt.breaks = 'none';
            opt.pageWidth = 60000;
        }
        return opt;
    }

    async function redoLayout() {
        await verovioIsReady.promise;
        clearTimeout(redoLayoutTimeout);
        isLoading.value = true;
        redoLayoutTimeout = setTimeout(async () => {
            await setVerovioOptions();
            await verovioToolkit.redoLayout();
            await renderCurrentPage();
        }, 100);
    }

    async function loadScoreFile() {
        try {
            await verovioRuntimeInitialized.promise;
            await setVerovioOptions();
            const data = await getData();
            message.value = 'Load score with verovio';
            // verovio wont throw on invlaid input files
            await verovioToolkit.loadData(data);
            verovioIsReady.resolve();
            message.value = 'Render current page with verovio';
            await renderCurrentPage();
        } catch (e) {
            isError.value = true;
            message.value = `Cannot display score with verovio (${e.message})`;
            console.error(e);
        }
    }

    async function getData() {
        if (data.value) {
            return data.value;
        } else if (url.value) {
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
        callVerovioMethod,
        nextPage,
        prevPage,
        setPage,
    };
}
