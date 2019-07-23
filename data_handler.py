import connection


@connection.connection_handler
def get_card_status(cursor, status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    cursor.execute('''
                   SELECT title from statuses
                   WHERE id = %(status_id)s;
                   ''',
                   {'id': status_id})
    result = cursor.fetchone()
    return result['title']


@connection.connection_handler
def get_boards(cursor):
    """
    Gather all boards
    :return:
    """
    cursor.execute('''
                       SELECT title, id FROM boards;
                       ''')
    result = cursor.fetchall()
    return result


@connection.connection_handler
def get_cards_for_board(cursor, board_id, column_id):
    cursor.execute('''
                   SELECT title, status_id, board_id FROM cards
                   WHERE board_id = %(board_id)s AND status_id = %(column_id)s
                   ORDER BY card_order;
                   ''',
                   {'board_id': board_id,
                    'column_id': column_id})
    result = cursor.fetchall()
    return result


@connection.connection_handler
def get_columns_for_board_id(cursor, board_id):
    cursor.execute('''
                   SELECT statuses.title, statuses.id
                   FROM boards_statuses JOIN statuses ON boards_statuses.status_id = statuses.id
                   WHERE boards_statuses.board_id = %(board_id)s
                   ''',
                   {'board_id': board_id})
    result = cursor.fetchall()
    return result


@connection.connection_handler
def add_new_board(cursor):
    cursor.execute('''
                   INSERT INTO boards (title)
                   VALUES ('New Board')
                   ''')


@connection.connection_handler
def add_new_board_statuses(cursor, board_id, status_id):
    cursor.execute('''
                   INSERT INTO boards_statuses (board_id, status_id)
                   VALUES (%(board_id)s, %(status_id)s)
                   ''',
                   {'board_id': board_id,
                    'status_id': status_id})


@connection.connection_handler
def get_latest_board_id(cursor):
    cursor.execute('''
                   SELECT id
                   FROM boards
                   ORDER BY id DESC LIMIT 1
                   ''')
    result = cursor.fetchone()
    return result['id']


@connection.connection_handler
def get_board_by_board_id(cursor, board_id):
    cursor.execute('''
                   SELECT *
                   FROM boards
                   WHERE id = %(board_id)s
                   ''')
    result = cursor.fetchall()
    return result
