/**
 * Sheet that shops will draw to.
 * @type {SpreadsheetApp.SheetType}
 */
const shopSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Shop")

/**
 * Shop Class
 */
class Shop {
  /**
   * --- 
   * Constructs a new instance of the `Shop` class
   * @constructor 
   * @param {Array<Ability>} abilityPool Array of all possible abilities that the units of this shop can have
   * @param {String} range where this shop should draw itself in the spreadsheet
   * @param {number} playerNum the number of the player this shop belongs to
   */
  constructor (abilityPool, range, playerNum) {
    this.abilityPool = abilityPool
    this.range = range
    this.playerNum = playerNum
    
    this.unitTypes = []
  }

  //Generating Shop

  /**
   * Returns base stats for units (constant value)\
   * !!! Written as a function because static properties aren't suppported on apps script
   * @returns {Array<number>}
   */
  static baseStats () {return [10, 2, 1, 1]}
  /**
   * ---
   * Creates stats for shop by taking the split of 4 numbers out of their total, and adding them to the base stats array.
   * 
   * @param {Array<number>} statSplits Array of any numbers that this will base extra stats off of
   * @param {number} total Total of the first array
   * @param {Array<number>} base Array of the generated units minimum stats
   * @param {number} extra How many extra stats are the being split and given to each stat
   * @returns {Array<number>} 4 stat numbers
   */
  static createStats (statSplits, total, base, extra) {return statSplits.map((a, i) => Math.round(a/total * extra) + base[i])}
  /**
   * Generates shop! (also draws then saves)
   */
  generateShop() {
    //Clears shop
    this.unitTypes = []
    //Checks whether this is p1's shop, and either generates the shop or copies p1's shop to prevent different shops
    if (this.playerNum == 1){
      // Sets total stats to 30 so that later it can decrease them
      //let extraStats = 15
      let extraStats = 10
      for (let i = 0; i < 5; i++) {
        // Generates a random number as the index of all abilities then checks that there are no repeated abilities
        let ability = this.abilityPool[Math.floor(Math.random() * this.abilityPool.length)]
        while (this.unitTypes.map(a => a.ability.name).indexOf(ability.name) > - 1) {
          ability = this.abilityPool[Math.floor(Math.random() * this.abilityPool.length)]
        }

        //Generates states using the function above
        let stats = [Math.random(), Math.random(), Math.random()/2, Math.random()/2]
        let total = stats.reduce((a, b) => a + b)
        let stats2 = Shop.createStats(stats, total, Shop.baseStats(), extraStats)

        // Calculates how many stats were added or lost from rounding
        let leftover = Math.round(15 + extraStats - stats2.reduce((a, b) => a + b))
  
        this.unitTypes.push(new UnitType(stats2[0], stats2[1], stats2[2] + leftover, stats2[3], ability))
        //extraStats -= 2.5
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
   * ---
   * Deletes an item by replacing it with a fake unit named 'sold' \
   * After deletion, this `draw()`s and `save()`s
   * 
   * @param {UnitType} item Item you want to delete
   */
  deleteItem(item) {
    this.unitTypes.splice(this.unitTypes.indexOf(item), 1, fillerUnit)
    this.draw()
    this.save()
  }
  /**
   * Parses contents of this shop from PropertiesService, converts them all into UnitType objects then sets this shop's unitTypes array to those UnitTypes
   */
  load() {
    this.unitTypes = JSON.parse(properties.getProperty("shop" + this.playerNum)).map(a => new UnitType(a[0], a[1], a[2], a[3], abilities[a[4]]))
  }
  /**
   * Saves the contents of this shop (as arrays) to `PropertiesService`
   */
  save() {
    properties.setProperty("shop" + this.playerNum, JSON.stringify(this.unitTypes.map(a => a.toArray())))
  }
  /** 
   * Draws the contents of this shop to the `"Shop"` sheet
   */
  draw() {
    //Creates an array of each unitType as a string, then sets this shop's "range" to that string
    const typesAsStrings = this.unitTypes.map(a => a.toShopString())
    shopSheet.getRange(this.range).setValues([typesAsStrings])

    //Does the same thing as above for the unitTypes names.
    const names = this.unitTypes.map(a => a.name)
    // This mess is to go up one row from this shop's range
    const nameRange = shopSheet.getRange(shopSheet.getRange(this.range).getRow() + 1, shopSheet.getRange(this.range).getColumn(), 1, shopSheet.getRange(this.range).getNumColumns())
    nameRange.setValues([names])
  }
}