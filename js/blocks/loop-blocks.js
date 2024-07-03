class ForeverBlocklyElement extends ContainerBlocklyElement {
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
            text.innerHTML = 'ずっと';
            g.appendChild(text);
            element.appendChild(g);
            return element;
        } else {
            return this._element;
        }
    }
}


class LoopBlocklyElement extends ContainerBlocklyElement {
    _stroke = '#008000';
    _fill = '#00aa00';

    getNumberOfEntry() {
        return 1;
    }

    d() {
        const totalInnerBlockHeight = this.totalInnerBlockHeight(0);
        const extraV = totalInnerBlockHeight > 0 ? totalInnerBlockHeight - 24 : 0;
        return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  h 125 a 4 4 0 0,1 4,4  v 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H 173 a 4 4 0 0,1 4,4  V ${76 + extraV}  V ${100 + extraV}  V ${100 + extraV} a 4 4 0 0,1 -4,4  h -125  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,1 -4,-4 z`;
    }
}