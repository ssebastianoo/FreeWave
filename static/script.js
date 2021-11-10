let nowPlaying;
let queue = [];
let queueNumber = -1;
let queueDiv = document.getElementById('queue');
let controller = document.getElementById('controller');
let socket = io.connect();

function search() {
    socket.emit('search', query.value);
};

function queueManager() {
    if (nowPlaying) {
        if (nowPlaying.audio.ended) {
            queueNumber++;
            if (queueNumber < queue.length) {
                play(queue[queueNumber]);
            };
        };
    };
};
setInterval(queueManager, 1000);

function play(song) {
    if (nowPlaying) {
        nowPlaying.element.classList.remove('playing');
        nowPlaying.audio.pause();
    };

    controller.innerHTML = '';
    controller.appendChild(song.audio);
    song.audio.play();
    song.element.classList.add('playing');

    nowPlaying = song;
};

function playPause() {
    if (nowPlaying) {
        if (nowPlaying.audio.paused) {
            nowPlaying.audio.play();
            nowPlaying.element.classList.add('playing');
        } else {
            nowPlaying.audio.pause();
            nowPlaying.element.classList.remove('playing');
        };
    };
};

function moveTrack(mode) {
    switch (mode) {
        case 'next':
            if (queueNumber < queue.length - 1) {
                queueNumber++;
            } else {
                return;
            };
            break;
        case 'prev':
            if (queueNumber > 0) {
              queueNumber--;
            } else {
                return;
            }
            break;
    };
    play(queue[queueNumber]);
};

socket.on('queryResult', function (data) {
    let li = document.createElement('li');
    li.innerText = data.info.title;
    queueDiv.appendChild(li);

    let audio = document.createElement('audio');
    audio.src = data.url;
    audio.controls = true;
    queue.push({audio: audio, element: li});
    if (!nowPlaying) { 
        queueNumber++;
        play(queue[queueNumber]); 
    };
})