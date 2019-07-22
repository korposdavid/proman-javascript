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
                       SELECT title FROM boards;
                       ''')
    result = cursor.fetchall()
    return result


@connection.connection_handler
def get_cards_for_board(cursor, board_id):
    cursor.execute('''
                   SELECT cards.title, statuses.title, cards.card_order FROM cards
                   LEFT JOIN statuses ON status_id=statuses.id
                   WHERE board_id = %(board_id)s;
                   ''',
                   {'board_id': board_id})
    result = cursor.fetchall()
    return result

