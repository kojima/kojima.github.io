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
    _listItem = false;
    _deletable = true;

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

    get cascadingHeight() {
        let height = this.height;
        let nextBlock = this._nextBlock;
        while (nextBlock) {
            height += nextBlock.height;
            nextBlock = nextBlock._nextBlock;
        }
        return height;
    }

    get translateX() {
        const ratio = this.prevBlock ? 1 : Editor.blocklyScale / defaultScale;
        const halfOfWidth = parseInt(Editor.canvas.getAttribute('width')) * 0.5;
        return this._x * ratio - halfOfWidth * (ratio - 1);
    }

    get translateY() {
        const ratio = this.prevBlock ? 1 : Editor.blocklyScale / defaultScale;
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
        return 1.5 / Editor.blocklyScale;
    }

    set x(newX) {
        this._x = newX;
        this._absX = this._x + (this.prevBlock ? this.prevBlock._absX : 0);
        // trigger absX update of decendants
        if (this._nextBlock) this._nextBlock.x = this._nextBlock._x;
    }

    set y(newY) {
        this._y = newY;
        this._absY = this._y + (this.prevBlock ? this.prevBlock._absY : 0);
        // trigger absY update of decendants
        if (this._nextBlock) this._nextBlock.y = this._nextBlock._y;
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

    set listItem(value) {
        this._listItem = value;
    }

    get deletable() {
        return this._deletable;
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
        const s = this.prevBlock ? 1 : Editor.blocklyScale;
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

    generateInnerElement() {
        throw new Error('generateInnerElement not implemented error');
    }

    select() {
        this._element.classList.add('blockly-selected');
        const backgroundPath = this._element.querySelector('.blockly-background-path');
        this._element.appendChild(backgroundPath);
    }

    getTransform(translateX, translateY, scale) {
        return `translate(${translateX}, ${translateY}) scale(${scale}, ${scale})`;
    }

    get element() {
        if (this._element) return this._element;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('blockly-element');
        g.setAttribute('id', this._id);
        g.setAttribute('transform', this.getTransform(this.x, this.y, Editor.blocklyScale));
        g.setAttribute('stroke-width', this.strokeWidth);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.style.fill = this._fill;
        path.setAttribute('d', this.d());
        g.appendChild(path);

        const innerElement = this.generateInnerElement();
        g.appendChild(innerElement);

        const backgroundPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        backgroundPath.classList.add('blockly-background-path');
        backgroundPath.style.stroke = this._stroke;
        backgroundPath.setAttribute('d', this.d());
        g.appendChild(backgroundPath);

        const block = this;
        g.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('non-draggable')) return;
            else if (block._listItem) {
                const blockRect = block.element.getBoundingClientRect();
                const editorRect = Editor.canvas.getBoundingClientRect();
                const clone = new (block.getBlocklyClass())(
                    blockRect.x - editorRect.x,
                    blockRect.y - editorRect.y);
                blocks[clone.id] = clone;
                clone.listItem = false;
                clone.element.style.zIndex = 50;
                Editor.selectedBlock = clone;
                clone.select();
                clone._element.classList.add('grabbing');
                Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
            } else {
                e.preventDefault();
                e.stopPropagation();
                const selected = document.querySelector('.blockly-selected');
                selected && selected.classList.remove('blockly-selected');
                const id = g.getAttribute('id');
                Editor.selectedBlock = blocks[id];
                this.select();
                this._element.classList.add('grabbing');
                Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
            }
        }, false);
        g.addEventListener('mouseup', (e) => {
            if (e.target.classList.contains('non-draggable')) return;

            e.preventDefault();
            e.stopPropagation();
            if (Editor.acceptorBlock) {
                Editor.acceptorBlock.appendBlock(this);
                this._prevBlock && this._prevBlock.render();
            }
            this.handleMouseUp();

            const rightPanePos = document.getElementById('right_pane').getBoundingClientRect();
            const dist = e.clientX - rightPanePos.x;
            !block.prevBlock && Editor.canvas.appendChild(block._element);
            if (block.deletable && dist > 0 && dist < 184) {
                delete blocks[block.id];
                block._element.remove();
            }
            Editor.selectedBlock = null;
            Editor.prevPoint.x = null, Editor.prevPoint.y = null;

            const trash = document.getElementById('blockly_trash_space');
            trash.classList.remove('active');
            trash.classList.remove('red');

            // Editor.triggerBlock.executeSimulator();
            this.replaySimulator();

            for (const block of Object.values(blocks)) {
                block.element.classList.add('blockly-disabled');
            }

            Editor.generateArduinoCode();
        }, false);

        this._element = g;

        return g;
    }

    handleMouseUp() {
        this._element.classList.remove('grabbing');
        this._element.classList.remove('moving');
    }

    applyPositionDiff(diffX, diffY) {
        this.x += diffX * defaultScale / Editor.blocklyScale;
        this.y += diffY * defaultScale / Editor.blocklyScale;
    }

    handleMouseMove(diffX, diffY) {
        if (!this._element.classList.contains('moving')) {
            document.querySelector('#blockly_drag_space').appendChild(this._element);
        }
        this._element.classList.add('moving');
        this.applyPositionDiff(diffX, diffY);
        this.updateTransform();
    }

    handleMutationObserverEvent() {
        /* Do nothing here */
    }

    render() {
        this.element.querySelectorAll(':scope > path').forEach((elm) => {
            elm.setAttribute('d', this.d());
        });
        this._prevBlock && this.prevBlock.render();
        if (this._nextBlock) {
            this._nextBlock.y = this.height;
            this._nextBlock.updateTransform();
        }
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
            this._prevBlock && this._prevBlock.render();
            //block.select();
        }
    }

    generateIndent(level) {
        let indent = '';
        for (let i = 0; i < level; i++) {
            indent += '\t';
        }
        return indent;
    }

    generateCode(level) {
        throw new Error('generateCode not implemented error');
    }

    executeSimulator(elapsedTime) {
        throw new Error('executeSimulator not implemented error');
    }

    resetSimulator() {
    }

    replaySimulator() {
        Editor.animationId && window.cancelAnimationFrame(Editor.animationId);
        Editor.simulatorStartedAt = null;
        window.requestAnimationFrame(Editor.simulatorStep);
    }

    getBlocklyClass() {
        throw new Error('getBlocklyClass not implemented error');
    }
}
