from functools import wraps
from flask import jsonify, session, redirect, url_for
import bcrypt


def json_response(func):
    """
    Converts the returned dictionary into a JSON response
    :param func:
    :return:
    """
    @wraps(func)
    def decorated_function(*args, **kwargs):
        return jsonify(func(*args, **kwargs))

    return decorated_function



def hash_password(plain_text_password):
    # By using bcrypt, the salt is saved into the hash itself
    hashed_bytes = bcrypt.hashpw(plain_text_password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')


def verify_password(plain_text_password, hash_to_verify):
    hashed_bytes_password = hash_to_verify.encode('utf-8')
    return bcrypt.checkpw(plain_text_password.encode('utf-8'), hashed_bytes_password)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):        #USERNAME AND LOGIN WATCH OUT
        if not session.get('username'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)

    return decorated_function
