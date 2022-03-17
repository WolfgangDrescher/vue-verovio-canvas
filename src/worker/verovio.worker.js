import verovio from 'verovio-humdrum';
import { useDeferred } from '../composables/useDeferred';

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

    let verovioToolkit = {};

    const moduleIsReady = useDeferred();

    verovio.module.onRuntimeInitialized = function () {
        verovioToolkit = new verovio.toolkit();
        moduleIsReady.resolve();
    };

    addEventListener('message', function (event) {
        const { id, method, args } = event.data;

        if(method === 'onRuntimeInitialized') {
            moduleIsReady.promise.then(() => {
                postMessage({
                    id,
                    method,
                    args,
                    result: null,
                }, event);
            });
            return;
        }

        const fn = verovioToolkit[method || null];
        let result;
        if(fn) {
            result = fn.apply(verovioToolkit, args || []);
        }

        postMessage({
            id,
            method,
            args,
            result,
        }, event);
    });
}
