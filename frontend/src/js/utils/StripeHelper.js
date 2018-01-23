/**
 * Stripe lib needs to be loaded to use that func
*/
export default class StripeHelper {
    static processPayment(config) {
        const { creditCard, onCardFail } = config

        Stripe.card.createToken({
            number: creditCard.cardNumber,
            cvc: creditCard.cvc,
            exp_month: creditCard.expireMonth,
            exp_year: creditCard.expireYear,
            address_zip: creditCard.zipOrPostcode
        }, (status, response) => {
            if (response.error) {
                if (onCardFail) onCardFail()
                return
            }

            const { paymentUrl, requestType, params, onSuccess, onError } = config

            let data = { token: response, method: 'stripe', cardHolderName: creditCard.cardHolderName }
            if (params) Object.assign(data, params)

            $.ajax({
                type: requestType ? requestType : 'get',
                url: paymentUrl,
                data: data,
                success: onSuccess,
                error: onError
            })
        })
    }

    static loadPublishableKey() {
        $.ajax({
            get: 'get',
            url: '/api/settings/stripe-key',
            success: key => Stripe.setPublishableKey(key),
            error: xhr => console.error(xhr)
        })
    }
}

/*
StripeHelper.propTypes = {
    config: PropTypes.shape({
        creditCard: PropTypes.object.isRequired,
        onSuccess: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired,
        paymentUrl: PropTypes.string.isRequired,
        requestType: PropTypes.string,
        params: PropTypes.object,
        onCardFail: PropTypes.func
    })
}*/
