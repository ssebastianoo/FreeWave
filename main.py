import youtubesearchpython, youtube_dl, flask_socketio, config
from flask import Flask, render_template, redirect

ydl_opts = {
    'format': 'bestaudio',
}

ytdl =  youtube_dl.YoutubeDL(ydl_opts)
app = Flask(__name__)
socketio = flask_socketio.SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

cookies = dict()

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@socketio.on('search')
def play(song_query):
    try:
        song_info = youtubesearchpython.VideosSearch(song_query, limit=1).result()['result'][0]
    except IndexError:
        return flask_socketio.emit('notFound', song_query) 

    song = ytdl.extract_info(song_info['link'], download=False)
    flask_socketio.emit('queryResult', {'url': song['formats'][0]['url'], 'info': song_info})

@socketio.on('updateCookie')
def update_cookie(data):
    cookies[str(data['cookieID'])] = {'queue': data['queue'], 'queueNumber': data['queueNumber']}

@socketio.on('getCookie')
def get_cookie(cookie):
    if not cookies.get(cookie):
        cookies[cookie] = {'queue': [], 'queueNumber': -1}
    flask_socketio.emit('cookie', cookies[cookie])

if __name__ == '__main__':
    socketio.run(app, debug=config.debug, host='0.0.0.0', port=config.port)