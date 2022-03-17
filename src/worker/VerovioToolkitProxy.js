import { useDeferred } from '../composables/useDeferred';
import { v4 as uuidv4 } from 'uuid';
import VerovioWorker from './verovio.worker.js?worker';

console.log(new VerovioWorker());

const workerTasks = {};

export class VerovioToolkitProxy {
    constructor() {
        this.worker = new VerovioWorker();
        this.worker.addEventListener('message', function (event) {
            const { id, result } = event.data;
            const deferred = workerTasks[id];
            if (deferred) {
                deferred.resolve(result);
                delete workerTasks[id];
                console.table(workerTasks);
            }
        });

        this.worker.addEventListener('error', function (event) {
            console.error(event);
        });

        return new Proxy(this, {
            get: (target, method) => {
                return function () {
                    const args = Array.prototype.slice.call(arguments);
                    const id = uuidv4();

                    target.worker.postMessage({
                        id,
                        method,
                        args,
                    });

                    const deferred = useDeferred();
                    workerTasks[id] = deferred;

                    return deferred.promise;
                };
            },
        });
    }
}
