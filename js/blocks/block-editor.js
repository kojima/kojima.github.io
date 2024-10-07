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

const hideBlocklyToolBowList = () => {
    document.querySelectorAll('.blockly-tool-bow-list.show').forEach((l) => l.classList.remove('show'));
    document.querySelectorAll('.blockly-tool-box-row.selected').forEach((l) => l.classList.remove('selected'));
}

const blocks = {};

window.addEventListener('mousemove', (e) => {
    if (Editor.selectedBlock) {
        e.preventDefault();
        let prevBlock = Editor.selectedBlock.prevBlock;
        if (prevBlock) {
            prevBlock.unsetInnerBlock && prevBlock.unsetInnerBlock(Editor.selectedBlock);
            prevBlock.nextBlock = null;
            prevBlock.render();
        }
        Editor.selectedBlock.prevBlock = null;
        Editor.selectedBlock.x = Editor.selectedBlock.absX;
        Editor.selectedBlock.y = Editor.selectedBlock.absY;
        const diffX = e.clientX - Editor.prevPoint.x;
        const diffY = e.clientY - Editor.prevPoint.y;
        Editor.selectedBlock.handleMouseMove(diffX, diffY);
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
        document.querySelector('#blockly_editor_background').setAttribute('transform', 'translate(0, 0)');

        if (Editor.selectedBlock.insertable) {
            Editor.acceptorBlock = null;
            Object.keys(blocks).forEach((id) => {
                const block = blocks[id];
                if (!Editor.acceptorBlock && block.acceptable(Editor.selectedBlock)) {
                    Editor.acceptorBlock = block;
                }
            });
        }
        hideBlocklyToolBowList();
        jscolor.install();
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
        const background = document.querySelector('#blockly_editor_background');
        background.setAttribute('transform', 'translate(0, 0)');
        if (!background.classList.contains('moving')) background.classList.add('moving');

        const gridPattern = document.querySelector('#blocklyGridPattern');
        const x = parseInt(gridPattern.getAttribute('x'));
        const y = parseInt(gridPattern.getAttribute('y'));
        gridPattern.setAttribute('x', x + diffX);
        gridPattern.setAttribute('y', y + diffY);
        hideBlocklyToolBowList();
    }
});

window.addEventListener('mouseup', (e) => {
    Editor.selectedBlock && Editor.selectedBlock.handleMouseUp();
    if (Editor.selectedBlock && Editor.acceptorBlock) {
        Editor.svg.appendChild(Editor.selectedBlock.element);
        Editor.acceptorBlock.appendBlock(Editor.selectedBlock);
        let prevBlock = Editor.selectedBlock.prevBlock;
        prevBlock.render();
    }
    Editor.selectedBlock = null;
    Editor.prevPoint.x = null, Editor.prevPoint.y = null;
    document.querySelector('#blockly_editor rect').classList.remove('moving');
    e.target.getAttribute('id') === 'blockly_editor_background' && hideBlocklyToolBowList();
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

    Editor.triggerBlock = new OnShakedBlocklyElement(208, 24);
    blocks[Editor.triggerBlock.id] = Editor.triggerBlock;
    svg.appendChild(Editor.triggerBlock.element);

    // list setup
    // basic
    const basicList = document.querySelector('.blockly-tool-bow-list-container.basic');

    const pauseBlocklyElementForList = new PauseBlocklyElement(0, 0);
    pauseBlocklyElementForList.listItem = true;
    basicList.appendChild(pauseBlocklyElementForList.element);

    // neopixel
    const neopixelList = document.querySelector('.blockly-tool-bow-list-container.neopixel');

    const turnOnAllLedsWithColorsBlocklyElementForList = new TurnOnAllLedsWithColorsBlocklyElement(0, 0);
    turnOnAllLedsWithColorsBlocklyElementForList.listItem = true;
    neopixelList.appendChild(turnOnAllLedsWithColorsBlocklyElementForList.element);

    const turnOffAllLedBlocklyElementForList = new TurnOffAllLedsBlocklyElement(0, 80);
    turnOffAllLedBlocklyElementForList.listItem = true;
    neopixelList.appendChild(turnOffAllLedBlocklyElementForList.element);

    // loop
    const loopList = document.querySelector('.blockly-tool-bow-list-container.loop');

    const loopBlockForList = new LoopBlocklyElement(0, 0);
    loopBlockForList.listItem = true;
    loopList.appendChild(loopBlockForList.element);

    document.querySelector('#blockly_editor_background').addEventListener('mousedown', (e) => {
        Editor.prevPoint.x = e.clientX, Editor.prevPoint.y = e.clientY;
    });
});