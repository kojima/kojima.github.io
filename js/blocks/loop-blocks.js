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