export default class Bench {
    constructor(timerName) {
        this.startTime = new Date().getTime()
        this.timerName = timerName
    }

    stop() {
        var endTime = new Date().getTime()
        var totalTime = endTime - this.startTime
        console.log('Finished "', this.timerName, '" finished in ', totalTime)
    }
}