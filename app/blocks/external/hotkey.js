const globalEmitter = require('../../lib/globalEmitter')
const ExternalBlock = require('../externalBlock')

class Hotkey extends ExternalBlock {
  constructor (data, options) {
    super(data, options)
    this.name = data.name
    this.connections = data.connections || []
    this.hotkey = options[this.name] ? options[this.name] : data.hotkey
  }

  start () {
    globalEmitter.emit('registerHotkey', this.hotkey)
    globalEmitter.on('triggerHotkey', (accelerator) => {
      if (this.hotkey === accelerator) {
        this.logger.log('info', 'Hotkey triggered', { accelerator })
        this.handle()
      }
    })
  }

  handle () {
    this.emit('actioned')
  }
}

module.exports = Hotkey
