export default class PromiseHelper {
    static makeCancelable(promise) {
        let hasCanceled = false;

        return {
            promise: new Promise(
                (resolve, reject) => {
                    promise.then(
                        r => { if (!hasCanceled) resolve(r) },
                        errorXhr => reject(errorXhr)
                    )
                }
            ),

            cancel() {
                hasCanceled = true
            },

            then(success, error) {
                this.promise.then(success, error)
            }
        }
    }

    static makeCancelableAjax(ajax) {
        return this.makeCancelable(Promise.resolve(ajax))
    }

    static ajax(obj) {
        return this.makeCancelable(Promise.resolve($.ajax(obj)))
    }
}