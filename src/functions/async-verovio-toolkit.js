import { Deferred } from '../classes/deferred.js';

export function createAsyncVerovioToolkit(verovioToolkitInstance) {
    return new Proxy({}, {
        get: (target, method) => {
            return (...args) => {
                const deferred = new Deferred();
                const fn = verovioToolkitInstance[method];
                let result;
                if (fn) {
                    result = fn.apply(verovioToolkitInstance, args || []);
                }
                deferred.resolve(result);
                return deferred.promise;
            };
        },
    });
}
