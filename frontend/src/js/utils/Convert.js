export default class Convert {
    static toBool(input) {
        switch (input) {
            case 1:
            case '1':
            case 'true':
            case true:
                return true
            default:
                return false
        }
    }
}