class CommandBlocklyElement extends BlocklyElement {
    _stroke = '#176cbf';
    _fill = '#1e90ff';
    _width = 235;

    d() {
        return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h ${this._width} a 4 4 0 0,1 4,4  v 8  V 44  V 44 a 4 4 0 0,1 -4,4  h -${this._width}  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
    }
}

class PauseBlocklyElement extends CommandBlocklyElement {
    _width = 190

    _waitStartFrom = null;

    _foreignObject = null;
    _waitInMsInputWrapper = null;
    _waitInMsInput = null;
    _waitInMs = 500;

    d() {
        const extraH = this._waitInMsInput ? Math.max(0, (`${this._waitInMsInput.value}`.length - 3) * 10) : 0;
        if (this._waitInMsInput) {
            this._foreignObject.setAttribute('width', 74 + extraH);
            this._waitInMsInput.style.width = `${74 + extraH}px`;
        }
        return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h ${this._width + extraH} a 4 4 0 0,1 4,4  v 8  V 44  V 44 a 4 4 0 0,1 -4,4  h -${this._width + extraH}  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
    }

    generateInnerElement() {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', 'translate(8, 16.5)');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.classList.add('blocklyText');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('x', 0);
        text.setAttribute('y', 9.5);
        text.innerHTML = '一時停止 (ミリ秒)';
        g.appendChild(text);

        this._foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        this._foreignObject.setAttribute('x', 148);
        this._foreignObject.setAttribute('y', -8);
        this._foreignObject.setAttribute('width', 74);
        this._foreignObject.setAttribute('height', 32);
        g.appendChild(this._foreignObject);

        this._waitInMsInputWrapper = document.createElement('div');
        this._waitInMsInputWrapper.className = 'wait-in-ms-wrapper';
        this._foreignObject.appendChild(this._waitInMsInputWrapper);

        this._waitInMsInput = document.createElement('input');
        this._waitInMsInput.value = this._waitInMs;
        this._waitInMsInput.setAttribute('type', 'number');
        this._waitInMsInput.setAttribute('min', 1);
        this._waitInMsInput.setAttribute('step', 1);
        this._waitInMsInput.addEventListener('focus', (e) => {
            e.target.select();
            e.target.parentNode.classList.add('focused');
        });
        this._waitInMsInput.addEventListener('blur', (e) => {
            e.target.parentNode.classList.remove('focused');
        });
        this._waitInMsInput.addEventListener('input', (e) => {
            this.render();
        });
        this._waitInMsInput.addEventListener('change', (e) => {
            if (e.target.value.length === 0) {
                e.target.value = this._waitInMs;
            } else {
                this._waitInMs = Math.floor(e.target.value);
                e.target.value = this._waitInMs;
            }
        });
        this._waitInMsInput.className = 'wait-in-ms non-draggable';
        this._waitInMsInputWrapper.appendChild(this._waitInMsInput);

        return g;
    }

    generateCode(level) {
        this._element.classList.remove('blockly-disabled');
        return this.generateIndent(level) + `delay(${this._waitInMs});\n`;
    }

    executeSimulator(elapsedTime) {
        if (!this._waitStartFrom) {
            this._waitStartFrom = elapsedTime;
            return [this, false];
        }
        if (elapsedTime - this._waitStartFrom >= this._waitInMs) {
            this._waitStartFrom = null;
            return [this, true];
        } else {
            return [this, false];
        }
    }
}

class TurnOnAllLedsWithColorsBlocklyElement extends CommandBlocklyElement {
    _width = 340;

    _colors = {
        led1: {r: 255, g: 0, b: 0},
        led2: {r: 0, g: 255, b: 0},
        led3: {r: 0, g: 0, b: 255},
        led4: {r: 255, g: 255, b: 255}
    }

    _onFocus = (e) => {
        e.target.jscolor.option('palette', Editor.colorPalette);
    }

    _onBlur = (e) => {
        if (Editor.colorPalette.indexOf(e.target.value) < 0) {
            Editor.colorPalette.shift();
            Editor.colorPalette.push(e.target.value);
        }
    }

    _onChange = (e) => {
        const color = e.target.value;
        const led = e.target.getAttribute('data-led');
        this._colors[led].r = parseInt(color.slice(1, 3), 16);
        this._colors[led].g = parseInt(color.slice(3, 5), 16);
        this._colors[led].b = parseInt(color.slice(5, 7), 16);
    }

    generateInnerElement() {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', 'translate(8, 16.5)');

        const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text1.classList.add('blocklyText');
        text1.setAttribute('dominant-baseline', 'central');
        text1.setAttribute('x', 0);
        text1.setAttribute('y', 9.5);
        text1.innerHTML = 'すべてのLEDを';
        g.appendChild(text1);

        const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text2.classList.add('blocklyText');
        text2.setAttribute('dominant-baseline', 'central');
        text2.setAttribute('x', 260);
        text2.setAttribute('y', 9.5);
        text2.innerHTML = 'の色で点灯する';
        g.appendChild(text2);

        const fObj1 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fObj1.setAttribute('x', 114);
        fObj1.setAttribute('y', -8);
        fObj1.setAttribute('width', 32);
        fObj1.setAttribute('height', 32);
        g.appendChild(fObj1);

        const color1 = document.createElement('input');
        color1.className = 'color non-draggable';
        color1.setAttribute('data-led', 'led1');
        color1.setAttribute('data-jscolor', '{value: "#ff0000"}');
        color1.style.width = '32px';
        color1.style.height = '32px';
        fObj1.appendChild(color1);

        const fObj2 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fObj2.setAttribute('x', 150);
        fObj2.setAttribute('y', -8);
        fObj2.setAttribute('width', 32);
        fObj2.setAttribute('height', 32);
        g.appendChild(fObj2);

        const color2 = document.createElement('input');
        color2.className = 'color non-draggable';
        color2.setAttribute('data-led', 'led2');
        color2.setAttribute('data-jscolor', '{value: "#00ff00"}');
        color2.style.width = '32px';
        color2.style.height = '32px';
        fObj2.appendChild(color2);

        const fObj3 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fObj3.setAttribute('x', 186);
        fObj3.setAttribute('y', -8);
        fObj3.setAttribute('width', 32);
        fObj3.setAttribute('height', 32);
        g.appendChild(fObj3);

        const color3 = document.createElement('input');
        color3.className = 'color non-draggable';
        color3.setAttribute('data-led', 'led3');
        color3.setAttribute('data-jscolor', '{value: "#0000ff"}');
        color3.style.width = '32px';
        color3.style.height = '32px';
        color3.value = '#0000ff';
        fObj3.appendChild(color3);

        const fObj4 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fObj4.setAttribute('x', 222);
        fObj4.setAttribute('y', -8);
        fObj4.setAttribute('width', 32);
        fObj4.setAttribute('height', 32);
        g.appendChild(fObj4);

        const color4 = document.createElement('input');
        color4.className = 'color non-draggable';
        color4.setAttribute('data-led', 'led4');
        color4.setAttribute('data-jscolor', '{value: "#ffffff"}');
        color4.style.width = '32px';
        color4.style.height = '32px';
        color4.value = '#ffffff';
        fObj4.appendChild(color4);

        const block = this;
        g.querySelectorAll('input.color').forEach((input) => {
            input.addEventListener('focus', block._onFocus);
            input.addEventListener('blur', block._onBlur);
            input.addEventListener('change', block._onChange);
        })

        setTimeout(() => {
            jscolor.presets.default = {
                preset: "dark",
                backgroundColor: '#333',
                width: 250,
                palette: Editor.colorPalette,
                forceStyle: false,
            };
            jscolor.install();
        }, 1);

        return g;
    }

    generateCode(level) {
        this._element.classList.remove('blockly-disabled');
        const indent = this.generateIndent(level);
        let code = '';
        code += indent + `pixels.setPixelColor(0, pixels.Color(${this._colors.led1.r}, ${this._colors.led1.g}, ${this._colors.led1.b}));\n`
        code += indent + `pixels.setPixelColor(1, pixels.Color(${this._colors.led2.r}, ${this._colors.led2.g}, ${this._colors.led2.b}));\n`
        code += indent + `pixels.setPixelColor(2, pixels.Color(${this._colors.led3.r}, ${this._colors.led3.g}, ${this._colors.led3.b}));\n`
        code += indent + `pixels.setPixelColor(3, pixels.Color(${this._colors.led4.r}, ${this._colors.led4.g}, ${this._colors.led4.b}));\n`
        code += indent + 'pixels.show();\n';
        return code;
    }

    executeSimulator(elapsedTime) {
        document.getElementById('led1').style.fill = `rgb(${this._colors.led1.r}, ${this._colors.led1.g}, ${this._colors.led1.b})`;
        document.getElementById('led2').style.fill = `rgb(${this._colors.led2.r}, ${this._colors.led2.g}, ${this._colors.led2.b})`;
        document.getElementById('led3').style.fill = `rgb(${this._colors.led3.r}, ${this._colors.led3.g}, ${this._colors.led3.b})`;
        document.getElementById('led4').style.fill = `rgb(${this._colors.led4.r}, ${this._colors.led4.g}, ${this._colors.led4.b})`;
        return [this, true];
    }
}

class TurnOffAllLedsBlocklyElement extends CommandBlocklyElement {
    _width = 110;

    generateInnerElement() {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', 'translate(8, 16.5)');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.classList.add('blocklyText');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('x', 0);
        text.setAttribute('y', 9.5);
        text.innerHTML = 'すべてのLEDを消す';
        g.appendChild(text);
        return g;
    }

    generateCode(level) {
        this._element.classList.remove('blockly-disabled');
        const indent = this.generateIndent(level);
        let code = '';
        code += indent + 'pixels.clear();\n';
        code += indent + 'pixels.show();\n';
        return code;
    }

    executeSimulator(elapsedTime) {
        document.getElementById('led1').style.fill = '#CECECE';
        document.getElementById('led2').style.fill = '#CECECE';
        document.getElementById('led3').style.fill = '#CECECE';
        document.getElementById('led4').style.fill = '#CECECE';
        return [this, true];
    }
}
