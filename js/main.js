'use strict';

window.addEventListener('load', ()=> {

    // ****** SELECT ITEMS **********
    const formTache = document.getElementsByName("frm1")[0];  
    const taskInput = document.getElementsByName("tache")[0];
    const selectPriority = document.getElementsByName("importance")[0];
    const listContainer = document.getElementById('listeTaches');
    const templateList = document.getElementById('modeleListe');
    const templateDetails = document.getElementById('modeleDetail');
    const detailsWindow = document.getElementById('modale');
    const formSort = document.getElementsByName("frm2")[0];
    const selectTri = document.getElementsByName("tri")[0];
    const spanError = document.getElementById('msgErr');

    // ****** SETTING VARIABLES **********
    let isDone = false;

    // ****** EVENT LISTENERS **********

    //submit form with a new task
    formTache.addEventListener("submit", addItem);

    //load items
    setupItems();

    //select by importance/name
    formSort.addEventListener("change", setupItems);

    // ****** FUNCTIONS **********

    /**
     * Add a task to the list in the DOM and the Local Storage
     * @param {event} e
     */
    function addItem(e){
        e.preventDefault();
        //get values of the item
        const name = taskInput.value;
        const priority = selectPriority.value;
        // create dynamic id
        let id;
        const taskArray = getLocalStorage();
        taskArray.length > 0 ? id = taskArray[taskArray.length - 1].id + 1 : id = 1;
        //create dynamic date
        const d = new Date();
        const day = d.getDate().toString();
        const month = (d.getMonth() + 1).toString();
        const year = d.getFullYear().toString();
        const hour = d.getHours().toString();
        const min = d.getMinutes().toString();
        const sec = d.getSeconds().toString();
        const date = `${day}/${month}/${year}, ${hour}:${min}:${sec}`;
        //create item
        if(name && priority && date && id && !isDone){
            const task = {name, priority, date, id, isDone};
            createListItem(task);
            //add to the array of tasks
            taskArray.push(task);
            //add to local storage
            addToLocalStorage(task);
            //set back to default
            taskInput.value = '';
        } else
            spanError.innerText = 'Veuillez entrer une tâche.';
    }

    /**
     * Delete a task from the list, in the DOM and the Local Storage
     * @param {event} e
     */
    function deleteItem(e) {
        //get the element to delete
        const element = e.currentTarget.parentElement.parentElement;
        const id = element.childNodes[1].dataset.id;
        //remove the element from DOM
        listContainer.removeChild(element);
        //remove from local storage
        removeFromLocalStorage(id);
    }

    /**
     * Show details of a task in a dialog window
     * @param {event} e
     */
    function showDetailsItem(e){
        //get id of element targeted
        const element = e.currentTarget.parentElement.parentElement;
        const id = element.childNodes[1].dataset.id;
        //get item's informations from local storage
        const item = getItemInfosLocalStorage(id);
        //clone template Item Details
        const detailsClone = templateDetails.cloneNode(true);
        //replace informations in the clone
        for(let prop in item){
            detailsClone.innerHTML = detailsClone.innerHTML.replaceAll(`{${prop}}`, item[prop]);
        }
        //replace the html in the dialog window
        detailsWindow.innerHTML = detailsClone.innerHTML;
        detailsWindow.showModal();
    }

    /**
     * Udapte the boolean value isDone of the task in the DOM and the Local Storage
     * @param {event} e
     */
    function updateIsDone(e){
        let isDoneToggled;
        //get data value of the element clicked
        const element = e.currentTarget;
        let isDoneValue = element.dataset.isdone;
        //toggle the boolean value
        if(isDoneValue === 'false'){
            element.dataset.isdone = true;
            isDoneToggled = true;
        } else {
            element.dataset.isdone = false;
            isDoneToggled = false;
        } 
        //edit infos in Local Storage
        const itemId = element.dataset.id;
        editLocalStorage(itemId, isDoneToggled);
    }

    /**
     * Add a task to the list
     * @return {array} 
     */
    function sortItems(){
        //get the array of items
        let items = getLocalStorage();
        //sort the array by name or priority
        if(selectTri.value === 'nom/importance'){
            items.sort((a, b) => {
                let x = a['name'];
                let y = b['name'];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        } else {
            items.sort((a, b) => {
                let x = a['priority'];
                let y = b['priority'];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
        return items;
    }

    // ****** LOCAL STORAGE **********

    /**
     * Add an item to the local storage
     * @param {object} item
     */
    function addToLocalStorage(item){
        let items = getLocalStorage();
        items.push(item);
        localStorage.setItem('tasksList', JSON.stringify(items));
    }

    /**
     * Remove an item from the local storage
     * @param {string} id
     */
    function removeFromLocalStorage(id){
        let items = getLocalStorage();
        const updatedItems = items.filter(item => item.id != id);
        localStorage.setItem('tasksList', JSON.stringify(updatedItems));
    }

    /**
     * Get item's infos from the local storage
     * @param {string} id
     * @return {object} 
     */
    function getItemInfosLocalStorage(id){
        let items = getLocalStorage();
        const updatedItems = items.filter(item => item.id == id);
        return updatedItems[0];
    }

    /**
     * Edit the key's value "isDone" of an item from the local storage
     * @param {string} id
     * @param {boolean} isDone
     */
    function editLocalStorage(id, isDone){
        let items = getLocalStorage();
        items = items.map(item => {
            if(item.id == id){ 
                item.isDone = isDone;
            }
            return item; 
        });
        localStorage.setItem('tasksList',JSON.stringify(items));
    }

    /**
     * Get item's infos from the local storage or an empty array if no items
     * @return {array} 
     */
    function getLocalStorage(){
        return localStorage.getItem('tasksList') ? JSON.parse(localStorage.getItem('tasksList')) : [];
    }

    // ****** SETUP ITEMS **********

    /**
     * Set the task list into the DOM
     */
    function setupItems(){
        //reset the task list container if it contains tasks
        if(listContainer.children.length > 0){
            while(listContainer.children.length > 0){
                listContainer.removeChild(listContainer.children[0]);
            }   
        }
        //sort array of items by name or priority
        let items = sortItems();
        //display items
        if(items.length > 0){
            items.forEach(item => {
                createListItem(item);
            })
        }
    }

    /**
     * Display a task item into the list, in the DOM
     * @param {object} item
     */
    function createListItem(item){
        //clone template ListItem
        const listClone = templateList.cloneNode(true);
        //fill clone with item's values
        for(let prop in item){
            listClone.innerHTML = listClone.innerHTML.replaceAll(`{${prop}}`, item[prop]); 
        }
        //display clone
        listContainer.appendChild(listClone.content); 
        //listen btns detail
        const detailBtns = document.querySelectorAll(".detail");
        detailBtns.forEach(detailBtn => {
            detailBtn.addEventListener('click', showDetailsItem); 
        });
        //listen btns delete
        const deleteBtns = document.querySelectorAll(".effacer");
        deleteBtns.forEach(deleteBtn => {
            deleteBtn.addEventListener('click', deleteItem); 
        });
        //listen value data-isdone
        const tasks = document.querySelectorAll(".tache");
        tasks.forEach(task => {
            task.addEventListener('click', updateIsDone); 
        });
    }
 })