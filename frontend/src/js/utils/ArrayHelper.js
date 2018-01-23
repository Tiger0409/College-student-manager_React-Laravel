export default class ArrayHelper {
    static toggleValue(array, value) {
        const index = array.indexOf(value)
        if (index == -1)
            array.push(value)
        else
            array.splice(index, 1)
    }

    static createIfNotExists(array, obj, predicate) {
        if (!predicate) {
            predicate = (objA, objB) => objA.id == objB.id
        }

        let exists = false
        for (let i in array) {
            if (predicate(array[i], obj)) {
                exists = true
                break
            }
        }

        if (!exists) {
            array.push(obj)
        }
    }
}