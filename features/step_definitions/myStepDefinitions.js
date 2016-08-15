const path = require('path')
const robot = require('robotjs')
const Application = require('spectron').Application
const $ = require('cheerio')
const jetpack = require('fs-jetpack')

class World {
  profile (name) {
    this.profileType = name
    const appPath = path.join(__dirname, '../../app')
    const homeDir = path.join(__dirname, '../../test/fixtures/home')
    const calcProfile = path.join(homeDir, '..', '.zazurc.js')
    const homeProfile = path.join(homeDir, '.zazurc.js')
    if (this.profileType === 'calculator') {
      jetpack.copy(calcProfile, homeProfile, { overwrite: true })
    }
    this.app = new Application({
      path: require('electron-prebuilt'),
      args: [appPath],
      env: {
        NODE_ENV: 'test',
        ZAZU_HOME: homeDir,
      },
    })
    return Promise.resolve()
  }

  open () {
    if (this.profileType === 'calculator') {
      return this.app.start().then(() => {
        return wait(10 * 1000) // give it time to install the plugin
      })
    }
    return this.app.start()
  }

  isWindowVisible () {
    return this.app.browserWindow.isVisible()
  }

  hasResults () {
    return this.app.client.isExisting('.results')
  }

  type (input) {
    this.app.client.setValue('input', input)
  }

  toggleWindow () {
    return Promise.resolve(this.hitHotkey('space', 'shift'))
  }

  hitHotkey (key, modifier) {
    const value = modifier ? robot.keyTap(key, modifier) : robot.keyTap(key)
    return Promise.resolve(value).then(() => {
      return wait(100)
    })
  }

  close () {
    return this.app && this.app.stop()
  }

  clickActiveResult () {
    return this.app.client.click('li.active')
  }

  getActiveResult () {
    return this.app.client.getText('li.active')
  }

  isRunning () {
    return this.app.isRunning()
  }

  getResults () {
    return this.app.client.getText('.results')
  }

  getResultItems () {
    return this.app.client.getHTML('.results').then((results) => {
      return $(results).find('li')
    })
  }

  windowCount () {
    return this.app.client.getWindowCount().catch((err) => {
      console.log('ERROR:', err)
    })
  }

  readClipboard () {
    return this.app.electron.clipboard.readText()
  }

}

const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

const eventually = (func, iteration) => {
  iteration = (iteration || 1)
  if (iteration === 20) {
    return Promise.reject('Forever is a long time')
  }
  return func().catch((err) => {
    console.error('ERROR: ', err)
    return wait(100).then(() => {
      return eventually(func)
    })
  })
}

const eventuallyAssert = (func, expectedValue, iteration) => {
  iteration = (iteration || 1)
  if (iteration === 20) {
    return Promise.reject('Forever is a long time')
  }
  return func().then((actualValue) => {
    if (actualValue === expectedValue) {
      return true
    } else {
      return new Promise((resolve) => {
        setTimeout(resolve, 100)
      }).then(() => {
        return eventuallyAssert(func, expectedValue, iteration + 1)
      })
    }
  }).catch((err) => {
    console.error('ERROR: ', err)
    return wait(100).then(() => {
      return eventuallyAssert(func, expectedValue, iteration + 1)
    })
  })
}

module.exports = function () {
  this.World = World

  this.Given(/^I have "([^"]*)" as a plugin$/, function (plugin) {
    if (plugin === 'tinytacoteam/zazu-fixture') {
      return this.profile('default')
    } else if (plugin === 'tinytacoteam/zazu-calculator') {
      return this.profile('calculator')
    }
    return Promise.reject('Profile not found')
  })

  this.Given(/^the app is launched$/, {timeout: 15 * 1000}, function () {
    return this.open()
  })

  this.When(/^I toggle with the hotkey$/, function () {
    return wait(100).then(() => {
      return eventually(() => this.isWindowVisible()).then((current) => {
        return this.toggleWindow().then(() => {
          return eventuallyAssert(() => this.isWindowVisible(), !current)
        })
      })
    })
  })

  this.When(/^I wait (\d+) ms$/, function (ms) {
    return wait(parseInt(ms, 10))
  })

  // assumes modifier is first
  this.When(/^I hit the hotkey "([^"]*)"$/, function (hotkey) {
    var keys = hotkey.split('+')
    return this.hitHotkey(keys[1], keys[0])
  })

  // assumes modifier is first
  this.When(/^I hit the hotkey "([^"]*)" (\d+) times$/, function (hotkey, times) {
    var keys = hotkey.split('+')
    var promises = []
    for (let i = 0; i < times; i++) {
      promises.push(this.hitHotkey(keys[1], keys[0]))
    }
    return Promise.all(promises)
  })

  this.When(/^I hit the key "([^"]*)"$/, function (hotkey) {
    return this.hitHotkey(hotkey)
  })

  this.When(/^I click on the active result$/, function () {
    return eventuallyAssert(() => this.hasResults(), true).then(() => {
      return wait(100)
    }).then(() => {
      return this.clickActiveResult()
    })
  })

  this.Then(/^my clipboard contains "([^"]*)"$/, function (expected) {
    return this.readClipboard().then((actual) => {
      if (actual !== expected) {
        throw new Error('Expected "' + expected + '" to be in your clipbaord but found "' + actual + '"')
      }
    })
  })

  this.Then(/^the search window is not visible$/, function () {
    return eventuallyAssert(() => this.isWindowVisible(), false)
  })

  this.Then(/^the search window is visible$/, function () {
    return eventuallyAssert(() => this.isWindowVisible(), true)
  })

  this.Then(/^I have (\d+) results?$/, function (expected) {
    return eventuallyAssert(() => {
      return this.getResultItems().then((items) => items.length)
    }, parseInt(expected, 10))
  })

  this.When(/^I type in "([^"]*)"$/, function (input) {
    this.type(input)
    return wait(100)
  })

  this.When(/^I have no results$/, function () {
    return eventuallyAssert(() => this.hasResults(), false)
  })

  this.Then(/^the active result contains "([^"]*)"$/, function (subset) {
    return eventuallyAssert(() => this.hasResults(), true).then(() => {
      return wait(100)
    }).then(() => {
      return this.getActiveResult().then((activeResultText) => {
        if (!activeResultText.match(subset)) {
          throw new Error('Expected active result to contain "' + subset + '" but found "' + activeResultText + '"')
        }
      })
    })
  })

  this.Then(/^the results contains "([^"]*)"$/, function (subset) {
    return this.getResults().then((resultText) => {
      if (!resultText.match(subset)) {
        throw new Error('Expected results to contain "' + subset + '"')
      }
    })
  })
}
