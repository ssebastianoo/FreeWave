let nowPlaying;
let queue = [];
let queueNumber = -1;
let queueDiv = document.getElementById('queue');
let controller = document.getElementById('controller');
let socket = io.connect();
let cookieID;

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
}

window.onload = function() {
    cookieID = getCookie('cookieID');
    if (cookieID) {
        socket.emit('getCookie', cookieID);
    } else {
        cookieID = Date.now();
        document.cookie = setCookie('cookieID', cookieID, 365);
    }
}

function updateCookie() {
    if (cookieID) {
        let cookieQueue = [];
        for (i=0; i < queue.length; i++) {
            cookieQueue.push({
                src: queue[i].audio.src,
                currentTime: queue[i].audio.currentTime,
                title: queue[i].element.innerText
            });
        };
        socket.emit('updateCookie', {
            cookieID: cookieID,
            queue: cookieQueue,
            queueNumber: queueNumber
        });
    };
};

function search() {
    socket.emit('search', query.value);
};

function queueManager() {
    if (nowPlaying) {
        if (nowPlaying.audio.ended) {
            if (queueNumber+1 < queue.length) {
                queueNumber++;
                play(queue[queueNumber]);
                updateCookie();
            }
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
    updateCookie();
};

socket.on('cookie', function (cookie) {
    for (i=0; i < cookie.queue.length; i++) {
        let song = cookie.queue[i];
        let audio = document.createElement('audio');
        audio.src = song.src;
        audio.currentTime = song.currentTime;
        audio.controls = true;

        let element = document.createElement('li');
        element.innerText = song.title;
        queue.push({
            audio: audio,
            element: element
        });
        queueDiv.appendChild(element);
    }
    queueNumber = cookie.queueNumber;

    if (queueNumber >= 0) {
        controller.innerHTML = '';
        controller.appendChild(queue[queueNumber].audio);
        nowPlaying = queue[queueNumber];
        playPause();
    };
})

socket.on('queryResult', function (data) {
    let li = document.createElement('li');
    li.innerText = data.info.title;
    queueDiv.appendChild(li);

    let audio = document.createElement('audio');
    audio.src = data.url;
    audio.controls = true;
    audio.preload = 'auto';
    queue.push({audio: audio, element: li});
    if (!nowPlaying) { 
        queueNumber++;
        play(queue[queueNumber]); 
    };
    updateCookie();
})