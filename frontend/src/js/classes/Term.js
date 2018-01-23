import Ph from '../utils/PromiseHelper.js'

export default class Term {
    static getActive(callback) {
        let promise = Ph.ajax({
            type: 'get',
            url: '/api/terms/active'
        })

        promise.then(term => callback(term))
    }
}