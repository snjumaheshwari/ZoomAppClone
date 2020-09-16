const socket = io('/')
const videoGrid = document.querySelector('#video-grid');
const selfVideo = document.querySelector('.self');

const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: 8080
})
let peerUsers = {};
let messageBox;
let connectedUsers;
let myVideoStream;
let currentUser;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream, true);

    peer.on('call', call => {
        call.answer(stream)

        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, false)
        })
    })

    socket.on('user-connected', (userID, UserName, RoomUsers) => {
        connecToNewUser(userID, stream, UserName);
        currentUser = userID;
        connectedUsers = [...RoomUsers];
    })


    let text = $('input')

    $('html').keydown((event) => {
        if (event.which == 13 && text.val().length != 0) {
            socket.emit('message', text.val(), UserName);
            text.val('');
        }
    })

    socket.on('createMessage', (message, UserName, Messages) => {
        $('.messages').append(`<li class="message"><span>${UserName}</span>: ${message}<li>`)
        messageBox = [...Messages];
        scrollToBottom()
    })
})

socket.on('user-disconnect', (userID) => {
    if (peerUsers[userID]) {
        peerUsers[userID].close();
    }
})



peer.on('open', id => {
    socket.emit('join-room', RoomID, id, UserName);
})

const connecToNewUser = (userID, stream) => {
    const call = peer.call(userID, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream, false)
    })
}

const disconnectToUser = () => {
    const call = peer.call(currentUser, myVideoStream);
    call.on('close', () => {
        video.remove();
    })
    peerUsers[currentUser] = call;

    window.location.href = "http://127.0.0.1:8080/";
}

const addVideoStream = (video, stream, userVideo) => {
    video.srcObject = stream;
    video.setAttribute("controlslist",'fullscreen');

    if (userVideo) {
        video.id = "myVideoStream";
        video.addEventListener('loadedmetadata', () => {
            video.play();
        })
        selfVideo.append(video);
    }
    else {
        video.addEventListener('loadedmetadata', () => {
            video.play();
        })
        videoGrid.append(video)
    }

}

const scrollToBottom = () => {
    let d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}


const stopPlay = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setUnmuteButton = () => {
    const render = `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`

    document.querySelector('.main_mute_button').innerHTML = render;
}

const setMuteButton = () => {
    const render = `<i class="mute fas fa-microphone"></i>
    <span>Mute</span>`

    document.querySelector('.main_mute_button').innerHTML = render;
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.avatar').style.display = 'none';
    document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="active fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.avatar').style.display = 'flex';
    document.querySelector('.main_video_button').innerHTML = html;
}


const showParticipants = () => {

    $('.header').text('Participants');
    $('.participants').css('display', 'block');
    $('.messages').css('display', 'none');
    $('.main_message_container').css('display', 'none');
    $('.participants').empty();

    if (connectedUsers) {
        connectedUsers.forEach((user) => {
            $('.participants').append(`<li class="user">${user[0]}</li>`);
        })
    }
}


const showChatWindow = () => {

    $('.header').text('Chats');
    $('.participants').css('display', 'none');
    $('.messages').css('display', 'block');
    $('.main_message_container').css('display', 'flex');
    $('.messages').empty();

    if (messageBox) {
        messageBox.forEach((msg) => {
            $('.messages').append(`<li class="message"><span>${msg[0]}</span> : ${msg[1]}<li>`);
        })
    }

}
