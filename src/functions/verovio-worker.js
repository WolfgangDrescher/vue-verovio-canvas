import { Deferred } from '../classes/deferred.js';

export function createVerovioWorker(createVerovioModule, VerovioToolkit, enableLog, logLevel) {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

        const verovioToolkits = {};

        const verovioModulePromise = createVerovioModule();
        verovioModulePromise.then(VerovioModule => {
            if (enableLog) {
                enableLog(logLevel, VerovioModule);
            }
        });

        async function getVerovioToolkit(id) {
            if (verovioToolkits[id]) return verovioToolkits[id];
            const VerovioModule = await verovioModulePromise;
            verovioToolkits[id] = new VerovioToolkit(VerovioModule);
            return verovioToolkits[id];
        }

        function removeToolkit(id) {
            if (verovioToolkits[id]) {
                verovioToolkits[id].destroy();
                delete verovioToolkits[id];
            }
        }

        addEventListener('message', async (event) => {
            const { id, method, args, toolkitId } = event.data;

            if (method === 'moduleIsReady') {
                verovioModulePromise.then(() => {
                    postMessage({
                        id,
                        method,
                        args,
                        result: null,
                    }, event);
                });
                return;
            }

            if (method === 'removeToolkit') {
                removeToolkit(toolkitId);
                postMessage({
                    id,
                    method,
                    args,
                    result: Object.keys(verovioToolkits).length,
                }, event);
                return;
            }

            const verovioToolkit = await getVerovioToolkit(toolkitId);

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
