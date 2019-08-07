from flask import Flask, render_template, url_for, request, json, jsonify, session
from util import json_response
import util
import os

import data_handler

app = Flask(__name__)

app.secret_key = os.environ.get('secret_key')


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


@app.route("/rename/board", methods=['POST'])
@json_response
def rename_board():
    data = json.loads(request.data)
    id = data['id']
    new_title = data['newTitle']

    return data_handler.rename_board_by_id(id, new_title)


@app.route("/rename/column", methods=['POST'])
@json_response
def rename_column():
    data = json.loads(request.data)
    id = data['id']
    new_title = data['newTitle']

    return data_handler.rename_column_by_id(id, new_title)


@app.route("/rename/card", methods=['POST'])
@json_response
def rename_card():
    data = json.loads(request.data)
    id = data['id']
    new_title = data['newTitle']

    return data_handler.rename_card_by_id(id, new_title)


@app.route("/move-card", methods=['POST'])
@json_response
def move_card():
    data = json.loads(request.data)

    return data_handler.move_card(data['card-id'], data['new-board'], data['new-column'])


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


@app.route("/new-card/<int:board_id>")
@json_response
def add_new_card_to_board(board_id: int):
    card_order = data_handler.get_card_order(board_id, 0) + 1
    data_handler.add_new_card(board_id, card_order)
    return data_handler.get_newest_card()


@app.route('/registration', methods=['POST'])
@json_response
def registration():
    data = json.loads(request.data)
    username = data['username']
    password = util.hash_password(data['password'])
    try:
        return data_handler.register(username, password)
    except:
        return {'invalid': True}


@app.route('/login', methods=['POST'])
def login():
    data = json.loads(request.data)
    hashed_pw = data_handler.get_hash_by_username(data['username'])
    if hashed_pw and util.verify_password(data['password'], hashed_pw):
        session['username'] = data['username']
        session['user_id'] = data_handler.get_user_id_by_username(session['username'])
        return session['username']
    else:
        return {'invalid': True}


@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('user_id', None)
    return render_template('index.html')

def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
