import Noty from 'noty'
import 'noty/lib/noty.css'

const MAX_MESSAGE_LENGTH = 100
const SHOW_INTERVAL = 5000
const FADE_SPEED = 500
let notifyQuery = []
let isRunning = false

export default class Notifier {
    /*static showPopup(message, style, interval, imageSrc) {
        Notifier.add(new NotifyBox(message, style, interval, imageSrc))
    }*/

    static show(text, type, timeout) {
        new Noty({
            text: text,
            type: type,
            layout: 'bottomRight',
            animation: {
                open: 'animated flipInX',
                close: 'animated flipOutX',
                easing: 'swing',
                speed: FADE_SPEED
            },
            timeout: timeout ? timeout : SHOW_INTERVAL
        }).show()

        /*const boxId = (params && params.boxId) ? params.boxId : 'notifications'
        let $notifyBox = $('#' + boxId)

        const close = () => $view.fadeOut(FADE_SPEED, () => $view.remove())
        const show = () => {
            $view.fadeIn(FADE_SPEED)

            const boxPosition = $notifyBox.position()

            if ($notifyBox && boxPosition && $('body').scrollTop() > boxPosition.top) {
                $('html, body').animate({ scrollTop: $notifyBox.offset().top - 10 }, "slow");
            }
        }

        $notifyBox.append($view)
        $view.click(close)

        show()

        const interval = (params && params.interval) ? params.interval : SHOW_INTERVAL
        setTimeout(close, interval)*/
    }

    static success(text) {
        Notifier.show(text, 'success', 3000)
        /*
        let $alert = $(
            `<div class="alert alert-success" style="display: none; margin: 10px 0 10px 0; font-family: initial">` +
                `<strong>Success! </strong><span style="font-weight: normal">${text}</span>` +
            `</div>`
        )
        Notifier.show($alert, params)*/
    }

    static error(text) {
        Notifier.show(text, 'error')
        /*let $alert = $(
            `<div class="alert alert-danger" style="display: none; margin: 10px 0 10px 0; font-family: initial">` +
                `<strong>Error! </strong><span style="font-weight: normal">${text}</span>` +
            `</div>`
        )
        Notifier.show($alert, params)*/
    }

    static clear() {
        let $notifyBox = $('#notifications')
        $notifyBox.empty()
    }

    /*static warningPopup(text, interval) {
        if (text.length > MAX_MESSAGE_LENGTH) {
            console.log(text)
            text = 'Success'
        }

        interval = interval ? interval : SHOW_INTERVAL

        Notifier.showPopup(
            text,
            { 'background-color': 'rgba(130, 255, 109, 0.9)' },
            interval,
            'src/images/success.gif'
        )
    }*/

    /*static success(text, interval) {
        if (text.length > MAX_MESSAGE_LENGTH) {
            console.log(text)
            text = 'Success'
        }

        interval = interval ? interval : SHOW_INTERVAL

        Notifier.show(
            text,
            { 'background-color': 'rgba(130, 255, 109, 0.9)' },
            interval,
            'src/images/success.gif'
        )
    }

    static error(text, interval) {
        if (text.length > MAX_MESSAGE_LENGTH) {
            console.error(text)
            text = 'Error'
        }

        interval = interval ? interval : SHOW_INTERVAL

        Notifier.show(
            text,
            { 'background-color': 'rgba(255, 109, 109, 0.9)' },
            interval,
            'src/images/cross.gif'
        )
    }*/

    /*static add(notifyBox) {
        notifyQuery.push(notifyBox)
        if (!isRunning) {
            Notifier.run()
        }
    }

    static run() {
        isRunning = true

        var loop = (() => {
            if (notifyQuery.length === 0) {
                isRunning = false
                return
            }

            notifyQuery[0].start()
            notifyQuery[0].onClose = () => {
                notifyQuery.splice(0, 1)
                loop()
            }
        })

        loop()
    }*/
}

/*
class NotifyBox {
    createElement(message, style, imageSrc) {
        Object.assign(style, {
            'height': '60px',
            'position': 'fixed',
            'top': '90%',
            'left': '50%',
            'margin-right': '-50%',
            'transform': 'translate(-50%, -50%)',
            'display': 'flex',
            'border-radius': '10px',
            'padding': '0px 40px 0px 40px'
        })

        this.$box = $('<div></div>', {
            css: style
        })

        this.$content = $('<div></div>', {
            css: {
                'display': 'flex',
                'align-items': 'center'
            }
        })

        this.$text = $('<span></span>', {
            text: message,
            css: {
                'display': 'inline-flex',
                'verical-align': 'middle',
                'margin': '0',
                'font-size': '18px'
            }
        })

        if (imageSrc) {
            this.$image = $('<img />', {
                src: imageSrc,
                css: {
                    'display': 'inline-flex',
                    'width': '20px',
                    'margin': '0',
                    'transform': 'translate(-50%, 0)'
                }
            })

            this.$content.append(this.$image)
        }

        this.$content.append(this.$text)
        this.$box.append(this.$content)
        $('body').append(this.$box)
    }

    constructor(message, style, interval, imageSrc) {
        this.createElement(message, style, imageSrc)
        this.showInterval = interval
        this.$box.hide()
    }

    start() {
        this.show()
        setTimeout(() => this.close(), this.showInterval)
    }

    show() {
        this.$box.fadeIn(FADE_SPEED)
    }

    close() {
        this.$box.fadeOut(FADE_SPEED, () => {
            this.$box.remove()
            if (this.onClose) {
                this.onClose()
            }
        })
    }
}*/
