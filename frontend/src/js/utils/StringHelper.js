export default class StringHelper {
    static ucFirst(str) {
        if (str && str.length > 0)
            return str.charAt(0).toUpperCase() + str.slice(1)
        return '';
    }

    static ucWords(str) {
        return (str + '')
            .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g,
                $1 => $1.toUpperCase()
            );
    }

    static underscoreToCamelCase(str) {
        /*var res = str.replace(/_/g, ' ')
        return StringHelper.ucWords(res)*/
    }

    static camelCaseToSpaced(str) {
        return str.replace(/[A-Z]/g,
            match => ' ' + match.toLowerCase()
        );
    }

    static removeHtml(str) {
        return str.replace(/<(?:.|\n)*?>/gm, '')
    }
}