const columnList_ul = document.querySelector('.drag-column');
const addNewList_div = document.querySelector('.add-new-column');
const addList_btn = document.querySelector('.add-list');
const addListCancel_div = document.querySelector('.add-list.cancel');
const insertColumnName_div = document.querySelector('.insertColumnName');

//trash can elements
const trashContainer_div = document.querySelector('.trash-can-container');
const trashCanClosed_img = document.querySelector('.trash-can.closed');
const trashCanOpen_img = document.querySelector('.trash-can.open');

//Vetor que armazenará todas as informaçãos de colunas e linhas do documento
let objList = [];

//Váriveis para contar quantas colunas e linhas o documento tem
let columnIdCount = 0;
let rowIdCount = 0;
//Váriaveis para verificar executação de funcionalidades
let newItemProgress = false;
let columnTitleVerify = false;
//Variavéis de controle para drag de coluna e linha
let dragExecutColumn = false;
dragExecutRow = false;
//Variáveis para guardar o elemento que está sendo arrastado
let draggedItemColumn;
let draggedItemRow;

let trashRemove = false;
let currentColumn;
let mouseIsOver = false;

//Atualizar os ids das colunas depois da drag funcionality
const attIdOrder = () => {
  const columnList_li = document.querySelectorAll('li.column-list');

  columnList_li.forEach((column, index) => {
    column.setAttribute('id', `column-${index+1}`);
  })
}

//add eventlistener to add another card item
const attAddItems = () => {
  const addItemContainer_div = document.querySelectorAll('.add-item-container');
  
  addItemContainer_div.forEach(item => {
    item.style.display = 'flex';
    item.addEventListener('click', editNewAddItem);
  });
}

//add eventListener to column title change 
const attColumnTitle = () => {
  const columnTitles_span = document.querySelectorAll('.column-name');
  columnTitles_span.forEach(item => {
    item.addEventListener('click', columnTitleChange);
  });
}

const updateObjectList = () => {
  objList = [];
  const columnList_li = document.querySelectorAll('li.column-list');
  let i = 0;
  
  //Criar cada posição do vetor como um objeto com o titulo da coluna e um array que é suas linhas
  columnList_li.forEach(column => {
    const columnTitle_span = document.querySelector(`#${column.id} .column-name`);
    objList.push({
      title: columnTitle_span.innerText,
      itens: []
    });
    
    const rowNames_li = document.querySelectorAll(`#${column.id} .row-item`);
    rowNames_li.forEach(row => {
      objList[i].itens.push([row.innerText]);
    })
    i++;
  });
  
}

// Salvar no localStorage o array com os dados do usuário
function updateSavedColumns() {
  localStorage.setItem('objList', JSON.stringify(objList));
}

//Função usada toda vez que for feito uma atualização no documento
const attAllData = () => {
  //Não atualizar o documento enquanto está acontecendo mudança do titulo da coluna, adicionando nova linha e enquanto ocorre o drag.
  if (columnTitleVerify || newItemProgress) return;
  if (dragExecutColumn || dragExecutRow) return;

  attIdOrder();
  attColumnListDrag();
  attColumnTitle();
  updateObjectList();
  updateSavedColumns();
  attAddItems();
}

/* ---------------------------------------------DRAG FUNCIONALITY COLUMN---------------------------------------- */

const attColumnListDrag = () => {
  //para previnir bugs
  if (dragExecutRow) return;
  mouseIsOver = false;
  const prevElement_li = document.createElement('li');
  const dragList_li = document.querySelectorAll('li.column-list');
  
  for (let column of dragList_li) {
    column.draggable = true;

    column.addEventListener("dragstart", function (evt) {
      if (dragExecutColumn) return;
      if (columnTitleVerify || newItemProgress) return;
      dragExecutColumn = true;

      /* Criar o elemento figura (a previa do elemento) que mostrará onde será inserido o elemento no drag
      Definir seu estilo e tamanho tal como os eventos de dragover e drop para remove-lo no fim do drag. */

      draggedItemColumn = this;
      //Importante para criar o e efeito de elemento desaparecer quando começado o drag
      setTimeout(() => draggedItemColumn.remove(), 20);

      prevElement_li.classList.add('column-list');
      prevElement_li.classList.add('prev');
      prevElement_li.style.height = `${draggedItemColumn.offsetHeight-20}px`; //pegar height do elemento
      prevElement_li.draggable = true;

      prevElement_li.addEventListener("dragover", function (event) {
        event.preventDefault();
      });
      prevElement_li.addEventListener("drop", function (evt) {
        evt.preventDefault();
        dragExecutColumn = false;
        const Elposition_li = document.querySelector('.column-list.prev');
        if (!Elposition_li) return;
        //Inserir o elemento no drag novamente no documento
        Elposition_li.parentNode.insertBefore(draggedItemColumn, Elposition_li);
        Elposition_li.remove();
        attAllData();
        //Remover a lixeira
        trashContainer_div.style.display = 'none';
      });
      draggedItemColumn.parentNode.insertBefore(prevElement_li, draggedItemColumn.nextSibling);

      //Mostrar lixeira no canto da tela para excluir elementos
      seeTrashCan();
    });

    //Evento utilizado para editar a posição do elemento figura.
    column.addEventListener("dragenter", function () {
      if (!this.classList.contains('column-list')) return;

      let thisPosition = 0;
      let prevPosition = 0;

      const allColumnList_li = document.querySelectorAll('.column-list');
      allColumnList_li.forEach((column, index) => {
        if (column === prevElement_li) {
          prevPosition = index;
        }
        if (column === this){
          thisPosition = index;
        }
      });
      prevElement_li.remove();
      if (prevPosition > thisPosition){
        this.parentNode.insertBefore(prevElement_li, this);
      } else {
        this.parentNode.insertBefore(prevElement_li, this.nextSibling);
      }
    });

    //Funcionalidade para caso o usuário não solte o elemento no lugar certo
    column.addEventListener("dragend", function () {
      dragExecutColumn = false;
      
      let verifyContinue = true;

      //Verificar se o item foi excluido
      if (trashRemove) {
        trashRemove = false;
        return;
      }
  
      //Inserir o elemento no drag novamente no documento, caso exista
      const getAllColumn_li = document.querySelectorAll('.column-list');
      getAllColumn_li.forEach(column => {
        if (column === draggedItemColumn){
          verifyContinue = false;
        }
      })
      if (!verifyContinue) return;    
    
      //Se passou aqui então a coluna não está no documento, então precisa inseri-la e remover o preview
      const prevColumn = document.querySelector('.column-list.prev');
      if (!prevColumn) return;
      prevColumn.parentElement.insertBefore(draggedItemColumn, prevColumn);
      prevColumn.remove();
      attAllData();
    });
  }

}
/* -------------------------------------------------END DRAG COLUMN FICIONALITY ----------------------------------------- */

//Desativar funcionalidade de drag da coluna quando uma row está sendo focada
const desativeColumnListDrag = () => {
  if (mouseIsOver) return;
  if (columnTitleVerify || newItemProgress) return;
  mouseIsOver = true;
  const dragList_li = document.querySelectorAll('li.column-list');
  for (let column of dragList_li) {
    column.draggable = false;
    column.replaceWith(column.cloneNode(true));
  }
}

//Função que permite que colunas vázias recebam linhas
/* const allowAloneColumnDrop = (ulTarget) => {
  const allColumnContainer_ul = document.querySelectorAll(`.drag-row`);
  const teste = e => console.log(e)
  allColumnContainer_ul.forEach(column_ul => {
    if (column_ul === ulTarget) return;
    column_ul.setAttribute('ondragover', 'allowDrop(e)');
    column_ul.setAttribute('ondragenter', 'teste(e)');
    console.log('allowcolumnAlone')
  })
} */

/* ----------------------------------------Drag Funcionality para as linhas (row)-----------------------------------*/

let prevRowElement_li;


// When Item Starts Dragging
function drag(event) {
  dragExecutRow = true;

  draggedItemRow = event.target;
  //dragging = true;
  prevRowElement_li = document.createElement('li');

  //permitir que colunas vazias também receba a row
  allowAloneColumnDrop(draggedItemRow.parentElement);

  prevRowElement_li.classList.add('row-item');
  prevRowElement_li.classList.add('prev-row');
  prevRowElement_li.style.height = `${draggedItemRow.offsetHeight-10}px`;
  prevRowElement_li.draggable = true;

  prevRowElement_li.addEventListener("dragover", function (event) {
    event.preventDefault();
  });
  prevRowElement_li.addEventListener("drop", function (evt) {
    evt.preventDefault();
    dragExecutRow = false;
    const Elposition_li = document.querySelector('.row-item.prev-row');
    if (!Elposition_li) {
      if (!Elposition_li.parentNode) {
        Elposition_li.remove();
        return;
      }
      return;
    }
    //Inserir o elemento no drag novamente no documento
    Elposition_li.parentNode.insertBefore(draggedItemRow, Elposition_li);
    Elposition_li.remove();
    attAllData();
    //Remover a lixeira
    trashContainer_div.style.display = 'none';
  });
  draggedItemRow.parentNode.insertBefore(prevRowElement_li, draggedItemRow.nextSibling);

  //Importante para criar o e efeito de elemento desaparecer quando começado o drag
  setTimeout(() => draggedItemRow.remove(), 20);

  //Mostrar lixeira no canto da tela para excluir elementos
  seeTrashCan();
}

// When Item Enters Column Area
function dragEnter(column, event) {
  if (!event.target.classList.contains('row-item')) return;
  if (prevRowElement_li === null) return;
  if (!event.target) return;


  let thisPosition = 0;
  let prevPosition = 0;

  const AllRowList_li = document.querySelectorAll(`#column-${column} .row-item`);
  
  //Necessário para que o elemento preview funcione da maneira correta, tanto pra cima quanto pra baixo
  AllRowList_li.forEach((row, index) => {
    if (row === prevRowElement_li) {
      prevPosition = index;
    }
    if (row === event.target){
      thisPosition = index;
    }
  });
  if (prevRowElement_li) {
    prevRowElement_li.remove();
  }
  

  //Existia um bug que criava vários elemento preview, então estou resolvendo dessa forma
  const resolveBugSpan_li = document.querySelectorAll(`#column-${column} .prev-row`);

  if (resolveBugSpan_li){
    resolveBugSpan_li.forEach(span => {
      span.remove();
    })
  }
  
  //Se a prev está maior que a posição do elemento focado, então insere antes, se não, insere depois (nextSibling)
  if (prevPosition > thisPosition){
    event.target.parentNode.insertBefore(prevRowElement_li, event.target);
  } else {
    event.target.parentNode.insertBefore(prevRowElement_li, event.target.nextSibling);
  }
}


// Column Allows for Item to Drop
function allowDrop(e) {
  e.preventDefault();
}

// Dropping Item in Column
function drop(e, column) {
  e.preventDefault();
}

function dragEnd(column) {
  let verifyContinue = true;
  dragExecutRow = false;
  if (trashRemove) {
    trashRemove = false;
    return;
  }

  //Verificar se existe a row em questão na coluna
  const getAllRow_li = document.querySelectorAll(`#column-${column} .row-item`);
  getAllRow_li.forEach(li => {
    if (li === draggedItemRow) {
      verifyContinue = false;
    }
  });
  if (!verifyContinue) return;

  //Se passou aqui então o item não está na coluna, o que significa que teremos que adicionar ela e remover o preview
  const prevRow = document.querySelector('.row-item.prev-row');
  if (!prevRow) return;
  prevRow.parentElement.insertBefore(draggedItemRow, prevRow);
  prevRow.remove();
  
  //Remover a lixeira
  trashContainer_div.style.display = 'none';
  draggedItemRow = null;
  attAllData();
}
/* ------------------------------------     END ROW DRAG FUNCIONALITY      ---------------------------------------------*/

// Criar uma nova coluna de elementos
const setObjList = (text) => {
  columnIdCount++;
  columnList_ul.innerHTML += `<li class="column-list" id="column-${columnIdCount}"><span class="column-name">${text}</span><div class="column-div"><ul class="drag-row" onmouseover="desativeColumnListDrag()" onmouseout="attAllData()" ondrop="drop(event, ${columnIdCount})" ondragover="allowDrop(event)" ondragstart="drag(event)"></ul><div class="add-item-container"><span class="plus-sign black-color">+</span><span class="add-item">Add another card</span></div></div></li>`;
  attAllData();
}

//Adicionar nova coluna ao documento "add another list"
const addNewList = () => {
  insertColumnName_div.style.display = "flex";
  addNewList_div.style.display = "none";

  //Necessário a criação de uma função exterior para o botão de addList devido remove event 
  const saveColumn = () => {
    let text = document.querySelector('.add-list-text').value;
    if (text === '') return;
    //Criando nova coluna
    setObjList(text);
    //Limpar bloco de texto  
    document.querySelector('.add-list-text').value = '';
    
    insertColumnName_div.style.display = "none";
    addNewList_div.style.display = "initial";

    //Remover esse evento para que não exista problemas com callback de eventListener
    //Declarar esse evento apenas uma vez no escopo global do código também funcionaria
    addList_btn.removeEventListener('click', saveColumn);
  }
  addList_btn.addEventListener('click', saveColumn);

  addListCancel_div.addEventListener('click', () => {
    insertColumnName_div.style.display = "none";
    addNewList_div.style.display = "initial";
  })
};

// Criação das rows / linhas de cada coluna
function createItemEl(item, index, special) {
  // List Item
  const listEl = document.createElement('li');
  listEl.classList.add('row-item');
  listEl.innerText = item;
  listEl.setAttribute('onclick', `editRowText(event)`);
  listEl.setAttribute('ondragenter', `dragEnter(${index}, event)`);
  listEl.setAttribute('ondragend', `dragEnd(${index}, event)`);
  listEl.draggable = true;

  document.querySelector(`#column-${index} .column-div .drag-row`).appendChild(listEl);
}

//Funcionalidade do botão "Add another card"
const editNewAddItem = (event) => {
  if (newItemProgress) return;
  newItemProgress = true;
  //Elemento que guardará o texto da nova row
  const saveInfo = document.createElement('textarea'); 
  saveInfo.classList.add('item-text');
  saveInfo.setAttribute('placeholder', 'Enter a title for this card…');

  /* Esse evento.target precisa ser o que tem a classe add-item-container, mas se clicar especialmente no span que tem
  dentro desse elemento, o target não pegará o elemento certo, por isso o while até encontrar o parendeNode com essa classe */
  let exactElementToApend = event.target;
  while (!exactElementToApend.classList.contains('add-item-container')){
    exactElementToApend = exactElementToApend.parentNode;
  }
  //Inserindo esse bloco de texto no lugar certo
  exactElementToApend.parentElement.insertBefore(saveInfo, exactElementToApend);
  
  //Criação dos botões de addItem ou CancelItem
  const addItemContainer = document.createElement('div');
  addItemContainer.classList.add('add-list-container');

  const addItemBtn = document.createElement('button');
  addItemBtn.classList.add('add-list');
  addItemBtn.innerText = "Add item";

  const cancelItemBtn = document.createElement('button');
  cancelItemBtn.classList.add('add-list');
  cancelItemBtn.classList.add('cancel');
  cancelItemBtn.innerText = "X";

  addItemContainer.appendChild(addItemBtn);
  addItemContainer.appendChild(cancelItemBtn);

  exactElementToApend.parentElement.insertBefore(addItemContainer, exactElementToApend);
  exactElementToApend.style.display = 'none';

  //Funcionalidade do botão de add
  addItemBtn.addEventListener('click', () => {
    let i = 0;
    const columnId = event.path;
    const numRegex = /\d+/;
    const text = saveInfo.value;
    if (text === '') return;
    //Executa a função createItemEl usando como parâmetros o texto guardado no textarea e o número do id da coluna
    //Como só queremos a parte númerica do id (column-1 => 1), então usamos o match com regex numérico
    while (columnId[i].id === ''){
      i++;
    }
    createItemEl(text, columnId[i].id.match(numRegex)[0]);
    saveInfo.remove();
    addItemContainer.remove();
    newItemProgress = false;
    attAllData();
  });
  
  cancelItemBtn.addEventListener('click', () => {
    saveInfo.remove();
    addItemContainer.remove();
    newItemProgress = false;
  });
}

//Mudar o nome da coluna ao clica-lá
const columnTitleChange = (event) => {
  if (columnTitleVerify) return;
  columnTitleVerify = true;

  //Ocultando e armazenando o texto que já tinha no span da coluna, onde fica o título
  const titleSpan = event.path[0];
  const prevTitle = titleSpan.innerText;
  titleSpan.style.display = 'none';
  
  //criando o input que irá armazenar o novo título
  const columnTitleInput = document.createElement('input');
  columnTitleInput.setAttribute('type','text');
  columnTitleInput.value = prevTitle;
  columnTitleInput.classList.add('column-Title');
  //Inserindo especialmente no topo da coluna esse text input
  event.path[1].insertBefore(columnTitleInput, titleSpan);

  //criando os eventos de desfoque e de pressionamento do enter para salvar esse novo título.
  columnTitleInput.addEventListener('keypress', (event) => {
    if (event.key !== "Enter") return;
    titleSpan.innerText = columnTitleInput.value;
    titleSpan.style.display = 'inherit';
    try {
      columnTitleInput.remove();
    } catch (error) {}
    
    columnTitleVerify = false;
    attAllData();
  });
  columnTitleInput.addEventListener('focusout', () => {
    titleSpan.innerText = columnTitleInput.value;
    titleSpan.style.display = 'inherit';
    try {
      columnTitleInput.remove();
    } catch (error) {}
    columnTitleVerify = false;
    attAllData();
  });
}

//Criando todos os elementos que já existiam dentro do array objList
const addObjListData = () => {
  let columnNum = 0;
  for (const obj of objList) {
    columnNum++;
    //Criando nova coluna
    setObjList(obj.title);
    rowIdCount = 0;
    for (const item of obj.itens) {
      rowIdCount++;
      //Criando nova linha para essa coluna
      createItemEl(item, columnNum);
    }
  }
  attAddItems();
}

//Funcionalidade para editar as rows existentes
const editRowText = (event) => {
  actRow = event.target;
  
  //Criando elemento que guardará o novo texto daquela row
  const saveInfo = document.createElement('textarea');
  saveInfo.value = actRow.innerText;
  saveInfo.classList.add('edit-row');
  //screenX screenY para criar efeito de expansão da caixa da row
  saveInfo.style.top = `${actRow.getBoundingClientRect().top}px`;
  saveInfo.style.left = `${actRow.getBoundingClientRect().left}px`;

  //Mostrando a tela de desfoque junto com a posição do elemento de texto
  const focusScreen_div = document.querySelector('.focus-screen');
  focusScreen_div.style.display = 'block';
  focusScreen_div.appendChild(saveInfo);

  //Container que terá os botões de addItem e de cancelar Item
  const addItemContainer = document.createElement('div');
  addItemContainer.classList.add('add-list-container');
  addItemContainer.style.position = 'relative';
  addItemContainer.style.top = `${actRow.getBoundingClientRect().top}px`;
  addItemContainer.style.left = `${actRow.getBoundingClientRect().left}px`;

  const addItemBtn = document.createElement('button');
  addItemBtn.classList.add('add-list');
  addItemBtn.innerText = "Save";

  const cancelItemBtn = document.createElement('button');
  cancelItemBtn.classList.add('add-list');
  cancelItemBtn.classList.add('cancel');
  cancelItemBtn.style.color = 'white';
  cancelItemBtn.innerText = "X";

  addItemContainer.appendChild(addItemBtn);
  addItemContainer.appendChild(cancelItemBtn);
  focusScreen_div.appendChild(addItemContainer);

  //remover todos esses elementos criado ao fim da edição da row
  const removeTextArea = () => {
    saveInfo.remove();
    addItemBtn.remove();
    cancelItemBtn.remove();
    addItemContainer.remove();
    focusScreen_div.style.display = 'none';
  }

  //verificar se o Enter foi pressionado e confirmar edição
  saveInfo.addEventListener('keypress', (event) => {
    if (event.key !== "Enter") return;
    actRow.innerText = saveInfo.value;
    removeTextArea();
    attAllData();
  });
  //verificar se o addbutton foi pressionado e confirmar edição
  addItemBtn.addEventListener('click', () => {
    if (saveInfo.value === '') return;
    actRow.innerText = saveInfo.value;
    removeTextArea();
    attAllData();
  });
  //Cancel button funcionality
  cancelItemBtn.addEventListener('click', () => {
    removeTextArea();
  });
}

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  objList = [];
  if (localStorage.getItem('objList')) {
    //Caso já tenha localStorage nessa máquina, ele será transferido para o array objList que será inserido na tela
    objList = JSON.parse(localStorage.objList);
    //executando a função que cria esses elementos desse array
    addObjListData();
  }
}


//Mostrar e criar eventos drag da lixeira para excluir elementos em drag 
const seeTrashCan = () => {
  trashContainer_div.style.display = 'flex';
  trashCanClosed_img.style.display = 'block';

  trashContainer_div.addEventListener('dragenter', () => {
    trashCanClosed_img.style.display = 'none';
    trashCanOpen_img.style.display = 'block';
  })
  trashContainer_div.addEventListener('dragleave', () => {
    trashCanClosed_img.style.display = 'block';
    trashCanOpen_img.style.display = 'none';
  })
  trashContainer_div.addEventListener("dragover", function (event) {
    event.preventDefault();
  });
  //Quando o elemento é solto na área da lixeira ele é apagado
  trashContainer_div.addEventListener("drop", function (event) {
    event.preventDefault();
    trashRemove = true;

    if (dragExecutColumn){
      draggedItemColumn.remove();
      draggedItemColumn= null;
      dragExecutColumn = false;
    } else if (dragExecutRow){
      draggedItemRow.remove();
      dragExecutRow = false;
    }
    trashContainer_div.style.display = 'none';
    trashCanOpen_img.style.display = 'none';

    const prevColumnEl = document.querySelector('.column-list.prev');
    if (prevColumnEl) {
      prevColumnEl.remove();
    }
    if (prevRowElement_li) {
      prevRowElement_li.remove();
    }
    attAllData();
  });
}



//add list button Functionality
addNewList_div.addEventListener('click', addNewList);
getSavedColumns();