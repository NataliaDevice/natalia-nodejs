var noble = require('noble')
var async = require('async')

// var sUUID = '6e400001b5a3f393e0a9e50e24dcca9e'
// var sUUID
var serviceUUID
var peripheralIdOrAddress = 'a6cc000bf19b4e95b1ffa0aeac2e71d8'
var txCharacteristicUUID = '6e400002b5a3f393e0a9e50e24dcca9e'
var rxCharacteristicUUID = '6e400003b5a3f393e0a9e50e24dcca9e'
var txCharacteristic
var rxCharacteristic

var ledPins = [2, 3, 5, 6, 9]

var pinModeObj = {
  unknown: -1,
  input: 0,
  output: 1,
  analog: 2,
  pwm: 3,
  servo: 4
}

var pinStateObj = {
  low: 0,
  high: 1
}
// HIGH buffers
var dataWritePinStateHigh2  = new Buffer(3)
dataWritePinStateHigh2.writeUInt8(0x90, 0)
dataWritePinStateHigh2.writeUInt8(0x04, 1)
dataWritePinStateHigh2.writeUInt8(0x00, 2)

var dataWritePinStateHigh3  = new Buffer(3)
dataWritePinStateHigh3.writeUInt8(0x90, 0)
dataWritePinStateHigh3.writeUInt8(0x0c, 1)
dataWritePinStateHigh3.writeUInt8(0x00, 2)

var dataWritePinStateHigh5  = new Buffer(3)
dataWritePinStateHigh5.writeUInt8(0x90, 0)
dataWritePinStateHigh5.writeUInt8(0x2c, 1)
dataWritePinStateHigh5.writeUInt8(0x00, 2)

var dataWritePinStateHigh6  = new Buffer(3)
dataWritePinStateHigh6.writeUInt8(0x90, 0)
dataWritePinStateHigh6.writeUInt8(0x6c, 1)
dataWritePinStateHigh6.writeUInt8(0x00, 2)

var dataWritePinStateHigh9  = new Buffer(3)
dataWritePinStateHigh9.writeUInt8(0x91, 0)
dataWritePinStateHigh9.writeUInt8(0x02, 1)
dataWritePinStateHigh9.writeUInt8(0x00, 2)

// LOW buffers
var dataWritePinStateLow2  = new Buffer(3)
dataWritePinStateLow2.writeUInt8(0x90, 0)
dataWritePinStateLow2.writeUInt8(0x00, 1)
dataWritePinStateLow2.writeUInt8(0x00, 2)

var dataWritePinStateLow3  = new Buffer(3)
dataWritePinStateLow3.writeUInt8(0x90, 0)
dataWritePinStateLow3.writeUInt8(0x00, 1)
dataWritePinStateLow3.writeUInt8(0x00, 2)

var dataWritePinStateLow5  = new Buffer(3)
dataWritePinStateLow5.writeUInt8(0x90, 0)
dataWritePinStateLow5.writeUInt8(0x00, 1)
dataWritePinStateLow5.writeUInt8(0x00, 2)

var dataWritePinStateLow6  = new Buffer(3)
dataWritePinStateLow6.writeUInt8(0x91, 0)
dataWritePinStateLow6.writeUInt8(0x00, 1)
dataWritePinStateLow6.writeUInt8(0x00, 2)

var dataWritePinStateLow9  = new Buffer(3)
dataWritePinStateLow9.writeUInt8(0x91, 0)
dataWritePinStateLow9.writeUInt8(0x02, 1)
dataWritePinStateLow9.writeUInt8(0x00, 2)

// Constructor
function NataliaClient(sUUID) {
  // always initialize all instance properties
  serviceUUID = sUUID
  this.serviceUUID = serviceUUID
  this.txCharacteristicUUID = txCharacteristicUUID
  this.rxCharacteristicUUID = rxCharacteristicUUID
  this.peripheralIdOrAddress = peripheralIdOrAddress
  this.txCharacteristic = null
  this.rxCharacteristic = null
}

NataliaClient.prototype.setup = function(callback) {
  noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
      noble.startScanning([serviceUUID])
    } else {
      noble.stopScanning()
    }
  })

  //
  noble.on('discover', function(peripheral) {
    // we found a peripheral, stop scanning
    noble.stopScanning();

    //
    // The advertisment data contains a name, power level (if available),
    // certain advertised service uuids, as well as manufacturer data,
    // which could be formatted as an iBeacon.
    //
    console.log('found peripheral:', peripheral.advertisement);
    //
    // Once the peripheral has been discovered, then connect to it.
    // It can also be constructed if the uuid is already known.
    ///
    peripheral.connect(function(err) {
      //
      // Once the peripheral has been connected, then discover the
      // services and characteristics of interest.
      //
      peripheral.discoverServices([serviceUUID], function(err, services) {
        services.forEach(function(service) {
          //
          // This must be the service we were looking for.
          //
          console.log('found service:', service.uuid);

          //
          // So, discover its characteristics.
          //
          service.discoverCharacteristics([], function(err, characteristics) {

            characteristics.forEach(function(characteristic) {
              //
              // Loop through each characteristic and match them to the
              // UUIDs that we know about.
              //
              console.log('found characteristic:', characteristic.uuid);

              if (txCharacteristicUUID == characteristic.uuid) {
                // this.txCharacteristic = characteristic;
                txCharacteristic = characteristic;
                writePinMode(callback)
              }
              else if (rxCharacteristicUUID == characteristic.uuid) {
                // this.rxCharacteristic = characteristic;
                rxCharacteristic = characteristic;
              }
            })
          })
        })
      })
    })
  })
  //
}

NataliaClient.prototype.toggleLED = function(led, state, callback) {
  var pin
  var pinState

  switch (led) {
    case 1:
      pin = 2
      break;
    case 2:
      pin = 3
      break;
    case 3:
      pin = 5
      break;
    case 4:
      pin = 6
      break;
    case 5:
      pin = 9
      break;
  }
  switch(state.toLowerCase()) {
    case 'on':
      var pinState = pinStateObj.high
      break
    case 'off':
      var pinState = pinStateObj.low
      break
  }
  var dataWritePinState = new Buffer(3)
  var data0
  var data1
  var data2
  // first byte
  var port = Math.floor(pin / 8)
  data0 = 0x90 + port
  dataWritePinState.writeUInt8(data0, 0)
  // second byte
  var pinIndex = pin - (port*8)
  // var newMask = UInt8(1 * Int(powf(2, Float(pinIndex)))) //1 is for HIGH pinstate
  var newMask = pinState * Math.pow(2, pinIndex) //1 is for HIGH pinstate
  var portMasks = Array(3)
  portMasks[port] &= ~(1 << pinIndex) //prep the saved mask by zeroing this pin's corresponding bit
  newMask |= portMasks[port] //merge with saved port state
  portMasks[port] = newMask
  data1 = newMask<<1; data1 >>= 1  //remove MSB
  data2 = newMask >> 7 //use data1's MSB as data2's LSB
  dataWritePinState.writeUInt8(data1, 1)
  dataWritePinState.writeUInt8(data2, 2)
  console.log(dataWritePinState)
  txCharacteristic.write(dataWritePinState, false, function(err) {
    if (err) {
      console.log(err)
    }
    if (typeof callback !== "undefined") {
      callback()
    }
  })
}

function writePinMode(callback) {
  async.each(ledPins, function(pin, callback) {
    var dataWritePinMode = new Buffer(3)
    dataWritePinMode.writeUInt8(0xf4, 0)
    dataWritePinMode.writeUInt8(pin, 1)
    dataWritePinMode.writeUInt8(pinModeObj.output, 2) // 1 is for output
    console.log(dataWritePinMode)
    txCharacteristic.write(dataWritePinMode, false, function(err) {
      console.log("wrote pin mode for pin: " + pin)
      // sleep.sleep(2)
      if (err) {
        console.log(err)
      }
    })
  }, function(err) {
    console.log(err)
  })
  if (typeof callback !== "undefined") {
    callback()
  }
}

// export the class
exports.NataliaClient=NataliaClient
