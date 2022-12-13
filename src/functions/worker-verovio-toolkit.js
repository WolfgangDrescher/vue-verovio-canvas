import { Deferred } from '../classes/deferred.js';
import { v4 as uuidv4 } from 'uuid';

export function createWorkerVerovioToolkit(worker) {
    const toolkitId = uuidv4();
    const tasks = {};
    worker.addEventListener('message', (event) => {
        const { id, result } = event.data;
        const deferred = tasks[id];
        if (deferred) {
            deferred.resolve(result);
            delete tasks[id];
        }
    });
    return new Proxy({}, {
        get: (target, method) => {
            return (...args) => {
                const id = uuidv4();
                worker.postMessage({
                    toolkitId,
                    id,
                    method,
                    args,
                });
                const deferred = new Deferred();
                tasks[id] = deferred;
                return deferred.promise;
            };
        },
    });
}
