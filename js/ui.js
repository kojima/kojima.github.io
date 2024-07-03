window.addEventListener('load', () => {
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
});