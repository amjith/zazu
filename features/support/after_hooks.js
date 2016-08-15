const jetpack = require('fs-jetpack')
const path = require('path')
const chalk = require('chalk')
const { git } = require('../../app/lib/git')

module.exports = function () {
  this.Before(function (scenario) {
    this.start = new Date()
    const homeDir = path.join(__dirname, '../../test/fixtures/home')
    const calcPlugin = path.join(homeDir, '.zazu', 'plugins', 'tinytacoteam', 'zazu-calculator')
    const configFile = path.join(__dirname, '..', '..', 'test', 'fixtures', 'home', '.zazurc.js')
    return git(['checkout', configFile]).then(() => {
      jetpack.remove(calcPlugin)
      return this.close()
    })
  })

  this.After(function (scenario) {
    const duration = new Date() - this.start
    const color = duration > 3500 ? 'red' : (duration > 2000 ? 'yellow' : 'blue')
    console.log('    Duration: ', chalk[color](duration + 'ms'))
    return this.close()
  })
}
