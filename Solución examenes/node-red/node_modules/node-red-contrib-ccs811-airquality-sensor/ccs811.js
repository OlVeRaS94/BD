const i2c = require('i2c-bus');

const ccs811Check = 0x20;
const ccs811StartRegister = 0xF4;
const ccs811StatusRegister = 0x00;
const ccs811MeasurementModeRegister = 0x01;
const ccs811ResultRegister = 0x02;
const ccs811EnvironmentDataRegister = 0x05;
const ccs811BaselineRegister = 0x11;
const ccs811ErrorRegister = 0xe0;
const ccs811FWBootVersionRegister = 0x23;
const ccs811FWAppVersionRegister = 0x24;
const ccs811ResetRegister = 0xFF;

const ccs811MeasurementMode1s = 0b00010000;
const ccs811MeasurementModeOff = 0;
const ccs811MeasurementMode10s = 0b00100000;
const ccs811MeasurementMode60s = 0b00110000;
const ccs811MeasurementModeConst250ms = 0b01000000;


module.exports = function (RED) {
	function CSS811Sensor(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		//console.log("init ccs811", config.CCS811Address);
		let i2cBus = i2c.openSync(parseInt(config.i2cBus));
		let CCS811Address = parseInt(config.CCS811Address);

		function initSensor() {
			//console.time("init");
			let read = null;
			try {
				read = i2cBus.readByteSync(CCS811Address, ccs811Check);
			}
			catch (exc) {
				node.error("No device found at address 0x" + CCS811Address.toString(16));
				return;
			}
			//check if actually a CCS811 sensor
			if (read != 0x81) {
				node.error("No CCS811 sensor detected")
				return;
			}

			//Determine if sensor is already initialized
			read = i2cBus.readByteSync(CCS811Address, ccs811StatusRegister);
			let running = null;
			if ((read & 0b10000000) == 128) {
				//console.log("sensor is running");
				running = true;
			}
			else {
				//console.log("sensor is not running");
				running = false;
			}
			if (!running) {
				//Start sensor
				i2cBus.writeI2cBlockSync(CCS811Address, ccs811StartRegister, 0, Buffer.alloc(0));
			}
			let desiredMeasurementMode = null;
			switch (config.CCS811Mode) {
				case "mode0":
					desiredMeasurementMode = ccs811MeasurementModeOff;
					break;
				case "mode1":
					desiredMeasurementMode = ccs811MeasurementMode1s;
					break;
				case "mode2":
					desiredMeasurementMode = ccs811MeasurementMode10s;
					break;
				case "mode3":
					desiredMeasurementMode = ccs811MeasurementMode60s;
					break;
				case "mode4":
					desiredMeasurementMode = ccs811MeasurementModeConst250ms;
					break;
				default:
					node.warn("Something went wrong with mode selection, Using Mode 1: Measurement every second");
					desiredMeasurementMode = ccs811MeasurementMode1s;
			}

			//Check if sensor is in desired mode
			let mode = i2cBus.readByteSync(CCS811Address, ccs811MeasurementModeRegister);
			if (config.DisableAutomaticBaselineCalibration) {
				//node.warn("automatic calibration disabled");
				desiredMeasurementMode = desiredMeasurementMode | 0b00000010;
				// console.log("meamode:", desiredMeasurementMode.toString(2))
				// console.log("test",0b01010101.toString(2))
			}
			if (mode != desiredMeasurementMode) {
				node.warn("CCS811 was not in desired measurement mode. \nIf you see this message right after startup everything is fine. \nIf you see this messsage during runtime without knowingly changing the mode or resetting, please check wiring or other applications accessing this sensor.")
				i2cBus.writeByteSync(CCS811Address, ccs811MeasurementModeRegister, desiredMeasurementMode)
			}
			//console.timeEnd("init");
		}



		node.on('input', function (msg, send, done) {
			// For maximum backwards compatibility, check that send exists.
			// If this node is installed in Node-RED 0.x, it will need to
			// fallback to using `node.send`
			send = send || function () { node.send.apply(node, arguments) }
			switch (msg.payload) {

				case "getMeasurement":
					initSensor();
					let envReading = Buffer.alloc(8);
					i2cBus.readI2cBlockSync(CCS811Address, ccs811ResultRegister, 8, envReading);
					let eCO2 = envReading[0] * 256 + envReading[1];
					let TVOC = envReading[2] * 256 + envReading[3];
					let statusRegister = envReading[4];
					let statusRegisterString = statusRegister.toString(2).padStart(8, '0');
					let errorRegister = envReading[5];
					let errorRegisterString = errorRegister.toString(2).padStart(8, '0');

					let rawCurrent_uA = envReading[6] >> 2;
					let rawADC = (envReading[6] & 0b00000011) * 256 + envReading[7];
					let rawVoltage_mV = 1650 / 1023 * rawADC;
					msg.payload = {};
					msg.payload.eCO2 = eCO2;
					msg.payload.TVOC = TVOC;
					msg.payload.statusRegister = statusRegister;
					msg.payload.statusRegisterString = statusRegisterString;
					msg.payload.errorRegister = errorRegister;
					msg.payload.errorRegisterString = errorRegisterString;
					msg.payload.rawCurrent_uA = rawCurrent_uA;
					msg.payload.rawADC = rawADC;
					msg.payload.rawVoltage_mV = Math.round(rawVoltage_mV * 100) / 100;
					let resistance = 1.65 * rawADC / (rawCurrent_uA / 1000000 * 1023); //or let MyResistance = (rawVoltage_mV / 1000) / (rawCurrent_uA / 1000000);
					msg.payload.sensorResistanceOhm = Math.round(resistance);
					node.status({fill:"green",shape:"dot",text: "TVOC: " + TVOC + " ppb, eCO2: " + eCO2 + " ppm"});
					send(msg);
					break;

				case "getCalibrationBaseline":
					initSensor();
					let baselineData = Buffer.alloc(2);
					//i2cBus.writeI2cBlockSync(CCS811Address, ccs811BaselineRegister, 0, Buffer.alloc(0));
					i2cBus.readI2cBlockSync(CCS811Address, ccs811BaselineRegister, 2, baselineData);
					msg.payload = {};
					msg.payload.CalibrationBaseline = baselineData;
					msg.payload.CalibrationBaselineStr = "0x" + baselineData[0].toString(16) + " 0x" + baselineData[1].toString(16);
					send(msg);
					break;

				case "setCalibrationBaseline":
					initSensor();
					if (msg.CalibrationBaseline && Buffer.isBuffer(msg.CalibrationBaseline) && msg.CalibrationBaseline.length == 2) {
						i2cBus.writeI2cBlockSync(CCS811Address, ccs811BaselineRegister, 2, msg.CalibrationBaseline);
						msg.payload = {};
						msg.payload.confirmationMessage = "Calibration Baseline sucessfully written to: " + msg.CalibrationBaseline.toString("hex") + " (hex)";
						send(msg);
					}
					else {
						done("Please specify the calibration baseline in msg.CalibrationBaseline as Buffer Object containing 2 Bytes")
					}
					break;

				case "setEnvironmentCalibration":
					initSensor();
					if (msg.Temperature && msg.Humidity) {
						envHumidity = parseFloat(msg.Humidity);
						envTemperature = parseFloat(msg.Temperature);
						if (envHumidity > 100 | envHumidity < 0) {
							node.warn("Humidity must between 0 and 100, set to 50 for calibration")
							envHumidity = 50;
						}
						if (envTemperature < -25 | envTemperature > 50) {
							node.warn("Temperature must between -25 and 50 °C set to 20 for calibration")
							envTemperature = 20;
						}
						envTemperature += 25;
						envTemperature = Math.round(envTemperature * 2);
						envHumidity = Math.round(envHumidity * 2);
						envRegisterData = Buffer.from([envHumidity, 0, envTemperature, 0]);
						i2cBus.writeI2cBlockSync(CCS811Address, ccs811EnvironmentDataRegister, 4, envRegisterData);
						msg.payload = {};
						msg.payload.confirmationMessage = "Environment calibration sucessfully written to: " + envRegisterData.toString("hex") + " (hex)";
						send(msg);
					}
					else {
						done("Please specify the calibration Temperature in msg.Temperature and the Humidity in msg.Humidity")
					}
					break;
				case "getErrorRegister":
					read = i2cBus.readByteSync(CCS811Address, ccs811ErrorRegister);
					msg.payload = {};
					msg.payload.errorRegister = read;
					msg.payload.errorRegisterString = read.toString(2).padStart(8, '0');
					send(msg);
					break;
				case "getFWVersions":
					let fwBootloaderVersion = Buffer.alloc(2);
					i2cBus.readI2cBlockSync(CCS811Address, ccs811FWBootVersionRegister, 2, fwBootloaderVersion);
					let fwBootloaderVersionMajor = fwBootloaderVersion[0] >> 4;
					let fwBootloaderVersionMinor = fwBootloaderVersion[0] & 0b00001111;
					let fwBootloaderVersionTrivial = fwBootloaderVersion[1];
					fwBootloaderVersion = fwBootloaderVersionMajor.toString(10) + "." + fwBootloaderVersionMinor.toString(10) + "." + fwBootloaderVersionTrivial;


					let fwAppVersion = Buffer.alloc(2);
					i2cBus.readI2cBlockSync(CCS811Address, ccs811FWAppVersionRegister, 2, fwAppVersion);
					let fwAppVersionMajor = fwAppVersion[0] >> 4;
					let fwAppVersionMinor = fwAppVersion[0] & 0b00001111;
					let fwAppVersionTrivial = fwAppVersion[1];
					fwAppVersion = fwAppVersionMajor.toString(10) + "." + fwAppVersionMinor.toString(10) + "." + fwAppVersionTrivial;

					msg.payload = {};
					msg.payload.BootloaderVersion = fwBootloaderVersion;
					msg.payload.AppVersion = fwAppVersion;
					send(msg);

					break;

				case "reset":
					resetCode = Buffer.from([0x11, 0xE5, 0x72, 0x8A])
					i2cBus.writeI2cBlockSync(CCS811Address, ccs811ResetRegister, 4, resetCode);
					msg.payload = {};
					msg.payload.confirmationMessage = "Sensor successfully reset";
					send(msg);
					break;

				default:
					node.status({fill:"red",shape:"ring",text: "Invalid input"});
					done("Invalid input. Please see Node's help");

			}

			if (done) {
				done();
			}
		});



		node.on('close', function () {
			//node.warn("closing");
			//console.log("beende node");
			//node.port.close();
		});
	}
	RED.nodes.registerType("CCS811-airquality-sensor", CSS811Sensor);
}
