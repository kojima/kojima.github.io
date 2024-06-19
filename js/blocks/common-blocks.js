class BlocklyElement {
    _element = null;
    _x = 0;
    _y = 0;
    _absX = 0;
    _absY = 0;
    _stroke = '#ddd';
    _fill = '#eee';
    _prevBlock = null;
    _nextBlock = null;
    _prependable = true;
    _appendable = true;

    constructor(x, y) {
        this._id = generateId(16);
        this._x = x;
        this._y = y;
        this._absX = x;
        this._absY = y;
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

    get absX() {
        return this._absX;
    }

    get absY() {
        return this._absY;
    }

    get width() {
        throw Error('width getter not implemented error')
    }

    get height() {
        throw Error('height getter not implemented error')
    }

    get translateX() {
        const ratio = this.prevBlock ? 1 : Editor.scale / defaultScale;
        const halfOfWidth = parseInt(Editor.canvas.getAttribute('width')) * 0.5;
        return this._x * ratio - halfOfWidth * (ratio - 1);
    }

    get translateY() {
        const ratio = this.prevBlock ? 1 : Editor.scale / defaultScale;
        const halfOfHeight = parseInt(Editor.canvas.getAttribute('height')) * 0.5;
        return this._y * ratio - halfOfHeight * (ratio - 1);
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
        this._absX = this._x + (this.prevBlock ? this.prevBlock._absX : 0);
        let n = this._nextBlock;
        while (n) {
            n._absX = n.prevBlock._absX + n.x;
            n = n._nextBlock;
        }
    }

    set y(newY) {
        this._y = newY;
        this._absY = this._y + (this.prevBlock ? this.prevBlock._absY : 0);
        let n = this._nextBlock;
        while (n) {
            n._absY = n.prevBlock._absY + n.y;
            n = n._nextBlock;
        }
    }

    set absX(newAbsX) {
        this._absX = newAbsX;
    }

    set absY(newAbsY) {
        this._absY = newAbsY;
    }

    set prevBlock(block) {
        this._prevBlock = block;
    }

    set nextBlock(block) {
        this._nextBlock = block;
    }

    get insertable() {
        return true;
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
        const s = this.prevBlock ? 1 : Editor.scale;
        if (transforms.length === 1 || transforms.getItem(1).type !== SVGTransform.SVG_TRANSFORM_SCALE) {
            const scale = svg.createSVGScale();
            translate.setScale(s, s);
            this._element.transform.baseVal.insertItemBefore(scale, 1);
        } else {
            transforms.getItem(1).setScale(s, s);
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
            if (Editor.acceptorBlock) {
                Editor.acceptorBlock.appendBlock(this);
                let prevBlock = this.prevBlock;
                while (prevBlock) {
                    prevBlock.render();
                    prevBlock = prevBlock.prevBlock;
                }
            }
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

    handleMutationObserverEvent() {
        /* Do nothing here */
    }    

    render() {
        this.element.querySelector('path').setAttribute('d', this.d());
    }

    get height() {
        return 48;
    }

    acceptable(block) {
        return this.y > block.y
            ? this._appendable && Math.pow(block.x - this.absX, 2) + Math.pow((block.y + block.height) - this.absY, 2) < 1600
            : this._prependable && Math.pow(block.x - this.absX, 2) + Math.pow(block.y - (this.absY + this.height), 2) < 1600; 
    }

    appendBlock(block) {
        if (this.acceptable(block)) {
            const [a, b] = this.y < block.y ? [this, block] : [block, this];
            if (a.nextBlock) {
                const c = a.nextBlock;
                b._element.appendChild(c._element);
                c.x = 0;
                c.y = b.height;
                b.nextBlock = c;
                c.prevBlock = b;
                c.updateTransform();
            }
            a.nextBlock = b;
            b.prevBlock = a;
            a._element.appendChild(b._element);
            b.x = 0;
            b.y = this.height;
            b.updateTransform();
            let prevBlock = block.prevBlock;
            while (prevBlock) {
                prevBlock.render();
                prevBlock = prevBlock.prevBlock;
            }
        }
    }


    d() {
        return 'm 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 235.984375 a 4 4 0 0,1 4,4  v 8  V 44  V 44 a 4 4 0 0,1 -4,4  h -235.984375  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z';
    }
};
