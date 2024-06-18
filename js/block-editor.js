/*
 * https://github.com/microsoft/pxt-microbit/
 */

const defaultScale = 1.0;

class Editor {
    static canvas = null;
    static selectedBlock = null;
    static prevPoint = { x: null, y: null };
    static scale = defaultScale;
    static offset = { x: 0, y: 0 };
}

const makeId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

class BlocklyElement {
    _element = null;
    _x = 0;
    _y = 0;
    _stroke = '#ddd';
    _fill = '#eee';
    _prevBlock = null;
    _nextBlock = null;

    constructor(x, y) {
        this._id = makeId(16);
        this._x = x;
        this._y = y;
    }

    get id() {
        return this._id;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get width() {
        throw Error('width getter not implemented error')
    }

    get height() {
        throw Error('height getter not implemented error')
    }

    get translateX() {
        const halfOfWidth = parseInt(Editor.canvas.getAttribute('width')) * 0.5;
        return this._x * Editor.scale / defaultScale - halfOfWidth * (Editor.scale / defaultScale - 1);
    }

    get translateY() {
        const halfOfHeight = parseInt(Editor.canvas.getAttribute('height')) * 0.5;
        return this._y * Editor.scale / defaultScale - halfOfHeight * (Editor.scale / defaultScale - 1);
    }

    get prevBlock() {
        return this._prevBlock;
    }

    get nextBlock() {
        return this._nextBlock;
    }

    get strokeWidth() {
        return 1.5 / Editor.scale;
    }

    set x(newX) {
        this._x = newX;
    }

    set y(newY) {
        this._y = newY;
    }

    set prevBlock(block) {
        this._prevBlock = block;
    }

    set nextBlock(block) {
        this._nextBlock = block;
    }

    updateTransform() {
        const transforms = this._element.transform.baseVal;
        if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            const translate = svg.createSVGTransform();
            translate.setTranslate(this.translateX, this.translateY);
            this._element.transform.baseVal.insertItemBefore(translate, 0);
        } else {
            transforms.getItem(0).setTranslate(this.translateX, this.translateY);
        }
        if (transforms.length === 1 || transforms.getItem(1).type !== SVGTransform.SVG_TRANSFORM_SCALE) {
            const scale = svg.createSVGScale();
            translate.setScale(Editor.scale, Editor.scale);
            this._element.transform.baseVal.insertItemBefore(scale, 1);
        } else {
            transforms.getItem(1).setScale(Editor.scale, Editor.scale);
        }
        this._element.setAttribute('stroke-width', this.strokeWidth);
    }

    d() {
        throw new Error('path difinition not implemented error');
    }

    get element() {
        if (this._element) return this._element;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', this._id);
        g.setAttribute('stroke', this._stroke);
        g.setAttribute('fill', this._fill);
        g.setAttribute('transform', `translate(${this.x}, ${this.y}) scale(${Editor.scale}, ${Editor.scale})`);
        g.setAttribute('stroke-width', this.strokeWidth);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.d());
        g.appendChild(path);
        g.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = g.getAttribute('id');
            Editor.selectedBlock = blocks[id];
            this._element.classList.add('grabbing');
            Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
        });
        g.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleMouseUp();
            Editor.selectedBlock = null;
            Editor.prevPoint.x = null, Editor.prevPoint.y = null;
        });
        this._element = g;

        return g;
    }

    handleMouseUp() {
        this._element.classList.remove('grabbing');
        this._element.classList.remove('moving');
    }

    applyPositionDiff(diffX, diffY) {
        this.x += diffX * defaultScale / Editor.scale;
        this.y += diffY * defaultScale / Editor.scale;
    }

    handleMouseMove(diffX, diffY) {
        if (!this._element.classList.contains('moving')) {
            document.querySelector('svg').appendChild(this._element);
        }
        this._element.classList.add('moving');
        this.applyPositionDiff(diffX, diffY);
        this.updateTransform();
    }

    render() {
        this.element.querySelector('path').setAttribute('d', this.d());
    }
};

class ContainerBlocklyElement extends BlocklyElement {
    _innerBlocks = [];

    totalChildHeight(position) {
        if (position < 0 || position > 1) {
            throw Error('position must be 0 or 1');
        }
        let totalChildHeight = 0;
        let block = this._innerBlocks[position];
        while(block) {
            totalChildHeight += block.height;
            block = block.nextBlock;
        }
        return totalChildHeight;
    }

    setInnerBlock(position, innerBlock) {
        if (position < 0 || position > 1) {
            throw Error('position must be 0 or 1');
        }
        if (!this._innerBlocks[position]) {
            innerBlock.prevBlock = this;
            this._innerBlocks[position] = innerBlock;
            this.element.appendChild(innerBlock.element);
        } else {
            let block = this._innerBlocks[position];
            while (block.nextBlock) block = block.nextBlock;
            block.nextBlock = innerBlock;
            innerBlock.prevBlock = block;
            block.element.appendChild(innerBlock.element);
        }
        this.render();
    }

    unsetInnerBlock(innerBlock) {
        for (let i = 0; i < this._innerBlocks.length; i++) {
            if (innerBlock === this._innerBlocks[i]) {
                innerBlock.prevBlock = null;
                this._innerBlocks[i] = null;
                this.render();
                return i;
            }
        }
        return -1;
    }

    render() {
        super.render();
        if (this._innerBlocks[1]) {
            const totalHeight = this.totalChildHeight(0);
            this._innerBlocks[1].y = (totalHeight > 0 ? totalHeight : 24) + 48 * 2;
            this._innerBlocks[1].updateTransform();
        }
    }
}

class InitialBlocklyElement extends ContainerBlocklyElement {
    _stroke = '#176cbf';
    _fill = '#1e90ff';

    setInnerBlock(position, innerBlock) {
        if (position !== 0) {
            throw Error('position must be 0');
        }
        super.setInnerBlock(position, innerBlock);
        if (innerBlock === this._innerBlocks[0]) {
            innerBlock.x = 16;
            innerBlock.y = 48;
        } else {
            innerBlock.x = 0;
            innerBlock.y = innerBlock.prevBlock.height;    
        }
        innerBlock.updateTransform();
    }

    d() {
        const totalChildHeight = this.totalChildHeight(0);
        const extraV = totalChildHeight > 0 ? totalChildHeight - 24 : 0;
        return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 152 a 4 4 0 0,1 4,4  v 4  V 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 156 a 4 4 0 0,1 4,4  V ${80 + extraV}  V ${100 + extraV} a 4 4 0 0,1 -4,4  h -152 a 4 4 0 0,1 -4,-4 z`;
    }

    get element() {
        if (!this._element) {
            const element = super.element;
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', 'translate(8, 14.5)');
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.classList.add('blocklyText');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('x', 0);
            text.setAttribute('y', 9.5);
            text.innerHTML = '最初だけ';
            g.appendChild(text);
            element.appendChild(g);
            return element;    
        } else {
            return this._element;
        }
    }
}

class IfBlocklyElement extends ContainerBlocklyElement {
    _stroke = '#007b7d';
    _fill = '#00a4a6';

    get height() {
        const totalChildHeight1 = this.totalChildHeight(0);
        const totalChildHeight2 = this.totalChildHeight(1);
        if (this._innerBlocks[1]) {
            return 176 + (totalChildHeight1 > 0 ? totalChildHeight1 - 24 : 0) + (totalChildHeight2 > 0 ? totalChildHeight2 - 24 : 0);
        } else {
            return 104 + (totalChildHeight1 > 0 ? totalChildHeight1 - 24 : 0);
        }
    }

    setInnerBlock(position, innerBlock) {
        super.setInnerBlock(position, innerBlock);
        if (innerBlock === this._innerBlocks[0]) {
            innerBlock.x = 16;
            innerBlock.y = 48;
        } else if (innerBlock === this._innerBlocks[1]) {
            innerBlock.x = 16;
            let totalHeight = 0;
            let block = this._innerBlocks[0];
            while (block) {
                totalHeight += block.height;
                block = block.nextBlock;
            }
            innerBlock.y = (totalHeight > 0 ? totalHeight : 24) + 48 * 2;
        } else {
            innerBlock.x = 0;
            innerBlock.y = innerBlock.prevBlock.height;    
        }
        innerBlock.updateTransform();
    }

    d() {
        const totalChildHeight1 = this.totalChildHeight(0);
        const totalChildHeight2 = this.totalChildHeight(1);
        const extraV1 = totalChildHeight1 > 0 ? totalChildHeight1 - 24 : 0;
        const extraV2 = totalChildHeight2 > 0 ? totalChildHeight2 - 24 : 0;
        if (this._innerBlocks[1]) {
            return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 125 a 4 4 0 0,1 4,4  v 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV1} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 173 a 4 4 0 0,1 4,4  V ${80 + extraV1}  V ${112 + extraV1}  V ${116 + extraV1} a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV2} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 173 a 4 4 0 0,1 4,4  V ${148 + extraV1 + extraV2}  V ${172 + extraV1 + extraV2}  V ${172 + extraV1 + extraV2} a 4 4 0 0,1 -4,4  h -125  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
        } else {
            return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 125 a 4 4 0 0,1 4,4  v 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV1} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 173 a 4 4 0 0,1 4,4  V ${76 + extraV1}  V ${100 + extraV1}  V ${100 + extraV1} a 4 4 0 0,1 -4,4  h -125  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
        }
    }
}

class CommandBlocklyElement extends BlocklyElement {
    _stroke = '#176cbf';
    _fill = '#1e90ff';

    get height() {
        return 48;
    }

    d() {
        return 'm 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 235.984375 a 4 4 0 0,1 4,4  v 8  V 44  V 44 a 4 4 0 0,1 -4,4  h -235.984375  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z';
    }
}

const blocks = {};

window.addEventListener('mousemove', (e) => {
    if (Editor.selectedBlock) {
        e.preventDefault();
        const prevBlock = Editor.selectedBlock.prevBlock;
        if (prevBlock) {
            prevBlock.nextBlock = null;
            Editor.selectedBlock.prevBlock = null;
            prevBlock.unsetInnerBlock && prevBlock.unsetInnerBlock(Editor.selectedBlock);
            let block = prevBlock;
            while (block) {
                block.render();
                Editor.selectedBlock.x += block.x;
                Editor.selectedBlock.y += block.y;
                block = block.prevBlock;
            }
        }
        const diffX = e.clientX - Editor.prevPoint.x;
        const diffY = e.clientY - Editor.prevPoint.y;
        Editor.selectedBlock.handleMouseMove(diffX, diffY);
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
        document.querySelector('svg rect').setAttribute('transform', 'translate(0, 0)');
    } else if (Editor.prevPoint.x && Editor.prevPoint.y) {
        e.preventDefault();
        const diffX = e.clientX - Editor.prevPoint.x;
        const diffY = e.clientY - Editor.prevPoint.y;
        document.querySelectorAll('svg > g').forEach((elm) => {
            const id = elm.getAttribute('id');
            const block = blocks[id];
            block.applyPositionDiff(diffX, diffY);
            block.updateTransform();
        });
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
        const rect = document.querySelector('svg rect');
        rect.setAttribute('transform', 'translate(0, 0)');
        if (!rect.classList.contains('moving')) rect.classList.add('moving');
    }
});
window.addEventListener('mouseup', (e) => {
    if (Editor.selectedBlock) {
        Editor.selectedBlock.handleMouseUp();
    }
    Editor.selectedBlock = null;
    Editor.prevPoint.x = null, Editor.prevPoint.y = null;
    document.querySelector('svg rect').classList.remove('moving');
});
window.onload = () => {
    const svg = document.querySelector('svg');
    Editor.canvas = svg;

    const initBlock = new InitialBlocklyElement(50, 100);
    const commandBlock1 = new CommandBlocklyElement(0, 0);
    const commandBlock2 = new CommandBlocklyElement(0, 0);
    const commandBlock3 = new CommandBlocklyElement(0, 0);
    const commandBlock4 = new CommandBlocklyElement(100, 0);
    const commandBlock5 = new CommandBlocklyElement(300, 0);
    const ifBlock = new IfBlocklyElement(500, 200);

    blocks[initBlock.id] = initBlock;
    blocks[commandBlock1.id] = commandBlock1;
    blocks[commandBlock2.id] = commandBlock2;
    blocks[commandBlock3.id] = commandBlock3;
    blocks[commandBlock4.id] = commandBlock4;
    blocks[commandBlock5.id] = commandBlock5;
    blocks[ifBlock.id] = ifBlock;

    svg.appendChild(initBlock.element);
    initBlock.setInnerBlock(0, commandBlock2);
    initBlock.setInnerBlock(0, commandBlock3);
    ifBlock.setInnerBlock(0, commandBlock1);
    ifBlock.setInnerBlock(0, commandBlock4);
    ifBlock.setInnerBlock(1, commandBlock5);
    initBlock.setInnerBlock(0, ifBlock);

    document.querySelector('svg rect').addEventListener('mousedown', (e) => {
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
    });
    document.getElementById('zoom_in').onclick = (e) => {
        e.preventDefault();
        Editor.scale = Math.min(Editor.scale * 1.2, 10);
        document.querySelectorAll('svg > g').forEach((elm) => {
            const id = elm.getAttribute('id');
            const block = blocks[id];
            block.updateTransform();
        });
    };
    document.getElementById('zoom_out').onclick = (e) => {
        e.preventDefault();
        Editor.scale = Math.max(Editor.scale * 0.8, 0.2);
        document.querySelectorAll('svg > g').forEach((elm) => {
            const id = elm.getAttribute('id');
            const block = blocks[id];
            block.updateTransform();
        });
    };
};