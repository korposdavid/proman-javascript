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
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
            dom.hideLoadingContent();
            for (let board of boards) {
                dom.loadColumns(board.id);
            }
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        let boardList = '';

        for (let board of boards) {
            boardList += `
                <section class="board" data-board-id="${board.id}">
                    <div class="board-header"><span class="board-title">${board.title}</span>
                        <button class="board-add add-card">Add Card</button>
                        <button class="board-add add-column" value="/new-column/${board.id}">Add Column</button>
                        <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="board-columns" id="board-column-${board.id}"></div>
                </section>
            `;
        }

        const outerHtml = `
            <div class="board-container">
                ${boardList}
            </div>
        `;

        this._appendToElement(document.querySelector('#boards'), outerHtml);
        dom.addNewColumnButtons();
    },
    loadColumns: function (boardId) {
        // retrieves columns for boards and makes showColumns called
        dataHandler.getColumns(boardId, function (columns) {
            dom.showColumns(columns, boardId);
            for (let column of columns) {

                dom.loadCards(column.id, boardId)

            }
        });
    },
    showColumns: function (columns, boardId) {
        let columnList = '';

        for (let column of columns) {
            columnList += `
                <div class="board-column">
                    <div class="board-column-title">${column.title}</div>
                        <div class="board-column-content" id="board-${boardId}-column-${column.id}">
                        </div>
                    </div>
                </div>
            `;
        }
        this._appendToElement(document.querySelector('#board-column-' + boardId.toString()), columnList)
    },
    loadCards: function (columnId, boardId) {
        // retrieves cards and make s showCards called
        dataHandler.getCardsByBoardId(columnId, boardId, function (cards) {
            dom.showCards(cards)
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
                <div class="card">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title">${card.title}</div>
                </div>
            `;
        }
        this._appendToElement(document.querySelector('#board-' + boardId.toString() + '-column-' + statusId.toString()), cardList)

    },
    addNewColumnButtons: function () {
        let newColButtons = document.getElementsByClassName("add-column")
        for (let button of newColButtons) {
            button.addEventListener('click', function() {
                let request = new XMLHttpRequest();
                request.open("GET", button.value, true);
                request.send();
                request.onload = function() {
                    let response = JSON.parse(request.response);
                    dom.showColumns([{'id': response.status_id, 'title': response.status_title}], response.board_id);
                }
            })
        }
    },
    // here comes more features
    newBoardBtn: function () {
        let button = document.getElementById('new-board');
        button.addEventListener('click', function () {

            let request = new XMLHttpRequest();
            request.open('GET', '/new-board', true)
            request.send();
            request.onload = function () {
                let columnList = '';
                let columnsData = JSON.parse(request.response);
                for (let column of columnsData) {
                    columnList += dom.generateColumnHtml(column.board_id, column.status_id, column.status_title);
                }
                let newBoardHtml = dom.generateBoardHtml(columnsData[0].board_id, columnsData[0].board_title, columnList)

                let container = document.querySelector('.board-container');
                container.insertAdjacentHTML('beforeend', newBoardHtml)
            }

        })
    },

    generateColumnHtml: function (board_id, status_id, status_title) {

        let columnElement = `
                <div class="board-column">
                    <div class="board-column-title">${status_title}</div>
                        <div class="board-column-content" id="board-${board_id}-column-${status_id}">
                    </div>
                </div>
            `;

        return columnElement
    },

    generateBoardHtml: function (board_id, board_title, columnList) {

        let boardElement = `
        <section class="board" data-board-id="${board_id}">
            <div class="board-header"><span class="board-title">${board_title}</span>
                <button class="board-add add-card">Add Card</button>
                <button class="board-add add-column" value="/new-column/${board_id}">Add Column</button>
                <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
            </div>
        <div class="board-columns" id="board-column-${board_id}">
            ${columnList}
        </div>
         </section>
        `;

        return boardElement
    }

    hideLoadingContent: function () {
        document.querySelector('#loading').textContent = '';

    }
};
