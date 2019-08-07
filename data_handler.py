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
                    SELECT board_id, status_id, b.title as board_title, s.title as status_title from boards as b
                    JOIN boards_statuses on b.id = boards_statuses.board_id
                    JOIN statuses s on boards_statuses.status_id = s.id
                    WHERE b.id = %(board_id)s
                   ''',
                   {'board_id': board_id})

    result = cursor.fetchall()
    return result


@connection.connection_handler
def add_new_status_to_db(cursor):
    cursor.execute('''
                   INSERT INTO statuses (title) VALUES ('new column');
                   ''', )


@connection.connection_handler
def get_newest_column_id(cursor):
    cursor.execute('''
                   SELECT id, title FROM statuses 
                   ORDER BY id DESC LIMIT 1;
                   ''')
    result = cursor.fetchone()
    return result


@connection.connection_handler
def add_connection_to_boards_statuses(cursor, board_id, status_id):
    cursor.execute('''
                   INSERT INTO boards_statuses (board_id, status_id) VALUES (%(board_id)s, %(status_id)s);
                   ''',
                   {'board_id': board_id,
                    'status_id': status_id})


@connection.connection_handler
def add_new_card(cursor, board_id, card_order):
    cursor.execute('''
                    INSERT INTO cards (board_id, title, status_id, card_order)
                    VALUES (%(board_id)s, 'new card', 0, %(card_order)s);
    ''', {'board_id': board_id,
          'card_order': card_order})


@connection.connection_handler
def get_card_order(cursor, board_id, status_id):
    cursor.execute('''
                    SELECT card_order FROM cards
                    WHERE board_id = %(board_id)s AND status_id = %(status_id)s
                    ORDER BY card_order DESC LIMIT 1;
    ''', {'board_id': board_id,
          'status_id': status_id})
    result = cursor.fetchone()
    if result is None:
        return -1
    return result['card_order']


@connection.connection_handler
def get_newest_card(cursor):
    cursor.execute('''
                    SELECT * FROM cards
                    ORDER BY id DESC LIMIT 1;
    ''')
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


@connection.connection_handler
def move_card(cursor, card_id, new_board, new_column):
    cursor.execute('''
                   UPDATE cards
                   SET board_id = %(new_board)s, 
                       status_id = %(new_column)s
                   WHERE id = %(card_id)s
                   ''',
                   {'card_id': card_id,
                    'new_board': new_board,
                    'new_column': new_column})


@connection.connection_handler
def register(cursor, username, password):
    cursor.execute('''
                   INSERT INTO users (user_name, password)
                   VALUES (%(username)s, %(password)s);
                   ''',
                   {'username': username,
                    'password': password})


@connection.connection_handler
def register(cursor, username, password):
    cursor.execute('''
                   INSERT INTO users (user_name, password)
                   VALUES (%(username)s, %(password)s);
                   ''',
                   {'username': username,
                    'password': password})


@connection.connection_handler
def get_hash_by_username(cursor, username):
    cursor.execute('''
                   SELECT password FROM users
                   WHERE user_name = %(username)s
                   ''',
                   {'username': username})
    result = cursor.fetchone()
    return result['password']


@connection.connection_handler
def get_user_id_by_username(cursor, username):
    cursor.execute('''
                   SELECT id FROM users
                   WHERE user_name = %(username)s
                   ''',
                   {'username': username})
    result = cursor.fetchone()
    return result['id']


