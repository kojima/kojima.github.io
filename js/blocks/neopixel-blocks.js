class NeopixelBlocklyElement extends CommandBlocklyElement {
    _stroke = '#00183c';
    _fill = '#002050';

    _convertRgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s
          ? l === r
            ? (g - b) / s
            : l === g
              ? 2 + (b - r) / s
              : 4 + (r - g) / s
          : 0;
        return {
          h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
          s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
          l: (100 * (2 * l - s)) / 2
        };
    };

    _mix = (a, b, t) => { return a + (b - a) * t; }
    _step = (e, x) => { return x < e ? 0.0 : 1.0; }
    _convertRgbToHsv = (r, g, b) => {
      let s = this._step(b, g);
      const px = this._mix(b, g, s);
      const py = this._mix(g, b, s);
      const pz = this._mix(-1.0, 0.0, s);
      const pw = this._mix(0.6666666, -0.3333333, s);
      s = this._step(px, r);
      const qx = this._mix(px, r, s);
      const qz = this._mix(pw, pz, s);
      const qw = this._mix(r, px, s);
      const d = qx - Math.min(qw, py);
      return {
        h: Math.round(Math.abs(qz + (qw - py) / (6.0 * d + 1e-10)) * 65536),
        s: Math.round(d / (qx + 1e-10) * 255),
        v: Math.round(qx)
      };
    }
}


class TurnOnAllLedsWithColorsBlocklyElement extends NeopixelBlocklyElement {
    _width = 340;

    _colors = {
        led1: {r: 255, g: 0, b: 0},
        led2: {r: 0, g: 255, b: 0},
        led3: {r: 0, g: 0, b: 255},
        led4: {r: 255, g: 255, b: 255}
    }
    _colorChanged = false;

    _onFocus = (e) => {
        e.target.jscolor.option('palette', Editor.colorPalette);
    }

    _onBlur = (e) => {
        if (Editor.colorPalette.indexOf(e.target.value) < 0) {
            Editor.colorPalette.shift();
            Editor.colorPalette.push(e.target.value);
        }
        this._colorChanged && this.replaySimulator();
    }

    _onChange = (e) => {
        const color = e.target.value;
        const led = e.target.getAttribute('data-led');
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        this._colorChanged = this._colors[led].r !== r || this._colors[led].g !== g || this._colors[led].b !== b;
        if (this._colorChanged) {
            this._colors[led].r = r;
            this._colors[led].g = g;
            this._colors[led].b = b;
            Editor.generateArduinoCode();
        }
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
        color1.setAttribute('tabindex', '-1');
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
        color2.setAttribute('tabindex', '-1');
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
        color3.setAttribute('tabindex', '-1');
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
        color4.setAttribute('tabindex', '-1');
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
        let code = indent + '// すべてのLEDを点灯する\n';
        const hsv1 = this._convertRgbToHsv(this._colors.led1.r, this._colors.led1.g, this._colors.led1.b);
        const hsv2 = this._convertRgbToHsv(this._colors.led2.r, this._colors.led2.g, this._colors.led2.b);
        const hsv3 = this._convertRgbToHsv(this._colors.led3.r, this._colors.led3.g, this._colors.led3.b);
        const hsv4 = this._convertRgbToHsv(this._colors.led4.r, this._colors.led4.g, this._colors.led4.b);
        code += indent + `led1 = {{${this._colors.led1.r}, ${this._colors.led1.g}, ${this._colors.led1.b}}, {${hsv1.h}, ${hsv1.s}, ${hsv1.v}}};\n`;
        code += indent + `led2 = {{${this._colors.led2.r}, ${this._colors.led2.g}, ${this._colors.led2.b}}, {${hsv2.h}, ${hsv2.s}, ${hsv2.v}}};\n`;
        code += indent + `led3 = {{${this._colors.led3.r}, ${this._colors.led3.g}, ${this._colors.led3.b}}, {${hsv3.h}, ${hsv3.s}, ${hsv3.v}}};\n`;
        code += indent + `led4 = {{${this._colors.led4.r}, ${this._colors.led4.g}, ${this._colors.led4.b}}, {${hsv4.h}, ${hsv4.s}, ${hsv4.v}}};\n`;
        code += indent + `pixels.setPixelColor(0, pixels.Color(led1.rgb.r, led1.rgb.g, led1.rgb.b));\n`
        code += indent + `pixels.setPixelColor(1, pixels.Color(led2.rgb.r, led2.rgb.g, led2.rgb.b));\n`
        code += indent + `pixels.setPixelColor(2, pixels.Color(led3.rgb.r, led3.rgb.g, led3.rgb.b));\n`
        code += indent + `pixels.setPixelColor(3, pixels.Color(led4.rgb.r, led4.rgb.g, led4.rgb.b));\n`
        code += indent + 'pixels.setBrightness(255);\n';
        code += indent + 'pixels.show();\n\n';
        return code;
    }

    executeSimulator(elapsedTime) {
        Editor.simulatorLEDs[0].r = this._colors.led1.r, Editor.simulatorLEDs[0].g = this._colors.led1.g, Editor.simulatorLEDs[0].b = this._colors.led1.b;
        Editor.simulatorLEDs[1].r = this._colors.led2.r, Editor.simulatorLEDs[1].g = this._colors.led2.g, Editor.simulatorLEDs[1].b = this._colors.led2.b;
        Editor.simulatorLEDs[2].r = this._colors.led3.r, Editor.simulatorLEDs[2].g = this._colors.led3.g, Editor.simulatorLEDs[2].b = this._colors.led3.b;
        Editor.simulatorLEDs[3].r = this._colors.led4.r, Editor.simulatorLEDs[3].g = this._colors.led4.g, Editor.simulatorLEDs[3].b = this._colors.led4.b;
        document.getElementById('led1').style.fill = `rgb(${this._colors.led1.r}, ${this._colors.led1.g}, ${this._colors.led1.b})`;
        document.getElementById('led2').style.fill = `rgb(${this._colors.led2.r}, ${this._colors.led2.g}, ${this._colors.led2.b})`;
        document.getElementById('led3').style.fill = `rgb(${this._colors.led3.r}, ${this._colors.led3.g}, ${this._colors.led3.b})`;
        document.getElementById('led4').style.fill = `rgb(${this._colors.led4.r}, ${this._colors.led4.g}, ${this._colors.led4.b})`;
        return [this, true];
    }

    getBlocklyClass() {
        return TurnOnAllLedsWithColorsBlocklyElement;
    }
}


class FadeInAllLedsWithColorsBlocklyElement extends NeopixelBlocklyElement {
    _width = 562;

    _colors = {
        led1: {r: 255, g: 0, b: 0},
        led2: {r: 0, g: 255, b: 0},
        led3: {r: 0, g: 0, b: 255},
        led4: {r: 255, g: 255, b: 255}
    }
    _colorChanged = false;

    _fadeInStartFrom = null;

    _foreignObject = null;
    _fadeInInMsInputWrapper = null;
    _fadeInInMsInput = null;
    _fadeInInMs = 500;

    _onFocus = (e) => {
        e.target.jscolor.option('palette', Editor.colorPalette);
    }

    _onBlur = (e) => {
        if (Editor.colorPalette.indexOf(e.target.value) < 0) {
            Editor.colorPalette.shift();
            Editor.colorPalette.push(e.target.value);
        }
        this._colorChanged && this.replaySimulator();
    }

    _onChange = (e) => {
        const color = e.target.value;
        const led = e.target.getAttribute('data-led');
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        this._colorChanged = this._colors[led].r !== r || this._colors[led].g !== g || this._colors[led].b !== b;
        if (this._colorChanged) {
            this._colors[led].r = r;
            this._colors[led].g = g;
            this._colors[led].b = b;
            Editor.generateArduinoCode();
        }
    }

    d() {
        const extraH = this._fadeInInMsInput ? Math.max(0, (`${this._fadeInInMsInput.value}`.length - 3) * 10) : 0;
        if (this._fadeInInMsInput) {
            this._foreignObject.setAttribute('width', 74 + extraH);
            this._fadeInInMsInput.style.width = `${74 + extraH}px`;
        }
        return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h ${this._width + extraH} a 4 4 0 0,1 4,4  v 8  V 44  V 44 a 4 4 0 0,1 -4,4  h -${this._width + extraH}  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
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
        text2.innerHTML = 'の色でフェードインする (ミリ秒)';
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
        color1.setAttribute('tabindex', '-1');
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
        color2.setAttribute('tabindex', '-1');
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
        color3.setAttribute('tabindex', '-1');
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
        color4.setAttribute('tabindex', '-1');
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
                backgroundColor: '#333',
                width: 250,
                palette: Editor.colorPalette,
                forceStyle: false,
            };
            jscolor.install();
        }, 1);

        this._foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        this._foreignObject.setAttribute('x', 520);
        this._foreignObject.setAttribute('y', -8);
        this._foreignObject.setAttribute('width', 74);
        this._foreignObject.setAttribute('height', 32);
        g.appendChild(this._foreignObject);

        this._fadeInInMsInputWrapper = document.createElement('div');
        this._fadeInInMsInputWrapper.className = 'fade-in-in-ms-wrapper';
        this._foreignObject.appendChild(this._fadeInInMsInputWrapper);

        this._fadeInInMsInput = document.createElement('input');
        this._fadeInInMsInput.value = this._fadeInInMs;
        this._fadeInInMsInput.setAttribute('type', 'number');
        this._fadeInInMsInput.setAttribute('min', 1);
        this._fadeInInMsInput.setAttribute('step', 1);
        this._fadeInInMsInput.addEventListener('focus', (e) => {
            e.target.select();
            e.target.parentNode.classList.add('focused');
        });
        this._fadeInInMsInput.addEventListener('blur', (e) => {
            e.target.parentNode.classList.remove('focused');
        });
        this._fadeInInMsInput.addEventListener('input', (e) => {
            this.render();
        });
        this._fadeInInMsInput.addEventListener('change', (e) => {
            if (e.target.value.length === 0) {
                e.target.value = this._fadeInInMs;
            } else {
                const value = Math.floor(e.target.value);
                if (this._fadeInInMs !== value) {
                    this._fadeInInMs = Math.floor(e.target.value);
                    e.target.value = this._fadeInInMs;
                    this.replaySimulator();
                    Editor.generateArduinoCode();
                }
            }
        });
        this._fadeInInMsInput.className = 'fade-in-in-ms non-draggable';
        this._fadeInInMsInputWrapper.appendChild(this._fadeInInMsInput);

        return g;
    }

    generateCode(level) {
        this._element.classList.remove('blockly-disabled');
        const indent = this.generateIndent(level);
        const hsv1 = this._convertRgbToHsv(this._colors.led1.r, this._colors.led1.g, this._colors.led1.b);
        const hsv2 = this._convertRgbToHsv(this._colors.led2.r, this._colors.led2.g, this._colors.led2.b);
        const hsv3 = this._convertRgbToHsv(this._colors.led3.r, this._colors.led3.g, this._colors.led3.b);
        const hsv4 = this._convertRgbToHsv(this._colors.led4.r, this._colors.led4.g, this._colors.led4.b);
        let code = indent + `// すべてのLEDを ${this._fadeInInMs} ミリ秒でフェードインする\n`;
        code += indent + `for (int x = 1; x <= ${Math.floor(this._fadeInInMs / 10)}; x++) {\n`;
        code += indent + `\tfloat ratio = x / float(${Math.floor(this._fadeInInMs / 10)});\n`;
        code += indent + '\tratio = 1 - (1 - ratio) * (1 - ratio);\n';
        code += indent + '\tpixels.clear();\n';
        code += indent + '\tpixels.setBrightness(255);\n';
        code += indent + '\tpixels.setPixelColor(0, pixels.gamma32(pixels.ColorHSV(\n';
        code += indent + `\t\t${hsv1.h} * ratio + led1.hsv.h * (1 - ratio),\n`;
        code += indent + `\t\t${hsv1.s} * ratio + led1.hsv.s * (1 - ratio),\n`;
        code += indent + `\t\t${hsv1.v} * ratio + led1.hsv.v * (1 - ratio))));\n`;
        code += indent + '\tpixels.setPixelColor(1, pixels.gamma32(pixels.ColorHSV(\n';
        code += indent + `\t\t${hsv2.h} * ratio + led2.hsv.h * (1 - ratio),\n`;
        code += indent + `\t\t${hsv2.s} * ratio + led2.hsv.s * (1 - ratio),\n`;
        code += indent + `\t\t${hsv2.v} * ratio + led2.hsv.v * (1 - ratio))));\n`;
        code += indent + '\tpixels.setPixelColor(2, pixels.gamma32(pixels.ColorHSV(\n';
        code += indent + `\t\t${hsv3.h} * ratio + led3.hsv.h * (1 - ratio),\n`;
        code += indent + `\t\t${hsv3.s} * ratio + led3.hsv.s * (1 - ratio),\n`;
        code += indent + `\t\t${hsv3.v} * ratio + led3.hsv.v * (1 - ratio))));\n`;
        code += indent + '\tpixels.setPixelColor(3, pixels.gamma32(pixels.ColorHSV(\n';
        code += indent + `\t\t${hsv4.h} * ratio + led4.hsv.h * (1 - ratio),\n`;
        code += indent + `\t\t${hsv4.s} * ratio + led4.hsv.s * (1 - ratio),\n`;
        code += indent + `\t\t${hsv4.v} * ratio + led4.hsv.v * (1 - ratio))));\n`;
        code += indent + '\tpixels.show();\n';
        code += indent + '\tdelay(10);\n';
        code += indent + '}\n';
        code += indent + `led1 = {{${this._colors.led1.r}, ${this._colors.led1.g}, ${this._colors.led1.b}}, {${hsv1.h}, ${hsv1.s}, ${hsv1.v}}};\n`;
        code += indent + `led2 = {{${this._colors.led2.r}, ${this._colors.led2.g}, ${this._colors.led2.b}}, {${hsv2.h}, ${hsv2.s}, ${hsv2.v}}};\n`;
        code += indent + `led3 = {{${this._colors.led3.r}, ${this._colors.led3.g}, ${this._colors.led3.b}}, {${hsv3.h}, ${hsv3.s}, ${hsv3.v}}};\n`;
        code += indent + `led4 = {{${this._colors.led4.r}, ${this._colors.led4.g}, ${this._colors.led4.b}}, {${hsv4.h}, ${hsv4.s}, ${hsv4.v}}};\n\n`;
        return code;
    }

    executeSimulator(elapsedTime) {
        if (!this._fadeInStartFrom) {
            this._fadeInStartFrom = elapsedTime;
            return [this, false];
        }
        if (elapsedTime - this._fadeInStartFrom >= this._fadeInInMs) {
            this._fadeInStartFrom = null;
            Editor.simulatorLEDs[0].r = this._colors.led1.r, Editor.simulatorLEDs[0].g = this._colors.led1.g, Editor.simulatorLEDs[0].b = this._colors.led1.b;
            Editor.simulatorLEDs[1].r = this._colors.led2.r, Editor.simulatorLEDs[1].g = this._colors.led2.g, Editor.simulatorLEDs[1].b = this._colors.led2.b;
            Editor.simulatorLEDs[2].r = this._colors.led3.r, Editor.simulatorLEDs[2].g = this._colors.led3.g, Editor.simulatorLEDs[2].b = this._colors.led3.b;
            Editor.simulatorLEDs[3].r = this._colors.led4.r, Editor.simulatorLEDs[3].g = this._colors.led4.g, Editor.simulatorLEDs[3].b = this._colors.led4.b;
            document.getElementById('led1').style.fill = `rgb(${Editor.simulatorLEDs[0].r}, ${Editor.simulatorLEDs[0].g}, ${Editor.simulatorLEDs[0].b})`;
            document.getElementById('led2').style.fill = `rgb(${Editor.simulatorLEDs[1].r}, ${Editor.simulatorLEDs[1].g}, ${Editor.simulatorLEDs[1].b})`;
            document.getElementById('led3').style.fill = `rgb(${Editor.simulatorLEDs[2].r}, ${Editor.simulatorLEDs[2].g}, ${Editor.simulatorLEDs[2].b})`;
            document.getElementById('led4').style.fill = `rgb(${Editor.simulatorLEDs[3].r}, ${Editor.simulatorLEDs[3].g}, ${Editor.simulatorLEDs[3].b})`;
            return [this, true];
        } else {
            const fromHsl1 = this._convertRgbToHsl(Editor.simulatorLEDs[0].r, Editor.simulatorLEDs[0].g, Editor.simulatorLEDs[0].b);
            const fromHsl2 = this._convertRgbToHsl(Editor.simulatorLEDs[1].r, Editor.simulatorLEDs[1].g, Editor.simulatorLEDs[1].b);
            const fromHsl3 = this._convertRgbToHsl(Editor.simulatorLEDs[2].r, Editor.simulatorLEDs[2].g, Editor.simulatorLEDs[2].b);
            const fromHsl4 = this._convertRgbToHsl(Editor.simulatorLEDs[3].r, Editor.simulatorLEDs[3].g, Editor.simulatorLEDs[3].b);

            const toHsl1 = this._convertRgbToHsl(this._colors.led1.r, this._colors.led1.g, this._colors.led1.b);
            const toHsl2 = this._convertRgbToHsl(this._colors.led2.r, this._colors.led2.g, this._colors.led2.b);
            const toHsl3 = this._convertRgbToHsl(this._colors.led3.r, this._colors.led3.g, this._colors.led3.b);
            const toHsl4 = this._convertRgbToHsl(this._colors.led4.r, this._colors.led4.g, this._colors.led4.b);

            let x = (elapsedTime - this._fadeInStartFrom) / parseFloat(this._fadeInInMs);
            //x = 1 - (1 - x) * (1 - x);
            const led1Hsl = {h: toHsl1.h * x + fromHsl1.h * (1 - x), s: toHsl1.s * x + fromHsl1.s * (1 - x), l: toHsl1.l * x + fromHsl1.l * (1 - x)};
            const led2Hsl = {h: toHsl2.h * x + fromHsl2.h * (1 - x), s: toHsl2.s * x + fromHsl2.s * (1 - x), l: toHsl2.l * x + fromHsl2.l * (1 - x)};
            const led3Hsl = {h: toHsl3.h * x + fromHsl3.h * (1 - x), s: toHsl3.s * x + fromHsl3.s * (1 - x), l: toHsl3.l * x + fromHsl3.l * (1 - x)};
            const led4Hsl = {h: toHsl4.h * x + fromHsl4.h * (1 - x), s: toHsl4.s * x + fromHsl4.s * (1 - x), l: toHsl4.l * x + fromHsl4.l * (1 - x)};
            document.getElementById('led1').style.fill = `hsl(${led1Hsl.h}deg, ${led1Hsl.s}%, ${led1Hsl.l}%)`;
            document.getElementById('led2').style.fill = `hsl(${led2Hsl.h}deg, ${led2Hsl.s}%, ${led2Hsl.l}%)`;
            document.getElementById('led3').style.fill = `hsl(${led3Hsl.h}deg, ${led3Hsl.s}%, ${led3Hsl.l}%)`;
            document.getElementById('led4').style.fill = `hsl(${led4Hsl.h}deg, ${led4Hsl.s}%, ${led4Hsl.l}%)`;
            return [this, false];
        }

    }

    resetSimulator() {
        this._fadeInStartFrom = null;
        Editor.simulatorLEDs = [
            {r: 206, g: 206, b: 206},
            {r: 206, g: 206, b: 206},
            {r: 206, g: 206, b: 206},
            {r: 206, g: 206, b: 206},
        ];
    }

    getBlocklyClass() {
        return FadeInAllLedsWithColorsBlocklyElement;
    }
}


class TurnOffAllLedsBlocklyElement extends NeopixelBlocklyElement {
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
        let code = indent + '// すべてのLEDを消す\n';
        code += indent + 'pixels.clear();\n';
        code += indent + 'pixels.show();\n\n';
        return code;
    }

    executeSimulator(elapsedTime) {
        document.getElementById('led1').style.fill = '#CECECE';
        document.getElementById('led2').style.fill = '#CECECE';
        document.getElementById('led3').style.fill = '#CECECE';
        document.getElementById('led4').style.fill = '#CECECE';
        return [this, true];
    }

    getBlocklyClass() {
        return TurnOffAllLedsBlocklyElement;
    }
}

class FadeOutAllLEDsBlocklyElement extends NeopixelBlocklyElement {
    _width = 345;

    _fadeOutStartFrom = null;

    _foreignObject = null;
    _fadeOutInMsInputWrapper = null;
    _fadeOutInMsInput = null;
    _fadeOutInMs = 500;

    d() {
        const extraH = this._fadeOutInMsInput ? Math.max(0, (`${this._fadeOutInMsInput.value}`.length - 3) * 10) : 0;
        if (this._fadeOutInMsInput) {
            this._foreignObject.setAttribute('width', 74 + extraH);
            this._fadeOutInMsInput.style.width = `${74 + extraH}px`;
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
        text.innerHTML = 'すべてのLEDをフェードアウト (ミリ秒)';
        g.appendChild(text);

        this._foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        this._foreignObject.setAttribute('x', 305);
        this._foreignObject.setAttribute('y', -8);
        this._foreignObject.setAttribute('width', 74);
        this._foreignObject.setAttribute('height', 32);
        g.appendChild(this._foreignObject);

        this._fadeOutInMsInputWrapper = document.createElement('div');
        this._fadeOutInMsInputWrapper.className = 'fade-out-in-ms-wrapper';
        this._foreignObject.appendChild(this._fadeOutInMsInputWrapper);

        this._fadeOutInMsInput = document.createElement('input');
        this._fadeOutInMsInput.value = this._fadeOutInMs;
        this._fadeOutInMsInput.setAttribute('type', 'number');
        this._fadeOutInMsInput.setAttribute('min', 1);
        this._fadeOutInMsInput.setAttribute('step', 1);
        this._fadeOutInMsInput.addEventListener('focus', (e) => {
            e.target.select();
            e.target.parentNode.classList.add('focused');
        });
        this._fadeOutInMsInput.addEventListener('blur', (e) => {
            e.target.parentNode.classList.remove('focused');
        });
        this._fadeOutInMsInput.addEventListener('input', (e) => {
            this.render();
        });
        this._fadeOutInMsInput.addEventListener('change', (e) => {
            if (e.target.value.length === 0) {
                e.target.value = this._fadeOutInMs;
            } else {
                const value = Math.floor(e.target.value);
                if (this._fadeOutInMs !== value) {
                    this._fadeOutInMs = Math.floor(e.target.value);
                    e.target.value = this._fadeOutInMs;
                    this.replaySimulator();
                    Editor.generateArduinoCode();
                }
            }
        });
        this._fadeOutInMsInput.className = 'fade-out-in-ms non-draggable';
        this._fadeOutInMsInputWrapper.appendChild(this._fadeOutInMsInput);

        return g;
    }

    generateCode(level) {
        this._element.classList.remove('blockly-disabled');

        const indent = this.generateIndent(level);
        let code = indent + `// すべてのLEDを ${this._fadeOutInMs} ミリ秒でフェードアウトする\n`;
        code += indent + `for (int b = 254; b >= 0; b--) {\n`;
        code += indent + '\tpixels.clear();\n';
        code += indent + '\tpixels.setPixelColor(0, pixels.Color(led1.rgb.r, led1.rgb.g, led1.rgb.b));\n';
        code += indent + '\tpixels.setPixelColor(1, pixels.Color(led2.rgb.r, led2.rgb.g, led2.rgb.b));\n';
        code += indent + '\tpixels.setPixelColor(2, pixels.Color(led3.rgb.r, led3.rgb.g, led3.rgb.b));\n';
        code += indent + '\tpixels.setPixelColor(3, pixels.Color(led4.rgb.r, led4.rgb.g, led4.rgb.b));\n';
        code += indent + '\tpixels.setBrightness(b);\n';
        code += indent + '\tpixels.show();\n';
        code += indent + `\tdelay(${parseInt(this._fadeOutInMs / 255.0)});\n`;
        code += indent + '}\n';
        code += indent + 'led1 = {{0, 0, 0}, {0, 0, 0}};\n';
        code += indent + 'led2 = {{0, 0, 0}, {0, 0, 0}};\n';
        code += indent + 'led3 = {{0, 0, 0}, {0, 0, 0}};\n';
        code += indent + 'led4 = {{0, 0, 0}, {0, 0, 0}};\n\n';
        return code;
    }

    executeSimulator(elapsedTime) {
        if (!this._fadeOutStartFrom) {
            this._fadeOutStartFrom = elapsedTime;
            return [this, false];
        }
        if (elapsedTime - this._fadeOutStartFrom >= this._fadeOutInMs) {
            this._fadeOutStartFrom = null;
            const alpha = 0;
            document.getElementById('led1').style.fill = `rgba(${Editor.simulatorLEDs[0].r}, ${Editor.simulatorLEDs[0].g}, ${Editor.simulatorLEDs[0].b}, ${alpha})`;
            document.getElementById('led2').style.fill = `rgba(${Editor.simulatorLEDs[1].r}, ${Editor.simulatorLEDs[1].g}, ${Editor.simulatorLEDs[1].b}, ${alpha})`;
            document.getElementById('led3').style.fill = `rgba(${Editor.simulatorLEDs[2].r}, ${Editor.simulatorLEDs[2].g}, ${Editor.simulatorLEDs[2].b}, ${alpha})`;
            document.getElementById('led4').style.fill = `rgba(${Editor.simulatorLEDs[3].r}, ${Editor.simulatorLEDs[3].g}, ${Editor.simulatorLEDs[3].b}, ${alpha})`;
            Editor.simulatorLEDs = [
                {r: 206, g: 206, b: 206},
                {r: 206, g: 206, b: 206},
                {r: 206, g: 206, b: 206},
                {r: 206, g: 206, b: 206},
            ];
            return [this, true];
        } else {
            const x = (elapsedTime - this._fadeOutStartFrom) / this._fadeOutInMs;
            const alpha = 1.0 - x;
            document.getElementById('led1').style.fill = `rgba(${Editor.simulatorLEDs[0].r}, ${Editor.simulatorLEDs[0].g}, ${Editor.simulatorLEDs[0].b}, ${alpha})`;
            document.getElementById('led2').style.fill = `rgba(${Editor.simulatorLEDs[1].r}, ${Editor.simulatorLEDs[1].g}, ${Editor.simulatorLEDs[1].b}, ${alpha})`;
            document.getElementById('led3').style.fill = `rgba(${Editor.simulatorLEDs[2].r}, ${Editor.simulatorLEDs[2].g}, ${Editor.simulatorLEDs[2].b}, ${alpha})`;
            document.getElementById('led4').style.fill = `rgba(${Editor.simulatorLEDs[3].r}, ${Editor.simulatorLEDs[3].g}, ${Editor.simulatorLEDs[3].b}, ${alpha})`;
            return [this, false];
        }
    }

    resetSimulator() {
        this._fadeOutStartFrom = null;
    }

    getBlocklyClass() {
        return FadeOutAllLEDsBlocklyElement;
    }
}
