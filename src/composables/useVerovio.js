import { ref, readonly, watch, onUnmounted } from 'vue';
import { useVerovioPagination } from './useVerovioPagination';
import { useVerovioResizeObserver } from './useVerovioResizeObserver';
import { Deferred } from '../classes/deferred';

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
        select,
    } = props;

    const renderedScore = ref(null);
    const isLoading = ref(true);
    const isError = ref(false);
    const message = ref(null);
    const verovioToolkit = ref(null);
    const scoreIsReady = new Deferred();
    const verovioModuleIsReady = new Deferred();
    const rerender = ref(true);
    let redoLayoutTimeout = null;

    const { page, nextPage, prevPage, setPage, renderCurrentPage } = useVerovioPagination(
        verovioToolkit,
        renderedScore,
        scoreIsReady,
        isLoading,
        rerender
    );
    const { observe, unobserve, dimensions } = useVerovioResizeObserver(templateRef);

    message.value = 'Initializing Verovio WebAssembly runtime';

    function setToolkit(toolkit) {
        if (toolkit) {
            verovioToolkit.value = toolkit;
            verovioToolkit.value.moduleIsReady().then(() => verovioModuleIsReady.resolve());
        }
    }

    watch([scale, options, dimensions, viewMode], () => {
        rerender.value = true;
        redoLayout();
    });

    watch(data, () => {
        loadScoreFile();
    });

    async function setVerovioOptions() {
        await verovioToolkit.value.setOptions(generateVerovioOptions());
    }

    async function callVerovioMethod(methodName, ...args) {
        await scoreIsReady.promise;
        return await verovioToolkit.value[methodName](...args);
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
        await scoreIsReady.promise;
        clearTimeout(redoLayoutTimeout);
        isLoading.value = true;
        redoLayoutTimeout = setTimeout(async () => {
            await setVerovioOptions();
            await verovioToolkit.value.redoLayout();
            await renderCurrentPage();
        }, 100);
    }

    async function loadScoreFile() {
        try {
            await verovioModuleIsReady.promise;
            await setVerovioOptions();
            const data = await getData();
            message.value = 'Load score with verovio';
            if (!select.value || Object.keys(select.value).length !== 0 || Object.getPrototypeOf(select.value) !== Object.prototype) {
                await verovioToolkit.value.select(select.value);
            }
            // verovio wont throw on invlaid input files
            await verovioToolkit.value.loadData(data);
            scoreIsReady.resolve();
            if (rerender.value) {
                message.value = 'Render current page with verovio';
                await renderCurrentPage();
            }
            observe();
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

    async function load() {
        await verovioModuleIsReady.promise;
        return await loadScoreFile();
    }

    onUnmounted(async () => {
        if (verovioToolkit.value) {
            await verovioToolkit.value.removeToolkit();
        }
    });

    return {
        verovioModuleIsReady,
        scoreIsReady,
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
        load,
        setToolkit,
        observe,
        unobserve,
    };
}
