import Sh from './StringHelper.js'
import CreditCardForm from '../components/common/CreditCardForm.jsx'
import Notifier from './Notifier.js'
import StripeHelper from './StripeHelper.js'

export default class PaymentHelper {
    static processPayment(method, params, onSuccess, onError) {
        const isOther = ['stripe', 'paypal'].indexOf(method) === -1

        let handler = `process${Sh.ucFirst(method)}Payment`
        if (isOther) {
            handler = 'processOtherPayment'
            if (!params.params) params.params = {}
            params.params.method = method
        }

        new PaymentHelper()[handler](params, onSuccess, onError)
    }

    processStripePayment(params, onSuccess, onError) {
        const { url, type, params: ajaxParams, creditCard } = params

        const result = CreditCardForm.validate(creditCard)

        Notifier.clear()

        if (!result.isValid) {
            result.errors.forEach(error => Notifier.error(error))
            return
        }

        StripeHelper.processPayment({
            creditCard: creditCard,
            paymentUrl: url,
            requestType: type,
            params: ajaxParams,
            onCardFail: () => {
                Notifier.error('Invalid data')
                onError && onError()
            },
            onSuccess: data => {
                Notifier.success('Payment completed')
                onSuccess && onSuccess(data)
            },
            onError: xhr => {
                Notifier.error('Payment has failed, please check the details and try again')
                onError && onError(xhr)
            }
        })
    }

    processPaypalPayment(params, onSuccess, onError) {
        const { url, type, params: ajaxParams } = params

        let data = { method: 'paypal' }
        if (ajaxParams) Object.assign(data, ajaxParams)

        $.ajax({
            type: type ? type : 'get',
            url: url,
            data: data,
            success: data => {
                if (data.paypalForm) {
                    let decodedForm = $('<div />').html(data.paypalForm).text()
                    $('body').append(decodedForm)
                    $("form[name='paypal_form']").submit()
                }
            },
            error: xhr => {
                onError && onError(xhr)
                Notifier.error(xhr.responseText.replace(/"/g, ''))
            }
        })
    }

    processOtherPayment(params, onSuccess, onError) {
        const { type, url, params: ajaxParams } = params

        $.ajax({
            type: type,
            url: url,
            data: ajaxParams,
            success: data => {
                onSuccess && onSuccess(data)
            },
            error: xhr => {
                onError && onError(xhr)
            }
        })
    }
}