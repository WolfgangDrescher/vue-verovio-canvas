import { Deferred } from '../classes/deferred.js';

export function createVerovioWorker(createVerovioModule, VerovioToolkit, enableLog, logLevel) {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

        let verovioToolkit = {};
        const moduleIsReady = new Deferred();

        createVerovioModule().then(VerovioModule => {
            if (enableLog) {
                enableLog(logLevel, VerovioModule);
            }
            verovioToolkit = new VerovioToolkit(VerovioModule);
            moduleIsReady.resolve();
        });

        addEventListener('message', (event) => {
            const { id, method, args } = event.data;

            if (method === 'moduleIsReady') {
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

            const fn = verovioToolkit[method];
            let result;
            if (fn) {
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
}
