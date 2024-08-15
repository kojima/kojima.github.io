class ContainerBlocklyElement extends BlocklyElement {
    _innerBlocks = [];

    getNumberOfEntry() {
        throw Error('getNumberOfEntry is not implemented');
    }

    acceptable(block) {
        if (this.y > block.y) {
            // check for prependablity
            return this._appendable && Math.pow(block.x - this.absX, 2) + Math.pow((block.y + block.height) - this.absY, 2) < 1600;
        } else {
            // check for insertable
            const numOfEntry = this.getNumberOfEntry();
            let totalHeight = 48;
            for (let i = 0; i < numOfEntry; i++) {
                const acceptable = Math.pow(block.x - this.absX, 2) + Math.pow(block.y - (this.absY + totalHeight), 2) < 1600;
                if (acceptable) {
                    const d = new Date();
                    return true;
                };
                totalHeight += 48 + this.totalInnerBlockHeight(i);
            }
            // check for appendability
            return this._prependable && Math.pow(block.x - this.absX, 2) + Math.pow(block.y - (this.absY + this.height), 2) < 1600;
        }
    }

    appendBlock(block) {
        if (this.acceptable(block)) {
            if (this.y > block.y) {
                if (this._appendable && Math.pow(block.x - this.absX, 2) + Math.pow((block.y + block.height) - this.absY, 2) < 1600) {
                    super.appendBlock(block);
                    console.log(this._prevBlock, this._nextBlock);
                }
            } else {
                // check for insertable
                const numOfEntry = this.getNumberOfEntry();
                let totalHeight = 48;
                for (let i = 0; i < numOfEntry; i++) {
                    const acceptable = Math.pow(block.x - this.absX, 2) + Math.pow(block.y - (this.absY + totalHeight), 2) < 1600;
                    if (acceptable) {
                        block.prevBlock = this;
                        block.x = 16;
                        block.y = totalHeight;
                        block.updateTransform();
                        if (this._innerBlocks[i]) {
                            block.nextBlock = this._innerBlocks[i];
                            this._innerBlocks[i].prevBlock = block;
                            this._innerBlocks[i].x = 0;
                            this._innerBlocks[i].y += block.height;
                            this._innerBlocks[i].updateTransform();
                            block._element.appendChild(this._innerBlocks[i]._element);
                        }
                        this._innerBlocks[i] = block;
                        this._element.appendChild(block._element);
                        this.render();
                        if (this._nextBlock) {
                            this._nextBlock.y = this.height;
                            this._nextBlock.updateTransform();
                        }
                        return;
                    };
                    totalHeight += 48 + this.totalInnerBlockHeight(i);
                }
                // check for appendability
                if (this._prependable && Math.pow(block.x - this.absX, 2) + Math.pow(block.y - (this.absY + this.height), 2) < 1600) {
                    super.appendBlock(block);
                    console.log(this._prevBlock, this._nextBlock);
                }
            }
        }
    }

    totalInnerBlockHeight(position) {
        const numOfEntry = this.getNumberOfEntry();
        if (!(position < numOfEntry)) {
            throw Error(`position must be under ${numOfEntry}: ${position}`);
        }
        let block = this._innerBlocks[position];
        return block ? block.cascadingHeight : 0;
    }

    unsetInnerBlock(innerBlock) {
        for (let i = 0; i < this._innerBlocks.length; i++) {
            if (innerBlock === this._innerBlocks[i]) {
                innerBlock.prevBlock = null;
                this._innerBlocks[i] = null;
                break;
            }
        }
        this.render();
        if (this._nextBlock) {
            this._nextBlock.y = this.height;
            this._nextBlock.updateTransform();
        }
        innerBlock.nextBlock = null;
    }

    render() {
        super.render();
        let totalY = 48;
        this._innerBlocks.forEach((nextBlock) => {
            while (nextBlock) {
                nextBlock.y = nextBlock.prevBlock === this ? totalY : nextBlock.prevBlock.height;
                nextBlock.updateTransform();
                totalY += nextBlock.height;
                nextBlock = nextBlock.nextBlock;
            }
            totalY += 48;
        });
    }

    get height() {
        let totalHeight = 48;
        const numOfEntry = this.getNumberOfEntry();
        for (let i = 0; i < numOfEntry; i++) {
            const innerHeight = this.totalInnerBlockHeight(i);
            totalHeight += (innerHeight > 0 ? innerHeight : 24) + (i < numOfEntry.length - 1 ? 48 : 0);
        }
        totalHeight += 32
        return totalHeight;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    set x(newX) {
        super.x = newX
        // trigger absX update of inner blocks
        for (let i = 0; i < this._innerBlocks.length; i++) {
            let innerBlock = this._innerBlocks[i];
            if (innerBlock) innerBlock.x = innerBlock._x;
        }
    }

    set y(newY) {
        super.y = newY
        // trigger absY update of inner blocks
        for (let i = 0; i < this._innerBlocks.length; i++) {
            let innerBlock = this._innerBlocks[i];
            if (innerBlock) innerBlock.y = innerBlock._y;
        }
    }
}

class InitialBlocklyElement extends ContainerBlocklyElement {
    _stroke = '#176cbf';
    _fill = '#1e90ff';
    _prependable = false;
    _appendable = false;

    getNumberOfEntry() {
        return 1;
    }

    d() {
        const totalInnerBlockHeight = this.totalInnerBlockHeight(0);
        const extraV = totalInnerBlockHeight > 0 ? totalInnerBlockHeight - 24 : 0;
        return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 152 a 4 4 0 0,1 4,4  v 4  V 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 156 a 4 4 0 0,1 4,4  V ${80 + extraV}  V ${100 + extraV} a 4 4 0 0,1 -4,4  h -152 a 4 4 0 0,1 -4,-4 z`;
    }

    get insertable() {
        return false;
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

    getNumberOfEntry() {
        return Math.max(1, this._innerBlocks.length);
    }

    d() {
        const totalInnerBlockHeight1 = this.totalInnerBlockHeight(0);
        const totalInnerBlockHeight2 = 0; //this.totalInnerBlockHeight(1);
        const extraV1 = totalInnerBlockHeight1 > 0 ? totalInnerBlockHeight1 - 24 : 0;
        const extraV2 = totalInnerBlockHeight2 > 0 ? totalInnerBlockHeight2 - 24 : 0;
        if (this._innerBlocks[1]) {
            return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 125 a 4 4 0 0,1 4,4  v 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV1} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 173 a 4 4 0 0,1 4,4  V ${80 + extraV1}  V ${112 + extraV1}  V ${116 + extraV1} a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV2} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 173 a 4 4 0 0,1 4,4  V ${148 + extraV1 + extraV2}  V ${172 + extraV1 + extraV2}  V ${172 + extraV1 + extraV2} a 4 4 0 0,1 -4,4  h -125  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
        } else {
            return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 125 a 4 4 0 0,1 4,4  v 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV1} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 173 a 4 4 0 0,1 4,4  V ${76 + extraV1}  V ${100 + extraV1}  V ${100 + extraV1} a 4 4 0 0,1 -4,4  h -125  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
        }
    }
}
