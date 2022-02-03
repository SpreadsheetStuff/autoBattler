/**
 * Stopwatch class
 */
class Stopwatch {
  /**
   * Generates a new stopwatch object (which is always running)
   */
  constructor ()  {
    this.lastReset = Date.now()
    this.times = []
  }
  /**
   * Sleeps for some amount of seconds.
   * @param {number} seconds How long this should wait
   */
  static sleep(seconds) {
    var previousTime = Date.now()
    var currentTime = Date.now()
    do {
      currentTime = Date.now()
    } while (currentTime - previousTime < seconds * 1000)
  }
  /**
   * Sleeps till some amount of seconds has past since the last time you reset the stopwatch.
   * @param {number} seconds How long this should wait
   */
  sleepFromLastReset(seconds) {
    var currentTime = Date.now()
    do {
      currentTime = Date.now()
    } while (currentTime - this.lastReset < seconds * 1000)
  }
  /**
   * Resets the stopwatch by setting the lastReset time to now
   */
  reset() {
    this.lastReset = Date.now()
  }
  /**
   * Logs (to an array and to the execution log) how long it has been since the stopwatch was reset in seconds.
   * @param {string=} extraText Text to log before the time
   */
  log(extraText = "", ifOver = 0) {
    var time = (Date.now() - this.lastReset)/1000
    if (time > ifOver) {
      Logger.log(extraText + " " + time.toString())
      this.times.push(time)
    }
  }
  /**
   * Logs (to an array and to the execution log) how long it has been since the stopwatch was reset then resets it.
   * @param {string=} extraText Text to log before the time
   * @param {number=} ifOver Minimum time since last reset in seconds needed to log anything
   */
  logThenReset(extraText = "", ifOver = 0) {
    var time = (Date.now() - this.lastReset)/1000
    if (time > ifOver) {
      Logger.log(extraText + " " + time.toString())
      this.times.push(time)
    }
    this.lastReset = Date.now()
  }
  /**
   * Logs the average amount of time inside this stopwatch's times list.
   * 
   * To put times in the time list see log or logThenReset!
   */
  logAverage () {
    Logger.log(this.times.reduce((a,b) => a + b, 0) / this.times.length)
  }
}