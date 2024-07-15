// roomservice

const APP_ID = 'ab01f05029d0454b93321dc63b970186'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'));
//3. get name from session (next:models)
let NAME = sessionStorage.getItem('name')

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try{
        //joining the channel
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    }catch(error){
        console.error(error)
        window.open('/', '_self') 
    }

    //storing audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    //9. calling createMember method and write name in video screen (next:views)
     let member = await createMember()

    //create a player
    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`

    //appending player to the video stream
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    //play that method
    localTracks[1].play(`user-${UID}`)

    //publishing the track or make it accessible to others in the channel
    //localTracks[0] -> audio  localTracks[1] -> video
    await client.publish([localTracks[0], localTracks[1]])
}

//when new user joined
let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player != null){
            player.remove()
        }
        //13. calling getMember function
         let member = await getMember(user)

        player = `<div class="video-container" id="user-container-${user.uid}">
                <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                <div class="video-player" id="user-${user.uid}"></div>
            </div>`

        //appending player to the video stream
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType == 'audio'){
        user.audioTrack.play()
    }
}

//when user left
let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

//leave local stream
let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    //This is somewhat of an issue because if user leaves without actual pressing leave button, it will not trigger
     deleteMember()
    window.open('/', '_self')
} 

//toggleCamera
let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 20, 1)'
    }
}

//toggleMic
let toggleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 20, 1)'
    }
}

//8. createMember to show member names in video screen
 let createMember = async () => {
     let response = await fetch('/create_member/', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify({'name': NAME, 'room_name': CHANNEL, 'UID': UID})
     })
     let member = await response.json()
     return member
 }

//12. getMember function
 let getMember = async (user) => {
     let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
     let member = await response.json()
     return member
 }

 let deleteMember = async () => {
     let response = await fetch('/delete_member/', {
         method:'POST',
         headers: {
             'Content-Type':'application/json'
         },
         body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
     })
     let member = await response.json()
 }

joinAndDisplayLocalStream()

window.addEventListener('beforeunload', deleteMember);

document.getElementById(`leave-btn`).addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById(`camera-btn`).addEventListener('click', toggleCamera)
document.getElementById(`mic-btn`).addEventListener('click', toggleMic)