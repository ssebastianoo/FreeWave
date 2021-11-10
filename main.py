import youtubesearchpython, pafy, flask_socketio, config
from flask import Flask, render_template, redirect

app = Flask(__name__)
socketio = flask_socketio.SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@socketio.on('search')
def play(song_query):
    song_info = youtubesearchpython.VideosSearch(song_query, limit=1).result()['result'][0]
    song = pafy.new(song_info['link'])
    flask_socketio.emit('queryResult', {'url': song.getbestaudio().url, 'info': song_info})

if __name__ == '__main__':
    socketio.run(app, debug=config.debug, host='0.0.0.0', port=config.port)