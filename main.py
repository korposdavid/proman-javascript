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
    :param column_id: id of the parent column
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


@app.route("/new-column/<int:board_id>")
@json_response
def add_new_column_to_board(board_id: int):
    """
    Adds new column to a board
    :param board_id: id of the parent board
    """
    data_handler.add_new_status_to_db()
    status = data_handler.get_newest_column_id()
    data_handler.add_connection_to_boards_statuses(board_id, status["id"])
    return {"board_id": board_id, "status_id": status["id"], "status_title": status["title"]}


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
