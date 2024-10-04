# node-red-grovepi-nodes-th

Node-RED nodes to control GrovePi+ Starter Kit sensors for Raspberry Pi.
Based on [Memet Olsens work](https://github.com/memetolsen/node-red-grovepi-nodes), but updated and using the
`node-grovepi-th` package as a basis.

Install via npm
---------------

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red)
> npm install node-red-grovepi-nodes-th


Usage
-----

After installing this package and running Node-RED, the GrovePi+ sensors and actuators will be available in your
Node-RED environment. Connect your sensor to the GrovePi board, select the port number on the node and deploy your flow.


Sensors
-------

Every sensor that comes with the GrovePi+ Starter Kit is supported. These sensors are:

* Buzzer
* Button
* LED (red, green & blue)
* Sound
* Relay
* Ultrasonic Ranger
* Temperature Humidity
* Rotary Angle
* RGB Backlit LCD
* Light
