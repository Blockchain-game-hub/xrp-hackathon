'''
Hackathon (Andrew Snow)
Shamir Secret Sharing API implementation
Based off: https://github.com/shea256/secret-sharing
'''

import json
from flask import Flask, request
import sharing
import sys

app = Flask(__name__)

def shamirSpilt(textInput):
    res = sharing.PlaintextToHexSecretSharer.split_secret(textInput, 2, 4)
    return res


def shamirRecover(fullIndexes, wholeInput):
    wholeInput = [x.encode('ascii') for x in wholeInput]
    indexes = ''
    for indvIndex in fullIndexes:
        indexes = '%s%s' % (indexes, str(int(indvIndex[:1])-1))
        indexes = '%s,' % indexes
    indexes = indexes[:-1]
    pieceVet = indexes.split(',')
    pieceVet = map(int, pieceVet)
    recovVet = []
    for i in range(0, len(wholeInput)):
        if i in pieceVet:
            recovVet.append(wholeInput[i])
    ret = sharing.PlaintextToHexSecretSharer.recover_secret(recovVet)
    return ret


def throw_message(key, message):
    return_msg = str(json.dumps({
        key: message
    }))
    return return_msg


@app.route('/recover', methods=['GET', 'POST'])
def recover():
    if request.method == "POST" and 'Content-Type' in request.headers and request.headers['Content-Type'] == 'application/json':
        request_data = request.json
        print('----------------')
        print('Received request')
        print(request_data)
        print('----------------')
        if not ('indexes' in request_data):
            return throw_message('error', 'Missing indexes')
        if not ('wholeShamir' in request_data):
            return throw_message('error', 'Missing wholeShamir')

        indexes = request_data['indexes']
        whole_shamir = request_data['wholeShamir']
        return throw_message('success', shamirRecover(indexes, whole_shamir))
    else:
        return throw_message('error', 'unauthorized')


@app.route('/split', methods=['GET', 'POST'])
def split():
    if request.method == "POST" and 'Content-Type' in request.headers and request.headers['Content-Type'] == 'application/json':
        request_data = request.json
        print('----------------')
        print('Received request')
        print(request_data)
        print('----------------')
        if not ('textInput' in request_data):
            return throw_message('error', 'Missing textInput')

        text_input = request_data['textInput']
        return throw_message('success', shamirSpilt(text_input))
    else:
        return throw_message('error', 'unauthorized')


if __name__ == '__main__':
    app.run(threaded=True, debug=True)
