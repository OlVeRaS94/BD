# CCS811 Air Quality sensor controling with NodeRED

With this node you can read and manage the AMS / Sciosense CCS811 air quality sensor.

## Installation and Prerequisites

This sensor uses so called clock-stretching. Raspberry PI does not support this. To use this sensor you have to
reduce baud-rate of i2c interface to 10.000 bauds. To do so add `dtparam=i2c_baudrate=10000` in `/boot/config.txt`. Raspberry PI 4 allows to use software defined i2c-Bus. It is said
that this one supports clock-stretching. If you have other devices needing high speed i2c-Bus this may be an option for you. 
Of course i2c must be generally enabled in raspi-config or via `dtparam=i2c_arm=on` in `/boot/config.txt`

<b><u>Warning</u></b>: Sensor may work without reducing interface baud rate, but it looks like it stopped working all of a sudden. So please ensure you've reduced baud-rate.

## Wiring of CCS811 sensor on Raspberry PI
	
CCS811 address is either 0x5A or 0x5B. Find out via `i2cdetect -y 1`. If command can't be found, install via `sudo apt-get install i2c-tools`

Note PIN numbers refer to 40 PIN GPIO headers version of Raspberry PI, which are most models.

Connect 3.3 V (PIN 1) to VCC of CCS811 sensor.

Connect SDA (PIN 3) to SDA of CCS811 sensor.

Connect SCL (PIN 5) to SCL of CCS811 sensor.

Connect GND (e.g. PIN 9) to GND of CCS811 sensor and also to WAK.

Without WAK beeing connected to GND sensor stays completely offline and can't even be dected on I2C-Bus. 

For GND you can use these PINs:
* 6
* 9
* 14
* 20
* 25
* 30
* 34
* 39


## Usage
Set `msg.payload` to `getMeasurement` to get current TVOC and eCO2 measurements. See all possible commands in the node’s help tab. 

This node allows a sophisticated management of your sensor. You can read and restore calibration baseline for example and also can set the ambient temperature and humidity for getting more accurate results.

## License
GPLv3