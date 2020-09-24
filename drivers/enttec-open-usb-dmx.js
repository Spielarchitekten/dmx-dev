"use strict"

var SerialPort = require("serialport")
const util = require('util');
const EventEmitter = require('events').EventEmitter;

function EnttecOpenUsbDMX(device_id, options) {


	// debugging: find the correct path
	SerialPort.list(function (err, ports) {
		console.log("\nUSB interfaces found:\n");
	  ports.forEach(function(port) {
			if ( port.comName.indexOf("/dev/") !== -1 ) {
	    	console.log(port.comName);
			}
	  });
	});
	

	var self = this
	options = options || {}

	this.universe = new Buffer(513)
	this.universe.fill(0)
	self.interval = 46

	this.dev = new SerialPort(device_id, {
		'baudrate': 250000,
		'databits': 8,
		'stopbits': 2,
		'parity': 'none'
	}, function(err) {
		if(err) {
			console.log(err)
			return
		}
		self.start()
	})
}

EnttecOpenUsbDMX.prototype.send_universe = function() {
	var self = this
	if(!this.dev.writable) {
		return
	}

	// toggle break
	self.dev.set({brk: true, rts: true}, function(err, r) {
		setTimeout(function() {
			self.dev.set({brk: false, rts: true}, function(err, r) {
				setTimeout(function() {
					self.dev.write(Buffer.concat([Buffer([0]), self.universe.slice(1)]))
				}, 1)
			})
		}, 1)
	})
}

EnttecOpenUsbDMX.prototype.start = function() {
	this.intervalhandle = setInterval(this.send_universe.bind(this), this.interval)
}

EnttecOpenUsbDMX.prototype.stop = function() {
	clearInterval(this.intervalhandle)
}

EnttecOpenUsbDMX.prototype.close = function(cb) {
	this.stop()
	this.dev.close(cb)
}

EnttecOpenUsbDMX.prototype.update = function(u) {
	console.log("\nEnttecOpenUsbDMX update: ", u);
	for(var c in u) {
		this.universe[c] = u[c]
	}
	// this.emit('update',u);
}

EnttecOpenUsbDMX.prototype.updateAll = function(v) {
	console.log("\nEnttecOpenUsbDMX updateAll: ", v);
	for(var i = 0; i < 512; i++) {
		this.universe[i] = v
	}
}

EnttecOpenUsbDMX.prototype.get = function(c) {
	return this.universe[c]
}

// util.inherits(EnttecOpenUsbDMX, EventEmitter);
module.exports = EnttecOpenUsbDMX
