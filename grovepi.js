/**
 * Copyright 2016 Memet Olsen - ICT Automatisering B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
const GrovePi = require('node-grovepi').GrovePi;
const i2c = require('i2c-bus');

const Commands = GrovePi.commands;
const Board = GrovePi.board;

const Analog = GrovePi.sensors.base.Analog;
const Digital = GrovePi.sensors.base.Digital;


const DISPLAY_RGB_ADDR = 0x62;
const DISPLAY_TEXT_ADDR = 0x3e;

function setRGB(i2c1, r, g, b) {
    i2c1.writeByteSync(DISPLAY_RGB_ADDR, 0, 0)
    i2c1.writeByteSync(DISPLAY_RGB_ADDR, 1, 0)
    i2c1.writeByteSync(DISPLAY_RGB_ADDR, 0x08, 0xaa)
    i2c1.writeByteSync(DISPLAY_RGB_ADDR, 4, r)
    i2c1.writeByteSync(DISPLAY_RGB_ADDR, 3, g)
    i2c1.writeByteSync(DISPLAY_RGB_ADDR, 2, b)
}

function textCommand(i2c1, cmd) {
    i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x80, cmd);
}

function setText(i2c1, text) {
    textCommand(i2c1, 0x01) // clear display
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50)
    textCommand(i2c1, 0x08 | 0x04) // display on, no cursor
    textCommand(i2c1, 0x28) // 2 lines
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50)
    let count = 0;
    let row = 0;
    let i = 0;
    const len = text.length;
    for (; i < len; i++) {
        if (text[i] === '\n' || count === 16) {
            count = 0;
            row++;
            if (row === 2)
                break;
            textCommand(i2c1, 0xc0)
            if (text[i] === '\n')
                continue;
        }
        count++;
        i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x40, text[i].charCodeAt(0));
    }
}


module.exports = function (RED) {
    const board = new Board({
        debug: true,
        onError: function (err) {
            console.error('GrovePiBoard.js: Something went wrong');
            console.error(err)
        },
        onInit: function (res) {
        }
    });

    board.init();

    const fs = require('fs');

    if (!fs.existsSync("/dev/ttyAMA0")) { // unlikely if not on a Pi
        throw "Info : Node ignored because /dev/ttyAMA0 doesn't exist.";
    }

    function Led(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        node.status({fill: "green", shape: "dot", text: "ok"});
        const analog = new Analog(node.pin);
        board.pinMode(node.pin, 'output');

        function inputlistener(msg) {
            const out = Number(msg.payload);
            const limit = 255;

            if ((out >= 0) && (out <= limit)) {
                if (RED.settings.verbose) {
                    node.log("out: " + msg.payload);
                }
                analog.write(out);
                node.buttonState = out;
                node.status({fill: "green", shape: "dot", text: out.toString()});
            } else {
                node.warn("Invalid input: " + out);
            }
        }

        if (node.pin !== undefined) {
            node.running = true;
            node.status({fill: "green", shape: "dot", text: "ok"});

            node.on("input", inputlistener);

        } else {
            node.warn("Invalid port: " + node.pin);
        }

        node.on("close", function (done) {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });

        });
    }

    RED.nodes.registerType("grovepi-led", Led);


    function Relay(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        node.status({fill: "green", shape: "dot", text: "ok"});
        const digital = new Digital(node.pin);

        board.pinMode(node.pin, 'output');

        function inputlistener(msg) {
            const out = Number(msg.payload);

            if (out === 0 || out === 1) {
                if (RED.settings.verbose) {
                    node.log("out: " + msg.payload);
                }
                digital.write(out);
                node.buttonState = out;
                node.status({fill: "green", shape: "dot", text: out.toString()});
            } else {
                node.warn("Invalid port: " + out);
            }
        }

        if (node.pin !== undefined) {
            node.running = true;
            node.status({fill: "green", shape: "dot", text: "ok"});

            node.on("input", inputlistener);
        } else {
            node.warn("Invalid port: " + node.pin);
        }

        node.on("close", function (done) {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
        });
    }

    RED.nodes.registerType("grovepi-relay", Relay);


    function Buzzer(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        node.status({fill: "green", shape: "dot", text: "ok"});
        const digital = new Digital(node.pin);

        board.pinMode(node.pin, 'output');

        function inputlistener(msg) {
            const out = Number(msg.payload);

            if (out === 0 || out === 1) {
                if (RED.settings.verbose) {
                    node.log("out: " + msg.payload);
                }
                digital.write(out);
                node.buttonState = out;
                node.status({fill: "green", shape: "dot", text: out.toString()});
            } else {
                node.warn("Invalid port: " + out);
            }
        }

        if (node.pin !== undefined) {
            node.running = true;
            node.status({fill: "green", shape: "dot", text: "ok"});

            node.on("input", inputlistener);
        } else {
            node.warn("Invalid port: " + node.pin);
        }

        node.on("close", function (done) {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
        });
    }

    RED.nodes.registerType("grovepi-buzzer", Buzzer);


    function LcdRgb(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        this.sensor = n.sensor;

        node.status({fill: "green", shape: "dot", text: "ok"});

        function inputlistener(msg) {
            const payload = msg.payload;
            if (typeof payload === 'undefined') {
                node.warn("Invalid payload: undefined");
                return;
            }

            if (typeof payload.rgb !== 'undefined' && payload.rgb.length === 3) {
                const i2c1 = i2c.openSync(1);
                setRGB(i2c1, payload.rgb[0], payload.rgb[1], payload.rgb[2]);
                i2c1.closeSync();
            } else if (typeof payload.rgb !== 'undefined') {
                node.warn("Invalid payload.rgb:  " + payload.rgb);
            }

            if (typeof payload.text !== 'undefined') {
                const i2c2 = i2c.openSync(1);
                setText(i2c2, payload.text.toString());
                i2c2.closeSync();
                node.status({fill: "green", shape: "dot", text: payload.text.toString()});
            }
        }

        node.running = true;
        node.status({fill: "green", shape: "dot", text: "ok"});

        node.on("input", inputlistener);

        node.on("close", function (done) {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
        });
    }

    RED.nodes.registerType("grovepi-lcd-rgb", LcdRgb);


    function UltrasonicRangerSensor(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        board.pinMode(node.pin, 'input');
        let oldVal;
        const interval = setInterval(function () {

            let value;
            const write = board.writeBytes(Commands.uRead.concat([node.pin, Commands.unused, Commands.unused]));
            if (write) {
                board.wait(200)
                board.readByte()
                const bytes = board.readBytes();
                if (bytes instanceof Buffer)
                    value = (bytes[1] * 256 + bytes[2])
                else
                    value = false
            } else {
                value = false
            }

            if (typeof value !== 'undefined' && value !== false && value !== oldVal) {
                node.send({topic: "pi/" + node.pin, payload: value});
                node.buttonState = value;
                node.status({fill: "green", shape: "dot", text: value.toString()});
                oldVal = value;
            }
        }, 100);

        node.on("close", function (done) {
            clearInterval(interval);
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
        });
    }

    RED.nodes.registerType("grovepi-ultrasonic", UltrasonicRangerSensor);


    function RotaryAngleSensor(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        board.pinMode(node.pin, 'input');
        let oldVal;
        const interval = setInterval(function () {
            let value;
            const writeRet = board.writeBytes(Commands.aRead.concat([node.pin, Commands.unused, Commands.unused]));
            if (writeRet) {
                board.readByte();
                const bytes = board.readBytes();
                if (bytes instanceof Buffer) {
                    value = bytes[1] * 256 + bytes[2]
                } else {
                    value = false;
                }
            } else {
                value = false;
            }

            if (typeof value !== 'undefined' && value !== false && value !== oldVal) {
                node.send({topic: "pi/" + node.pin, payload: value});
                node.buttonState = value;
                node.status({fill: "green", shape: "dot", text: value.toString()});
                oldVal = value;
            }
        }, 100);

        node.on('close', function () {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
            clearInterval(interval);
        });
    }

    RED.nodes.registerType("grovepi-rotary", RotaryAngleSensor);


    function LightSensor(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        board.pinMode(node.pin, 'input');
        let oldVal;
        const interval = setInterval(function () {
            let value;
            const writeRet = board.writeBytes(Commands.aRead.concat([node.pin, Commands.unused, Commands.unused]));
            if (writeRet) {
                board.readByte();
                const bytes = board.readBytes();
                if (bytes instanceof Buffer) {
                    value = bytes[1] * 256 + bytes[2]
                } else {
                    value = false;
                }
            } else {
                value = false;
            }

            if (typeof value !== 'undefined' && value !== false && value !== oldVal) {
                node.send({topic: "pi/" + node.pin, payload: value});
                node.buttonState = value;
                node.status({fill: "green", shape: "dot", text: value.toString()});
                oldVal = value;
            }
        }, 100);

        node.on('close', function () {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
            clearInterval(interval);
        });
    }

    RED.nodes.registerType("grovepi-light", LightSensor);


    function Button(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        const digital = new Digital(node.pin);
        board.pinMode(node.pin, 'input');

        let oldVal;
        const interval = setInterval(function () {
            let value;

            const writeRet = board.writeBytes(Commands.dRead.concat([node.pin, Commands.unused, Commands.unused]));
            if (writeRet) {
                board.wait(100)
                value = board.readByte()[0]
            } else {
                value = false
            }

            if (typeof value !== 'undefined' && value !== false && value !== oldVal) {
                node.send({topic: "pi/" + node.pin, payload: value});
                node.buttonState = value;
                node.status({fill: "green", shape: "dot", text: value.toString()});
                oldVal = value;
            }
        }, 100);

        node.on('close', function () {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
            clearInterval(interval);
        });

    }

    RED.nodes.registerType("grovepi-button", Button);


    function SoundSensor(n) {
        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        board.pinMode(node.pin, 'input');
        let oldVal;
        const interval = setInterval(function () {
            let value;
            const writeRet = board.writeBytes(Commands.aRead.concat([node.pin, Commands.unused, Commands.unused]));
            if (writeRet) {
                board.readByte();
                const bytes = board.readBytes();
                if (bytes instanceof Buffer) {
                    value = bytes[1] * 256 + bytes[2]
                } else {
                    value = false;
                }
            } else {
                value = false;
            }

            if (typeof value !== 'undefined' && value !== false && value !== oldVal) {
                node.send({topic: "pi/" + node.pin, payload: value});
                node.buttonState = value;
                node.status({fill: "green", shape: "dot", text: value.toString()});
                oldVal = value;
            }
        }, 100);

        node.on('close', function () {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
            clearInterval(interval);
        });
    }

    RED.nodes.registerType("grovepi-sound", SoundSensor);


    function TemperatureSensor(n) {
        function convertCtoF(temp) {
            return temp * 9 / 5 + 32
        }

        function convertFtoC(temp) {
            return (temp - 32) * 5 / 9
        }

        function getHeatIndex(temp, hum, scale) {
            const needsConversion = typeof scale == 'undefined' || scale == DHTDigitalSensor.CELSIUS;

            temp = needsConversion ? convertCtoF(temp) : temp

            const hi = -42.379 +
                2.04901523 * temp +
                10.14333127 * hum +
                -0.22475541 * temp * hum +
                -0.00683783 * Math.pow(temp, 2) +
                -0.05481717 * Math.pow(hum, 2) +
                0.00122874 * Math.pow(temp, 2) * hum +
                0.00085282 * temp * Math.pow(hum, 2) +
                -0.00000199 * Math.pow(temp, 2) * Math.pow(hum, 2);

            return needsConversion ? convertFtoC(hi) : hi
        }

        RED.nodes.createNode(this, n);
        this.pin = n.pin;
        this.sensor = n.sensor;
        const node = this;

        board.pinMode(node.pin, 'input');
        let oldVal = [0, 0, 0];
        const interval = setInterval(function () {
            let value;

            const write = board.writeBytes(Commands.dht_temp.concat([node.pin, Commands.unused, Commands.unused]));
            if (write) {
                board.wait(500)
                board.readByte()
                board.wait(200)
                const bytes = board.readBytes(9);
                if (bytes instanceof Buffer) {
                    let hex;
                    const tempBytes = bytes.slice(1, 5).reverse();
                    const humBytes = bytes.slice(5, 9).reverse();

                    hex = '0x' + tempBytes.toString('hex')
                    let temp = (hex & 0x7fffff | 0x800000) * 1.0 / Math.pow(2, 23) * Math.pow(2, ((hex >> 23 & 0xff) - 127));
                    temp = +(Number(parseFloat(temp - 0.5).toFixed(2)))

                    hex = '0x' + humBytes.toString('hex')
                    let hum = (hex & 0x7fffff | 0x800000) * 1.0 / Math.pow(2, 23) * Math.pow(2, ((hex >> 23 & 0xff) - 127));
                    hum = +(Number(parseFloat(hum - 2).toFixed(2)))

                    const heatIndex = +(Number(parseFloat(getHeatIndex(temp, hum, this.scale)).toFixed(2)));
                    value = [temp, hum, heatIndex];
                } else
                    value = false;
            } else {
                value = false;
            }
            if (typeof value !== 'undefined' && value !== false && value.join(',') !== oldVal.join(',')) {
                node.send({topic: "pi/" + node.pin, payload: value});
                node.buttonState = value;
                node.status({fill: "green", shape: "dot", text: value.toString()});
                oldVal = value;
            }
        }, 1000);

        node.on('close', function () {
            node.status({fill: "grey", shape: "ring", text: "Closed"});
            this.sensor(function () {
                done();
            });
            clearInterval(interval);
        });
    }

    RED.nodes.registerType("grovepi-temperature", TemperatureSensor);
}
