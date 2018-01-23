export default class Rand {
    static getInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}