let socket = io.connect();
let query = document.getElementById('query');
let songs = document.getElementById('songs');

socket.on('queryResult', function (songUrl) {
    let audio = document.createElement('audio');
    audio.controls = true;
    audio.src = songUrl;
    songs.appendChild(audio);
    audio.play();
})

function search() {
    socket.emit('search', query.value);
};