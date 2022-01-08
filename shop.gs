/////////////
class Shop {
  constructor (abilityPool, range, playerNum) {
    this.abilityPool = abilityPool
    this.unitTypes = []
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Shop")
    this.range = range
    this.playerNum = playerNum
  }
  //Generating Shop
  generateShop() {
    if (this.playerNum == 1){
      this.unitTypes = []
      let ability = abilities[0]
      let baseStats = [10, 2, 1, 1]
      let leftover = 1
      let createStats = (a1, a2, a3) => a1.map((a, i) => Math.round(a/a3 * 10) + a2[i]) 
      for (let i = 0; i < 5; i++) {
        ability = this.abilityPool[Math.floor(Math.random() * this.abilityPool.length)]
        let stats = [Math.random(), Math.random(), Math.random()/2, Math.random()/2]
        let total = stats.reduce((a, b) => a + b)
        let stats2 = createStats(stats, baseStats, total)
        if (stats2[3] > 5) {
          stats2[3] = 5
        }
        leftover = 25 - stats2.reduce((a, b) => a + b)
        this.unitTypes.push(new UnitType(stats2[0], stats2[1], stats2[2] + leftover, stats2[3], ability))
      }
    } else {
      //this.unitTypes = p1Shop.unitTypes.map(a => a.toArray()).map(a => new UnitType(a[0], a[1], a[2], a[3], abilities[a[4]]))
      for (let type of p1Shop.unitTypes) {
        this.unitTypes.push(type)
      }
    }
    //this.unitTypes = this.unitTypes.concat(this.unitTypes)
    this.draw()
    this.save()
  }
  //Deleting items
  deleteItem(item) {
    this.unitTypes.splice(this.unitTypes.indexOf(item), 1, fillerUnit)
    this.draw()
    this.save()
  }
  //loading/saving/drawing etc
  load() {
    this.unitTypes = JSON.parse(properties.getProperty("shop" + this.playerNum)).map(a => new UnitType(a[0], a[1], a[2], a[3], abilities[a[4]]))
  }
  save() {
    properties.setProperty("shop" + this.playerNum, JSON.stringify(this.unitTypes.map(a => a.toArray())))
  }
  draw() {
    var typesAsStrings = this.unitTypes.map(a => a.toShopString())
    this.sheet.getRange(this.range).setValues([typesAsStrings])
    var names = this.unitTypes.map(a => a.name)
    let nameRange = this.sheet.getRange(this.sheet.getRange(this.range).getRow() + 1, this.sheet.getRange(this.range).getColumn(), 1, this.sheet.getRange(this.range).getNumColumns())
    nameRange.setValues([names])
  }
}