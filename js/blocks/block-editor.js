/*
 * https://github.com/microsoft/pxt-microbit/
 */

const defaultScale = 1.0;
class Editor {
    static canvas = null;
    static triggerBlock = null;
    static selectedBlock = null;
    static prevPoint = { x: null, y: null };
    static blocklyScale = defaultScale;
    static offset = { x: 0, y: 0 };
    static acceptorBlock = null;
    static arduinoScale = defaultScale;
    static getIndex = () => {
        return Editor._index.shift();
    };
    static returnBackIndex = (index) => {
        Editor._index.unshift(index);
    };
    static resetIndex = () => {
        Editor._index = [];
        const vals = ['i', 'j', 'k', 'l', 'm', 'n'];
        for (let i = 1; i <= 10; i++) {
            vals.forEach((val) => {
                i === 1 ? Editor._index.push(val) : Editor._index.push(`${val}${i}`);
            })
        }
    };
    static _index = [];
    static colorPalette = ['#fff', '#000', '#808080', '#996e36', '#f55525', '#ffe438', '#88dd20', '#22e0cd', '#269aff', '#bb1cd4'];
}

const blocks = {};

window.addEventListener('mousemove', (e) => {
    if (Editor.selectedBlock) {
        e.preventDefault();
        let prevBlock = Editor.selectedBlock.prevBlock;
        if (prevBlock) {
            prevBlock.unsetInnerBlock
                ? prevBlock.unsetInnerBlock(Editor.selectedBlock)
                : prevBlock.nextBlock = null;
            prevBlock.render();
        }
        Editor.selectedBlock.prevBlock = null;
        //Editor.selectedBlock.nextBlock = null;
        Editor.selectedBlock.x = Editor.selectedBlock.absX;
        Editor.selectedBlock.y = Editor.selectedBlock.absY;
        const diffX = e.clientX - Editor.prevPoint.x;
        const diffY = e.clientY - Editor.prevPoint.y;
        Editor.selectedBlock.handleMouseMove(diffX, diffY);
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
        document.querySelector('#blockly_editor rect').setAttribute('transform', 'translate(0, 0)');

        if (Editor.selectedBlock.insertable) {
            Editor.acceptorBlock = null;
            Object.keys(blocks).forEach((id) => {
                const block = blocks[id];
                if (!Editor.acceptorBlock && block.acceptable(Editor.selectedBlock)) {
                    Editor.acceptorBlock = block;
                }
            });
        }
    } else if (Editor.prevPoint.x && Editor.prevPoint.y) {
        e.preventDefault();
        const diffX = e.clientX - Editor.prevPoint.x;
        const diffY = e.clientY - Editor.prevPoint.y;
        document.querySelectorAll('#blockly_editor > g').forEach((elm) => {
            const id = elm.getAttribute('id');
            const block = blocks[id];
            block.applyPositionDiff(diffX, diffY);
            block.updateTransform();
        });
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
        const rect = document.querySelector('#blockly_editor rect');
        rect.setAttribute('transform', 'translate(0, 0)');
        if (!rect.classList.contains('moving')) rect.classList.add('moving');

        const gridPattern = document.querySelector('#blocklyGridPattern');
        const x = parseInt(gridPattern.getAttribute('x'));
        const y = parseInt(gridPattern.getAttribute('y'));
        gridPattern.setAttribute('x', x + diffX);
        gridPattern.setAttribute('y', y + diffY);
    }
});

window.addEventListener('mouseup', (e) => {
    Editor.selectedBlock && Editor.selectedBlock.handleMouseUp();
    if (Editor.selectedBlock && Editor.acceptorBlock) {
        Editor.acceptorBlock.appendBlock(Editor.selectedBlock);
        let prevBlock = Editor.selectedBlock.prevBlock;
        prevBlock.render();
    }
    Editor.selectedBlock = null;
    Editor.prevPoint.x = null, Editor.prevPoint.y = null;
    document.querySelector('#blockly_editor rect').classList.remove('moving');
});

window.addEventListener('load', () => {
    const svg = document.querySelector('#blockly_editor');
    Editor.canvas = svg;

    const config = { attributes: false, childList: true, subtree: false };
    const callback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    const id = node.getAttribute('id');
                    blocks[id] && blocks[id].handleMutationObserverEvent();
                });
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(svg, config);

    //const initBlock = new InitialBlocklyElement(0, 0);
    const pauseBlocklyElement = new PauseBlocklyElement(20, 20);
    const pauseBlocklyElement2 = new PauseBlocklyElement(80, 20);
    const turnOnAllLedsWithColorsBlocklyElement1 = new TurnOnAllLedsWithColorsBlocklyElement(30, 200);
    const turnOnAllLedsWithColorsBlocklyElement2 = new TurnOnAllLedsWithColorsBlocklyElement(30, 250);
    const commandBlock3 = new NeopixelBlocklyElement(40, 40);
    const turnOffAllLedBlocklyElement = new TurnOffAllLedsBlocklyElement(100, 0);
    const loopBlock1 = new LoopBlocklyElement(300, 0);
    const loopBlock2 = new LoopBlocklyElement(400, 0);
    //const ifBlock = new IfBlocklyElement(500, 200);
    //const foreverBlock = new ForeverBlocklyElement(500, 500);
    Editor.triggerBlock = new OnShakedBlocklyElement(200, 300);

    //blocks[initBlock.id] = initBlock;
    blocks[pauseBlocklyElement.id] = pauseBlocklyElement;
    blocks[pauseBlocklyElement2.id] = pauseBlocklyElement2;
    blocks[turnOnAllLedsWithColorsBlocklyElement1.id] = turnOnAllLedsWithColorsBlocklyElement1;
    blocks[turnOnAllLedsWithColorsBlocklyElement2.id] = turnOnAllLedsWithColorsBlocklyElement2;
    blocks[commandBlock3.id] = commandBlock3;
    blocks[turnOffAllLedBlocklyElement.id] = turnOffAllLedBlocklyElement;
    blocks[loopBlock1.id] = loopBlock1;
    blocks[loopBlock2.id] = loopBlock2;
    //blocks[ifBlock.id] = ifBlock;
    //blocks[foreverBlock.id] = foreverBlock;
    blocks[Editor.triggerBlock.id] = Editor.triggerBlock;

    //svg.appendChild(initBlock.element);
    svg.appendChild(turnOnAllLedsWithColorsBlocklyElement1.element);
    svg.appendChild(turnOnAllLedsWithColorsBlocklyElement2.element);
    svg.appendChild(commandBlock3.element);
    svg.appendChild(pauseBlocklyElement.element);
    svg.appendChild(pauseBlocklyElement2.element);
    svg.appendChild(turnOffAllLedBlocklyElement.element);
    svg.appendChild(loopBlock1.element);
    svg.appendChild(loopBlock2.element);
    //svg.appendChild(ifBlock.element);
    //svg.appendChild(foreverBlock.element);
    svg.appendChild(Editor.triggerBlock.element);

    document.querySelector('#blockly_editor rect').addEventListener('mousedown', (e) => {
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
    });
});