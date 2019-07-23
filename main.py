from flask import Flask, render_template, url_for
from util import json_response

import data_handler

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


@app.route("/get-cards/<int:board_id>/<int:column_id>")
@json_response
def get_cards_for_board(board_id: int, column_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id, column_id)


@app.route("/get-columns/<int:board_id>")
@json_response
def get_columns_for_board(board_id: int):
    """
    All columns that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_columns_for_board_id(board_id)


@app.route("/new-board")
@json_response
def new_board():
    try:
        data_handler.add_new_board()
        board_id = data_handler.get_latest_board_id()
        basic_status_numbers = 4
        for x in range(basic_status_numbers):
            data_handler.add_new_board_statuses(board_id, x)
        return data_handler.get_board_by_board_id(board_id)
    except:
        return {'error': 'error'}


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
