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
            dom.editContent();
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        let boardList = '';

        for (let board of boards) {
            boardList += `
                <section class="board" data-board-id="${board.id}">
                    <div class="board-header"><span class="board-title" contenteditable="true" data-name="text">${board.title}</span>
                        
                        <button class="board-add">Add Card</button>
                        <button class="board-add">Add Column</button>
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
                    <div class="board-column-title" contenteditable="true">${column.title}</div>
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
    // here comes more features

    hideLoadingContent: function () {
        document.querySelector('#loading').textContent = '';
    },

    editContent: function () {
        let titles = document.querySelectorAll('.board-title');
        titles.addEventListener('keydown', function (event) {
            let esc = event.which === 27;
            let enter = event.which === 13;
            let element = event.target;
            let text = element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA';
            let data = {};

            if(text){
                if(esc){
                    document.querySelectorAll('.board-title').execCommand('undo');
                    element.blur();
                } else if (enter){
                    data[element.getAttribute('data-name')] = element.innerHTML;
                    element.blur();
                    event.preventDefault();
                }
            }
        })
    },

    hideCards: function () {
        let toggleBtn = document.getElementsByClassName("board-toggle");
        toggleBtn.addEventListener('click', function () {
            let cards = document.getElementsByClassName("board-column");
            cards.hidden=true;
        })
    }

};
