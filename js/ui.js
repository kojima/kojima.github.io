window.addEventListener('load', () => {
    const arduinoCode = document.getElementById('arduino_code');
    hljs.highlightElement(arduinoCode);

    /*
    const addButton = document.getElementById('add_tab_button');
    addButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const list = document.getElementById('tab_list');
        const tab = document.createElement('li');
        const deleteButton = document.createElement('span');
        deleteButton.classList.add('delete-tab-button');
        deleteButton.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        deleteButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            tab.remove();
            addButton.classList.remove('hidden');
        });
        tab.appendChild(deleteButton);
        list.appendChild(tab);
        const tabCount = list.querySelectorAll('li').length;
        if (tabCount >= 10) {
            addButton.classList.add('hidden');
        }
    });
    */

    const BLOCKLY_EDITOR = 1;
    const ARDUINO_EDITOR = 2;
    let currentEditor = BLOCKLY_EDITOR;

    document.getElementById('editor_block').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        currentEditor = BLOCKLY_EDITOR;

        const slider = document.querySelector('#editor_switch #slider');
        slider.classList.remove('right');
        slider.classList.add('left');
        document.querySelector('#editor_block').classList.add('selected');
        document.querySelector('#editor_arduino').classList.remove('selected');

        document.querySelector('#blockly_editor_wrapper').classList.add('selected');
        document.querySelector('#arduino_editor_wrapper').classList.remove('selected');

        document.querySelector('#copy_wrapper').classList.add('hidden');
        setTimeout(() => {
            document.querySelector('#copy_wrapper').classList.add('deep-hidden');
        }, 300);
    });

    document.getElementById('editor_arduino').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        currentEditor = ARDUINO_EDITOR;

        const slider = document.querySelector('#editor_switch #slider');
        slider.classList.remove('left');
        slider.classList.add('right');
        document.querySelector('#editor_arduino').classList.add('selected');
        document.querySelector('#editor_block').classList.remove('selected');

        document.querySelector('#arduino_editor_wrapper').classList.add('selected');
        document.querySelector('#blockly_editor_wrapper').classList.remove('selected');

        document.querySelector('#copy_wrapper').classList.remove('deep-hidden');
        setTimeout(() => {
            document.querySelector('#copy_wrapper').classList.remove('hidden');
        }, 10);
    });

    document.getElementById('copy_code').addEventListener(
        "click",
        (e) => {
            const codeElm = document.getElementById('arduino_code');
            const code = codeElm.innerText;
            setClipboard(code);
        }
    );

    async function setClipboard(text) {
      const type = "text/plain";
      const blob = new Blob([text], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      document.getElementById('copy_popup').classList.add('show');
      setTimeout(() => {
        document.getElementById('copy_popup').classList.remove('show');
      }, 3000);
    }

    document.getElementById('zoom_in').onclick = (e) => {
        e.preventDefault();
        if (currentEditor === BLOCKLY_EDITOR) {
            Editor.blocklyScale = Math.min(Editor.blocklyScale * 1.2, 10);
            document.querySelectorAll('#blockly_editor > g').forEach((elm) => {
                const id = elm.getAttribute('id');
                const block = blocks[id];
                block.updateTransform();
            });
        } else {
            Editor.arduinoScale = Math.min(Editor.arduinoScale * 1.2, 3);
            document.getElementById('arduino_code').style.transform = `scale(${Editor.arduinoScale})`;
        }
    };

    document.getElementById('zoom_out').onclick = (e) => {
        e.preventDefault();
        if (currentEditor === BLOCKLY_EDITOR) {
            Editor.blocklyScale = Math.max(Editor.blocklyScale * 0.8, 0.2);
            document.querySelectorAll('#blockly_editor > g').forEach((elm) => {
                const id = elm.getAttribute('id');
                const block = blocks[id];
                block.updateTransform();
            });
        } else {
            Editor.arduinoScale = Math.max(Editor.arduinoScale * 0.8, 0.5);
            document.getElementById('arduino_code').style.transform = `scale(${Editor.arduinoScale})`;
        }
    };
});