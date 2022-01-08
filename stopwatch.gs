class Stopwatch {
  constructor ()  {
    this.startTime = Date.now()
    this.times = []
  }
  reset() {
    this.startTime = Date.now()
  }
  log(extraText = "") {
    var time = (Date.now() - this.startTime)/1000
    Logger.log(extraText + " " + time.toString())
    this.times.push(time)
  }
  logThenReset(extraText = "", ifOver = 0) {
    var time = (Date.now() - this.startTime)/1000
    if (time > ifOver) {
      Logger.log(extraText + " " + time.toString())
      this.times.push(time)
    }
    this.startTime = Date.now()
  }
  logAverage () {
    const findAverage = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
    Logger.log(findAverage(this.times))
  }
  sleepFromLastReset(seconds) {
    var currentTime = Date.now()
    do {
      currentTime = Date.now()
    } while (currentTime - this.startTime < seconds * 1000)
  }
  sleep(seconds) {
    var previousTime = Date.now()
    var currentTime = Date.now()
    do {
      currentTime = Date.now()
    } while (currentTime - previousTime < seconds * 1000)
  }
}