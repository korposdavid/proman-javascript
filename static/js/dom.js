// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";

export let dom = {
    _appendToElement: function (elementToExtend, textToAppend, prepend = false) {
        // function to append new DOM elements (represented by a string) to an existing DOM element
        let fakeDiv = document.createElement('div');
        fakeDiv.innerHTML = textToAppend.trim();

        for (let childNode of fakeDiv.childNodes) {
            if (prepend) {
                elementToExtend.prependChild(childNode);
            } else {
                elementToExtend.appendChild(childNode);
            }
        }

        return elementToExtend.lastChild;
    },
    init: function () {
        // This function should run once, when the page is loaded.
        dom.initDragDrop();
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
            dom.hideLoadingContent();
            for (let board of boards) {
                dom.loadColumns(board.id);
            }
            dom.editBoardContent();
            dom.hideCards();
            dom.registration();
            dom.login();
            dom.deleteBoards();
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        let boardList = '';

        for (let board of boards) {
            boardList += dom.generateBoardHtml(board.id, board.title);
        }

        const outerHtml = `
            <div class="board-container">
                ${boardList}
            </div>
        `;

        this._appendToElement(document.querySelector('#boards'), outerHtml);
        dom.addNewColumnButtons();
        dom.addNewCardButtons();
    },
    loadColumns: function (boardId) {
        // retrieves columns for boards and makes showColumns called
        dataHandler.getColumns(boardId, function (columns) {
            dom.showColumns(columns, boardId);
            for (let column of columns) {
                dom.loadCards(column.id, boardId)
            }
            dom.editColumnContent();
        });
    },
    disableColumnAdders: function () {
        let newColButtons = document.getElementsByClassName("add-column");
        for (let button of newColButtons) {
            let columnCount = button.parentElement.parentElement.childNodes[3].childElementCount;
            let maxColumnCount = 8;
            if (columnCount >= maxColumnCount) {
                button.disabled = true;
            }
        }
    },
    showColumns: function (columns, boardId) {
        let columnList = '';

        for (let column of columns) {
            columnList += dom.generateColumnHtml(boardId, column.id, column.title);
        }
        this._appendToElement(document.querySelector('#board-column-' + boardId.toString()), columnList);
        dom.editColumnContent();
    },
    loadCards: function (columnId, boardId) {
        // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(columnId, boardId, function (cards) {
            dom.showCards(cards);
            dom.editCardContent();
            dom.deleteCards();
        })

    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
        let cardList = '';
        let boardId = '';
        let statusId = '';

        for (let card of cards) {
            boardId = card.board_id;
            statusId = card.status_id;
            cardList += `
                <div class="card" draggable="true" data-id="${card.id}">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title" data-name="${card.title}" contenteditable="true"
                    data-url="/rename/card" data-id="${card.id}">${card.title}</div>
                </div>
            `;
        }
        this._appendToElement(document.querySelector('#board-' + boardId.toString() + '-column-' + statusId.toString()), cardList);
        dom.disableColumnAdders();
    },
    addNewColumnButtons: function () {
        let newColButtons = document.getElementsByClassName("add-column");
        for (let button of newColButtons) {
            button.addEventListener('click', function () {
                let columnCount = button.parentElement.parentElement.childNodes[3].childElementCount;
                let maxColumnCount = 8;
                if (columnCount < maxColumnCount) {
                    let request = new XMLHttpRequest();
                    request.open("GET", button.value, true);
                    request.send();
                    request.onload = function () {
                        let response = JSON.parse(request.response);
                        dom.showColumns([{
                            'id': response.status_id,
                            'title': response.status_title
                        }], response.board_id);
                        columnCount = button.parentElement.parentElement.childNodes[3].childElementCount;
                        if (columnCount >= maxColumnCount) {
                            button.disabled = true;
                        }
                    }
                }
            })
        }
    },
    // here comes more features
    newBoardBtn: function () {

        let button = document.getElementById('new-board');
        button.addEventListener('click', function () {
            let request = new XMLHttpRequest();
            request.open('GET', '/new-board', true);
            request.send();
            request.onload = function () {
                let columnList = '';
                let columnsData = JSON.parse(request.response);
                for (let column of columnsData) {
                    columnList += dom.generateColumnHtml(column.board_id, column.status_id, column.status_title);
                }
                let newBoardHtml = dom.generateBoardHtml(columnsData[0].board_id, columnsData[0].board_title, columnList);

                let container = document.querySelector('.board-container');
                container.insertAdjacentHTML('beforeend', newBoardHtml);
                dom.editBoardContent();
                dom.deleteBoards();
                dom.hideCards();
                dom.deleteCards();

                // Added event listeners to new boards, added an id for Add Card & Add Column in generateBoardHtml()
                // to be able to refer to them directly.

                let cardButtonId = 'new-card-' + columnsData[0].board_id;
                let cardButton = document.getElementById(cardButtonId);
                cardButton.addEventListener('click', function () {
                    let request = new XMLHttpRequest();
                    request.open("GET", cardButton.value, true);
                    request.send();
                    request.onload = function () {
                        let card = JSON.parse(request.response);
                        let cardHtml = dom.generateCardHtml(card[0].title, card[0].id);
                        dom.insertNewCard(card[0].board_id, card[0].status_id, cardHtml);
                        dom.editCardContent();
                    }
                });

                let columnButtonId = 'new-column-' + columnsData[0].board_id;
                let columnButton = document.getElementById(columnButtonId);
                columnButton.addEventListener('click', function () {
                    let columnCount = columnButton.parentElement.parentElement.childNodes[3].childElementCount;
                    let maxColumnCount = 8;
                    if (columnCount < maxColumnCount) {
                        let request = new XMLHttpRequest();
                        request.open("GET", columnButton.value, true);
                        request.send();
                        request.onload = function () {
                            let response = JSON.parse(request.response);
                            dom.showColumns([{
                                'id': response.status_id,
                                'title': response.status_title
                            }], response.board_id);
                        }
                    } else {
                        columnButton.disabled = true;
                    }
                })

            }

        })
    },

    generateColumnHtml: function (board_id, status_id, status_title) {

        let columnElement = `
                <div class="board-column" data-id="${status_id}">
                    <div class="board-column-title" contenteditable="true" data-name="${status_title}"
                    data-url="/rename/column" data-id="${status_id}">${status_title}</div>
                        <div class="board-column-content" id="board-${board_id}-column-${status_id}">
                    </div>
                </div>
            `;

        return columnElement
    },

    generateBoardHtml: function (board_id, board_title, columnList = "") {

        let boardElement = `
        <section class="board" data-board-id="${board_id}">
            <div class="board-header"><span class="board-title" contenteditable="true" data-name="${board_title}"
                    data-url="/rename/board" data-id="${board_id}">${board_title}</span>
                <button class="board-add add-card" value="/new-card/${board_id}" id="new-card-${board_id}" id="new-card-${board_id}">Add Card</button>
                <button class="board-add add-column" value="/new-column/${board_id}" id="new-column-${board_id}">Add Column</button>
                <span class="hover-text">Maximum column number reached!</span>
                <button class="board-toggle" data-board-number="board-column-${board_id}"><i class="fas fa-trash"></i><i class="fas fa-chevron-down"></i></button>
            </div>
        <div class="board-columns" id="board-column-${board_id}" data-board-id="${board_id}">
            ${columnList}
        </div>
         </section>
        `;

        return boardElement
    },

    addNewCardButtons: function () {
        let newCardButtons = document.getElementsByClassName("add-card");
        for (let button of newCardButtons) {
            button.addEventListener('click', function () {
                let request = new XMLHttpRequest();
                request.open("GET", button.value, true);
                request.send();
                request.onload = function () {
                    let card = JSON.parse(request.response);
                    let cardHtml = dom.generateCardHtml(card[0].title, card[0].id);
                    dom.insertNewCard(card[0].board_id, card[0].status_id, cardHtml);
                    dom.editCardContent();
                    dom.deleteCards();
                };
            })
        }
    },

    generateCardHtml: function (title, id) {
        return `
                <div class="card" draggable="true" data-id="${id}">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title" contenteditable="true" data-name="${title}"
                    data-url="/rename/card" data-id="${id}">${title}</div>
                </div>
            `;
    },

    insertNewCard: function (board_id, status_id, cardHtml) {
        let board = document.querySelector('#board-' + board_id + '-column-' + status_id);
        board.insertAdjacentHTML('beforeend', cardHtml);
        dom.deleteCards();
    },


    hideLoadingContent: function () {
        document.querySelector('#loading').textContent = '';
    },

    editBoardContent: function () {
        let titles = document.querySelectorAll('.board-title');
        dom.editContent(titles)
    },

    editColumnContent: function () {
        let titles = document.querySelectorAll('.board-column-title');
        dom.editContent(titles);
    },

    editCardContent: function () {
        let titles = document.querySelectorAll('.card-title');
        dom.editContent(titles);
    },

    editContent: function (titles,) {
        for (let title of titles) {
            title.addEventListener('focusout', function () {
                title.innerHTML = title.getAttribute('data-name');

            });
            title.addEventListener('keydown', function (event) {
                let esc = event.which === 27;
                let enter = event.which === 13;
                let data = {};

                if (esc) {
                    title.innerHTML = title.getAttribute('data-name');
                    title.blur();

                } else if (enter) {
                    data['newTitle'] = title.innerHTML;
                    data['id'] = title.getAttribute('data-id');
                    event.preventDefault();

                    let request = new XMLHttpRequest();
                    let URL = title.getAttribute('data-url');
                    request.open('POST', URL, true);
                    request.setRequestHeader("Content-type", 'application/json');
                    request.send(JSON.stringify(data));

                    request.onload = function () {
                        title.setAttribute('data-name', title.innerHTML);
                        title.blur();
                    }
                }
            })
        }
    },
    hideCards: function () {
        let toggleBtn = document.getElementsByClassName("board-toggle");
        for (let btn of toggleBtn) {
            btn.addEventListener('click', function () {
                const parentBoardId = btn.dataset.boardNumber;
                const parentBoard = document.getElementById(parentBoardId);
                const columnsToHide = parentBoard.querySelectorAll('.board-column');
                for (let column of columnsToHide) {
                    column.hidden = column.hidden === false ? true : false;
                }
            })
        }
    },
    initDragDrop: function () {
        dom.dragDropDragEnd();
        dom.dragDropDragEnter();
        dom.dragDropDragLeave();
        dom.dragDropDragOver();
        dom.dragDropDragStart();
        dom.dragDropDrop();
    },
    dragDropDrop: function () {
        document.addEventListener("drop", function (event) {
            event.preventDefault();
            let cardId = event.dataTransfer.getData("text/plain");
            let movedCard = document.querySelector(`.card-title[data-id=${cardId}]`).parentNode;
            let newColumn = event.target.dataset["id"];
            let newBoard = event.target.parentElement.dataset["boardId"];
            if (event.target.getAttribute('class') === "board-column") {
                //remove from old place, add to new place
                movedCard.parentNode.removeChild(movedCard);
                event.target.children[1].appendChild(movedCard);
                event.target.style.background = "";
                dom.sendMoveToServer(cardId, newColumn, newBoard);
            }
        }, false);
    },
    dragDropDragEnter: function () {
        document.addEventListener("dragenter", function (event) {
            // highlight potential drop target when the draggable element enters it
            if (event.target.getAttribute('class') === "board-column") {
                event.target.style.background = "lightgray";
            }
        }, false);
    },
    dragDropDragLeave: function () {
        document.addEventListener("dragleave", function (event) {
            // reset background of potential drop target when the draggable element leaves it
            if (event.target.getAttribute('class') === "board-column") {
                event.target.style.background = "";
            }
        }, false);
    },
    dragDropDragEnd: function () {
        document.addEventListener("dragend", function (event) {
            event.target.style.opacity = "";
        }, false);
    },
    dragDropDragOver: function () {
        document.addEventListener("dragover", function (event) {
            // prevent default to allow drop
            event.preventDefault();
        }, false);
    },
    dragDropDragStart: function () {
        document.addEventListener("dragstart", function (event) {
            let draggedId = event.target.lastElementChild.getAttribute("data-id");
            event.target.style.opacity = .5;
            event.dataTransfer.setData("text/plain", JSON.stringify(draggedId));
        }, false);
    },
    sendMoveToServer: function (cardId, newColumn, newBoard) {
        let data = {};
        data['new-column'] = newColumn;
        data['card-id'] = cardId.replace('"', '').replace('"', '');
        data['new-board'] = newBoard;
        let request = new XMLHttpRequest();
        request.open('POST', '/move-card', true);
        request.setRequestHeader("Content-type", 'application/json');
        request.send(JSON.stringify(data));
    },
    registration: function () {
        const submitBtn = document.querySelector('#regSubmit');
        submitBtn.addEventListener('click', function () {

            const data = {
                'username': document.querySelector('#registrationUsername').value,
                'password': document.querySelector('#registrationPassword').value
            };
            let request = new XMLHttpRequest();
            request.addEventListener('load', function () {
                const responseData = JSON.parse(request.response);
                if (responseData.invalid) {
                    alert('Sorry, that username is already taken!');
                }
            });

            request.open('POST', '/registration', true);
            request.setRequestHeader('Content-type', 'application/json');
            request.send(JSON.stringify(data));
            document.querySelector('#registrationUsername').value = '';
            document.querySelector('#registrationPassword').value = '';
        })
    },
    login: function () {
        const submitBtn = document.querySelector('#loginSubmit');
        submitBtn.addEventListener('click', function () {

            const data = {
                'username': document.querySelector('#loginUsername').value,
                'password': document.querySelector('#loginPassword').value
            };
            let request = new XMLHttpRequest();
            request.addEventListener('load', function () {
                const responseData = JSON.parse(request.response);
                if (responseData.invalid) {
                    alert('Sorry, wrong username or password');
                } else if (responseData.username) {
                    console.log('Successfully logged in');
                    dom.loggedIn(responseData.username);
                }

            });

            request.open('POST', '/login', true);
            request.setRequestHeader('Content-type', 'application/json');
            request.send(JSON.stringify(data));
            document.querySelector('#loginUsername').value = '';
            document.querySelector('#loginPassword').value = '';
        })
    },
    loggedIn: function (response) {
        const navBar = document.querySelector('#navbar-content');
        navBar.innerHTML = '';
        navBar.insertAdjacentHTML('beforeend', `<a class="nav-item nav-link" 
                                    href="/logout">Logout</a>
                                    <a class="nav-item nav-link" 
                                    >${response}</a>`);
        dom.addNewPrivateBoardButton();

    },
    addNewPrivateBoardButton: function () {
        const newButtons = document.getElementById('newButton');
        newButtons.insertAdjacentHTML('beforeend', `
                <button class="board-add" id="new-private-board">New private board</button>
        `)


    },

    deleteCards: function () {
        const delButton = document.querySelectorAll('.fa-trash-alt');
        for (let button of delButton) {
            button.addEventListener('click', function () {
                const cardToDelete = button.closest('.card');
                const data = {'id': cardToDelete.dataset.id};
                cardToDelete.remove();

                let request = new XMLHttpRequest();

                request.open('POST', '/delete-card', true);
                request.setRequestHeader('Content-type', 'application/json');
                request.send(JSON.stringify(data));
            })
        }

    },
    deleteBoards: function () {
        const delBoardButton = document.querySelectorAll('.fa-trash');
        for (let button of delBoardButton) {
            button.addEventListener('click', function () {
                const boardToDelete = button.closest('.board');
                const data = {'id': boardToDelete.dataset.boardId};
                boardToDelete.remove();

                let request = new XMLHttpRequest();

                request.open('POST', '/delete-board', true);
                request.setRequestHeader('Content-type', 'application/json');
                request.send(JSON.stringify(data));
            })
        }

    },

};
