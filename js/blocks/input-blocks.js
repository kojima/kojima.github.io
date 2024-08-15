class OnShakedBlocklyElement extends ContainerBlocklyElement {
    _stroke = '#9f009f';
    _fill = '#d400d4';
    _prependable = false;
    _appendable = false;

    d() {
        const totalInnerBlockHeight = this.totalInnerBlockHeight(0);
        const extraV = totalInnerBlockHeight > 0 ? totalInnerBlockHeight - 24 : 0;
        const extraH = this._width ? this._width - 190 : 0;   // 190: original path width
        return `m 0,0  m 0,4 a 4 4 0 0,1 4,-4  h ${152 + extraH} a 4 4 0 0,1 4,4  v 4  V 8  V 40  V 44 a 4 4 0 0,1 -4,4  H 64  c -2,0  -3,1  -4,2  l -4,4  c -1,1  -2,2  -4,2  h -12  c -2,0  -3,-1  -4,-2  l -4,-4  c -1,-1  -2,-2  -4,-2  h -8 a 4 4 0 0,0 -4,4  v ${16 + extraV} a 4 4 0 0,0 4,4  h 8  c 2,0  3,1  4,2  l 4,4  c 1,1  2,2  4,2  h 12  c 2,0  3,-1  4,-2  l 4,-4  c 1,-1  2,-2  4,-2  H ${156 + extraH} a 4 4 0 0,1 4,4  V ${80 + extraV}  V ${100 + extraV} a 4 4 0 0,1 -4,4  h ${-152 - extraH} a 4 4 0 0,1 -4,-4 z`;
    }

    get width() {
        return this._width;
    }

    get element() {
        if (!this._element) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', 'translate(8, 14.5)');
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.classList.add('blocklyText');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('x', 0);
            text.setAttribute('y', 9.5);
            text.innerHTML = '揺さぶられたとき';
            g.appendChild(text);

            const element = super.element;
            element.appendChild(g);
            return element;    
        } else {
            return this._element;
        }
    }

    getNumberOfEntry() {
        return 1;
    }

    handleMutationObserverEvent() {
        const text = this._element.querySelector('.blocklyText');
        const rect = text.getBoundingClientRect();
        this._width = rect.width + 100;
        this.render();
    }
}
