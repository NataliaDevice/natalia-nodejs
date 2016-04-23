# Node.js wrapper for Natalia
Node.js wrapper that wrapper provides simple connection, setup, and toggling of LEDs on Natalia.

### Installation
```bash
npm install --save git+https://github.com/NataliaDevice/natalia-nodejs.git
```

### Include it
```js
var natalia = require('natalia')
var nataliaClient = new natalia.NataliaClient('SERVICE_UUID')
```
Where you replace the `'SERVICE_UUID'` with your devices service UUID.

### Setup
```js
nataliaClient.setup(function() {
  console.log("Setup complete")
})
```
This discovers your device and performs the proper setup for the device to turn LEDs on and off.

### Toggle LEDs
Takes 3 parameters, in this order:
* LED number (*required*)
  * Values accepted `1`, `2`, `3`, `4`, or `5`
* Toggle value (*required*)
  * Values accepted `'on'` or `'off'`
* Callback function (*optional*)

#### Turn on an LED
Without a callback
```js
nataliaClient.toggleLED(1, 'on')
```
With a callback
```js
nataliaClient.toggleLED(1, 'on', function() {
  console.log('LED turned on!')
})
```
#### Turn off an LED
Without a callback
```js
nataliaClient.toggleLED(1, 'off')
```
With a callback
```js
nataliaClient.toggleLED(1, 'off', function() {
  console.log('LED turned off!')
})
```
