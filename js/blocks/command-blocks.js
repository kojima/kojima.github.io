class CommandBlocklyElement extends BlocklyElement {
    _stroke = '#176cbf';
    _fill = '#1e90ff';

    d() {
        return 'm 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 235.984375 a 4 4 0 0,1 4,4  v 8  V 44  V 44 a 4 4 0 0,1 -4,4  h -235.984375  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z';
    }
}

class PauseBlocklyElement extends CommandBlocklyElement {
    _waitStartFrom = null;

    get element() {
        if (!this._element) {
            const element = super.element;
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', 'translate(8, 16.5)');
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.classList.add('blocklyText');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('x', 0);
            text.setAttribute('y', 9.5);
            text.innerHTML = '一時停止';
            g.appendChild(text);
            element.appendChild(g);
            return element;
        } else {
            return this._element;
        }
    }

    generateCode(level) {
        return this.generateIndent(level) + `delay(${1000});\n`;
    }

    executeSimulator(elapsedTime) {
        if (!this._waitStartFrom) {
            this._waitStartFrom = elapsedTime;
            return [this, false];
        }
        if (elapsedTime - this._waitStartFrom >= 1000) {
            this._waitStartFrom = null;
            return [this, true];
        } else {
            return [this, false];
        }
    }
}

class TurnOnAllLedsWithColorsBlocklyElement extends CommandBlocklyElement {
    get element() {
        if (!this._element) {
            const element = super.element;
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', 'translate(8, 16.5)');
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.classList.add('blocklyText');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('x', 0);
            text.setAttribute('y', 9.5);
            text.innerHTML = 'すべてのLEDを[][][][]の色で点灯する';
            g.appendChild(text);
            element.appendChild(g);
            return element;
        } else {
            return this._element;
        }
    }

    generateCode(level) {
        const indent = this.generateIndent(level);
        let code = '';
        code += indent + `pixels.setPixelColor(0, pixels.Color(${255}, ${0}, ${0}));\n`
        code += indent + `pixels.setPixelColor(1, pixels.Color(${0}, ${255}, ${0}));\n`
        code += indent + `pixels.setPixelColor(2, pixels.Color(${0}, ${0}, ${255}));\n`
        code += indent + `pixels.setPixelColor(3, pixels.Color(${255}, ${255}, ${255}));\n`
        code += indent + 'pixels.show();\n';
        return code;
    }

    executeSimulator(elapsedTime) {
        document.getElementById('led1').style.fill = `rgb(${255}, ${0}, ${0})`;
        document.getElementById('led2').style.fill = `rgb(${0}, ${255}, ${0})`;
        document.getElementById('led3').style.fill = `rgb(${0}, ${0}, ${255})`;
        document.getElementById('led4').style.fill = `rgb(${255}, ${255}, ${255})`;
        return [this, true];
    }
}

class TurnOffAllLedsBlocklyElement extends CommandBlocklyElement {

    get element() {
        if (!this._element) {
            const element = super.element;
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', 'translate(8, 16.5)');
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.classList.add('blocklyText');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('x', 0);
            text.setAttribute('y', 9.5);
            text.innerHTML = 'すべてのLEDを消す';
            g.appendChild(text);
            element.appendChild(g);
            return element;
        } else {
            return this._element;
        }
    }

    generateCode(level) {
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
