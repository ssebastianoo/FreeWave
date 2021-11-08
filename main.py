import youtubesearchpython, pafy, flask_socketio
from flask import Flask, render_template, redirect

app = Flask(__name__)
socketio = flask_socketio.SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@socketio.on('search')
def play(song_query):
    url = youtubesearchpython.VideosSearch(song_query, limit=1).result()['result'][0]['link']
    song = pafy.new(url)
    flask_socketio.emit('queryResult', song.getbestaudio().url)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=8888)