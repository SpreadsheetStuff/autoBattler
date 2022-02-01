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

  //Unit's base stats
  static baseStats () {return [10, 2, 1, 1]}
  
  /**
   * Create stats for shop by taking the split of 4 numbers out of their total and adding them to their minimum stats
   * @param {Array<number>} statSplits Array of any numbers that this will base extra stats off of
   * @param {number} Total of the first array
   * @param {Array<number>} base Array of the generated units minimum stats
   * @param {number} extra How much extra stats are the being split and given to each stat
   */
  static createStats (statSplits, total, base, extra) {return statSplits.map((a, i) => Math.round(a/total * extra) + base[i])}
  /**
   * Generates shop!
   */
  generateShop() {
    //Clears shop
    this.unitTypes = []
    //Checks whether this is p1's shop, and either generates the shop or copies p1's shop to prevent different shops
    if (this.playerNum == 1){
      // Sets total stats to 30 so that later it can decrease them
      let extraStats = 15
      
      for (let i = 0; i < 5; i++) {
        // Generates a random number as the index of all abilities then checks that there are no repeated abilities
        let ability = this.abilityPool[Math.floor(Math.random() * this.abilityPool.length)]
        while (this.unitTypes.map(a => a.ability.name).indexOf(ability.name) > - 1) {
          ability = this.abilityPool[Math.floor(Math.random() * this.abilityPool.length)]
        }

        //Generates states using the function above
        let stats = [Math.random(), Math.random(), Math.random()/2, Math.random()/2]
        let total = stats.reduce((a, b) => a + b)
        let stats2 = Shop.createStats(stats, Shop.baseStats(), total, extraStats)

        // Calculates how many stats were added or lost from rounding
        let leftover = Math.round(15 + extraStats - stats2.reduce((a, b) => a + b))
  
        this.unitTypes.push(new UnitType(stats2[0], stats2[1], stats2[2] + leftover, stats2[3], ability))
        extraStats -= 2.5
      }
    } else {
      //Copies p1's shop
      for (let type of p1Shop.unitTypes) {
        this.unitTypes.push(type)
      }
    }

    this.draw()
    this.save()
  }

  /**
   * @param {UnitType} item a
   * 
   * Deletes an item by replacing it with a fake unit named 'sold' \
   * After deletion, this draws itself and saves to PropertiesService
   * 
   */
  deleteItem(item) {
    this.unitTypes.splice(this.unitTypes.indexOf(item), 1, fillerUnit)
    this.draw()
    this.save()
  }
  /**
   * Loading -
   * Parses contents of this shop from PropertiesService, converts them all into UnitType objects then sets this shop's unitTypes array to those UnitTypes
   */
  load() {
    this.unitTypes = JSON.parse(properties.getProperty("shop" + this.playerNum)).map(a => new UnitType(a[0], a[1], a[2], a[3], abilities[a[4]]))
  }
  /**
   * Saving -
   * Converts each of this shop's UnitTypes to an array then 
   * Saves the contents of this shop to PropertiesService
   */
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
p1Shop.deleteItem()
