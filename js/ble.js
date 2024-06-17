let ledCharacteristic = null;
const connectToBle = async () => {
    try {
        log('Requesting any Bluetooth Device...');
        const optionalServices = ['00001553-1212-efde-1523-785feabcd123'];
        const device = await navigator.bluetooth.requestDevice(
            { filters: [ { services: ["00001553-1212-efde-1523-785feabcd123"] } ] }
        );
    
        log('Connecting to GATT Server...');
        const server = await device.gatt.connect();
    
        // Note that we could also get all services that match a specific UUID by
        // passing it to getPrimaryServices().
        log('Getting Services...');
        const services = await server.getPrimaryServices('00001553-1212-efde-1523-785feabcd123');
    
        log('Getting Characteristics...');
        for (const service of services) {
          log('> Service: ' + service.uuid);
          const characteristics = await service.getCharacteristics();
    
          characteristics.forEach(characteristic => {
            log('>> Characteristic: ' + characteristic.uuid + ' ' +
                getSupportedProperties(characteristic));
            if (characteristic.uuid === '00001554-1212-efde-1523-785feabcd123') {
                ledCharacteristic = characteristic;
            }
          });
        }
    } catch(error) {
        log('Argh! ' + error);
    }
};


/* Utils */

const getSupportedProperties = (characteristic) => {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
};

const log = (str) => {
    const logElm = document.getElementById('log');
    logElm.innerText += `${str}\n`;
};

const turnOnLed = async () => {
    if (!ledCharacteristic) return;
    let value = new Uint8Array([1]);
    const ret = await ledCharacteristic.writeValueWithResponse(value);
    log(ret);
};

const turnOffLed = async () => {
    if (!ledCharacteristic) return;
    const encoder = new TextEncoder();
    const value = encoder.encode("off");
    const ret = await ledCharacteristic.writeValueWithResponse(value);
    log(ret);
};

const turnRedLed = async () => {
    if (!ledCharacteristic) return;
    const encoder = new TextEncoder();
    const value = encoder.encode("red");
    const ret = await ledCharacteristic.writeValueWithResponse(value);
    log(ret);
};

const turnGreenLed = async () => {
    if (!ledCharacteristic) return;
    const encoder = new TextEncoder();
    const value = encoder.encode("green");
    const ret = await ledCharacteristic.writeValueWithResponse(value);
    log(ret);
};

const turnBlueLed = async () => {
    if (!ledCharacteristic) return;
    const encoder = new TextEncoder();
    const value = encoder.encode("blue");
    const ret = await ledCharacteristic.writeValueWithResponse(value);
    log(ret);
};

const sendText = async () => {
    if (!ledCharacteristic) return;
    const str = document.getElementById('text_value').value;
    if (str.length === 0) return;
    const encoder = new TextEncoder();
    const value = encoder.encode(str);
    const ret = await ledCharacteristic.writeValueWithResponse(value);
    log(ret);
};

const handleSliderChanged = async () => {
    const brightness = document.getElementById('brightness').value;
    const encoder = new TextEncoder();
    const value = encoder.encode(brightness);
    const ret = await ledCharacteristic.writeValueWithResponse(value);
    log(brightness);
};

window.onload = () => {
}
