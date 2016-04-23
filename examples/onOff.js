var natalia = require('../index')
var nataliaCilent = new natalia.NataliaClient('6e400001b5a3f393e0a9e50e24dcca9e')
var util = require('util')
var sleep = require('sleep')

// Discovers device and setup
nataliaCilent.setup(function() {
  console.log("setup complete")
})

// Turn LED on and off every 5 seconds
setInterval(function() {
  nataliaCilent.toggleLED(1, 'on', function() {
    sleep.sleep(1)
    nataliaCilent.toggleLED(1, 'off')
  })
}, 5000)
