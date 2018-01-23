import moment from 'moment'

export default class DateHelper {
    static extractValues(date) {
        const dateParts = date.toLocaleDateString().split(/[.\/]+/)

        const zeroFill = number => {
            number = parseInt(number)
            return number >= 10 ? number : '0' + number
        }

        const day = zeroFill(dateParts[1])
        const month = zeroFill(dateParts[0])
        const year = dateParts[2]

        return {
            date: date,
            day: day,
            month: month,
            year: year,
            toString: glue => {
                if (!glue) glue = ' '
                return [year, month, day].join(glue)
            }
        }
    }

    static parse(dateStr) {
        const date = new Date(dateStr)
        const dateParts = date.toDateString().split(' ')

        return {
            date: date,
            day: dateParts[2],
            month: dateParts[1],
            year: dateParts[3],
            toString: () => [this.day, this.month, this.year].join(' ')
        }
    }

    static parseLocale(dateStr) {
        const date = new Date(dateStr)
        const dateParts = date.toLocaleDateString().split(/[.\/]+/)
        const day = dateParts[0]
        const month = dateParts[1]
        const year = dateParts[2]

        return {
            date: date,
            day: day,
            month: month,
            year: year,
            toString: glue => [day, month, year].join(glue)
        }
    }

    static dateToStr(date) {
        const zeroFill = number => {
            number = parseInt(number)
            return number >= 10 ? number : '0' + number
        }

        let month = parseInt(date.getMonth()) + 1
        if (month > 12) month = 1

        return `${date.getFullYear()}-${zeroFill(month)}-${zeroFill(date.getDate())}`
    }

    static parseMoment(dateStr) {
        const split = s => s.split(/[^0-9]+/g)

        let parts = split(dateStr)
        if (parts.length === 1) {
            if (parts[0].length === 8) {
                parts = [dateStr.substr(0, 2), dateStr.substr(2, 2), dateStr.substr(4)]
            } else {
                return dateStr
            }
        }

        if (parts[0].length === 4) {
            return moment(dateStr, 'YYYY-MM-DD')
        } else {
            return moment(dateStr, 'DD-MM-YYYY')
        }
    }

    static format(dateStr) {
        const date = DateHelper.parseMoment(dateStr)
        if (typeof date !== 'object') {
            return date
        }

        return date.format('YYYY-MM-DD')
    }

    static years(a, b) {
        if (!a) return a

        const aDate = DateHelper.parseMoment(a)

        if (typeof aDate !== 'object') {
            return aDate
        }

        const bDate = b ? DateHelper.parseMoment(b) : moment()
        return Math.abs(aDate.diff(bDate, 'years'))
    }
}