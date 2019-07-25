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
                       SELECT title, id FROM boards
                       ORDER BY id;
                       ''')
    result = cursor.fetchall()
    return result


@connection.connection_handler
def get_cards_for_board(cursor, board_id, column_id):
    cursor.execute('''
                   SELECT id, title, status_id, board_id FROM cards
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
                   ORDER BY statuses.id ASC;
                   ''',
                   {'board_id': board_id})
    result = cursor.fetchall()
    return result


@connection.connection_handler
def rename_board_by_id(cursor, board_id, new_title):
    cursor.execute('''
                   UPDATE boards
                   SET title = %(new_title)s
                   WHERE id = %(board_id)s
                   ''',
                   {'board_id': board_id,
                    'new_title': new_title})


@connection.connection_handler
def rename_column_by_id(cursor, column_id, new_title):
    cursor.execute('''
                   UPDATE statuses
                   SET title = %(new_title)s
                   WHERE id = %(column_id)s
                   ''',
                   {'column_id': column_id,
                    'new_title': new_title})


@connection.connection_handler
def rename_card_by_id(cursor, card_id, new_title):
    cursor.execute('''
                   UPDATE cards
                   SET title = %(new_title)s
                   WHERE id = %(card_id)s
                   ''',
                   {'card_id': card_id,
                    'new_title': new_title})
