let songs;
let currSong = new Audio();
let currFolder;
function secondsToMinSec(seconds) {
    if (isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePlayPause() {
    if (currSong.paused) {
        currSong.play();
        play.src = "img/pause.svg";
    } else {
        currSong.pause();
        play.src = "img/play.svg";
    }
}

const playMusic = (track, pause = false) => {
    currSong.src = `/SPOTIFY-INSPIRED-MUSIC-PLAYER/songs/${currFolder}/` + track
    if (!pause) {
        currSong.play()
        play.src = "img/pause.svg"
    }
    track = decodeURI(track)
    track = track.replace(".mp3", "");
    if (window.innerWidth < 500 && track.length > 10) {
        track = track.slice(0, 10) + "...";
    }
    if (track.length > 30) track = track.slice(0, 30) + "...";
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function getSongs(currFolder) {
    currFolder = currFolder.replaceAll(" ", "%20")
    let a = await fetch(`/SPOTIFY-INSPIRED-MUSIC-PLAYER/songs/${currFolder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${currFolder}/`)[1])
        }
    }

    //Show all the songs in the playlist
    document.querySelector(".songList").getElementsByTagName("ul")[0].innerHTML = ""
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]

    for (const song of songs) {

        let songName = song.replaceAll("%20", " ")
        songName = songName.replace(".mp3", "");

        songUL.innerHTML = songUL.innerHTML + `<li><img src="img/music.svg" alt="">
                            <div class="info">
                                <div>
                                    ${songName}
                                </div>
                                <div>
                                    Nishant
                                </div>
                            </div>
                            <img class="playnow invert" src="img/play.svg" alt="">  </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3")
        })
    })


}

async function displayAlbums() {
    let a = await fetch(`/SPOTIFY-INSPIRED-MUSIC-PLAYER/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let c = 1
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes("/songs/") && !element.href.includes(".htaccess")) {
            if (c==1) {
                currFolder = element.href.split("/songs/")[1]
                c = 0
            }
            //Show all the albums
            let albumUL = document.querySelector(".cardContainer")
            let a = await fetch(element.href)
            let response = await a.text()
            let div = document.createElement("div")
            div.innerHTML = response;
            let as = div.getElementsByTagName("a")
            let img;
            let title;
            let description;
            for (let index = 0; index < as.length; index++) {
                const element = as[index];
                if (element.href.endsWith(".jpg") || element.href.endsWith(".png") || element.href.endsWith(".jpeg")) {
                    img = element
                }
                if (element.href.endsWith(".json")) {
                    title = (await (await fetch(element.href)).json()).title
                    description = (await (await fetch(element.href)).json()).description
                }
            }
            albumUL.innerHTML = albumUL.innerHTML + `<div data-folder="${title}" class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="45" height="45">
                                <!-- Green background -->
                                <circle cx="12" cy="12" r="12" fill="#22c55e" />

                                <!-- Black play icon -->
                                <path d="M9 7.5L17 12L9 16.5V7.5Z" fill="#000000" />
                            </svg>

                        </div>
                        <img src="${img}" alt="">
                        <h2>${title}</h2>
                        <p>${description}</p>
                    </div>`;
        }
    }
}

async function main() {
    // Display all the albums on the page
    await displayAlbums();

    //Get the list of all songs
    await getSongs(currFolder);

    playMusic(songs[0], true)

    // Attach an event listener to play
    play.addEventListener("click", togglePlayPause);

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            togglePlayPause();
        }
    });


    // Add an event listener to previous
    previous.addEventListener("click", () => {

        let index = songs.indexOf(currSong.src.split("/").splice(-1)[0])
        if (index > 0) playMusic(songs[index - 1])
    })

    // Add an event listener to next
    next.addEventListener("click", () => {

        let index = songs.indexOf(currSong.src.split("/").splice(-1)[0])
        if ((index + 1) < songs.length) playMusic(songs[index + 1])
    })

    // Listen for time update event
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinSec(currSong.currentTime)} / ${secondsToMinSec(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%"
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currSong.currentTime = ((currSong.duration) * percent) / 100
    })

    // Handling music end
    currSong.addEventListener("ended", () => {
        let index = songs.indexOf(currSong.src.split("/").splice(-1)[0])
        if ((index + 1) < songs.length) playMusic(songs[index + 1])
        else play.src = "img/play.svg";
    });

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event to volume bar
    document.querySelector(".volume-bar").addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100;
        if (currSong.volume == 0) document.querySelector(".volume").src = "img/mute.svg"
        else document.querySelector(".volume").src = "img/volume.svg"
    }
    )

    // Add an event to volume button
    document.querySelector(".volume").addEventListener("click", () => {
        if (currSong.volume > 0) {
            currSong.volume = 0
            document.querySelector(".volume-bar").value = "0"
            document.querySelector(".volume").src = "img/mute.svg"
        }
        else {
            currSong.volume = 0.2
            document.querySelector(".volume-bar").value = "20"
            document.querySelector(".volume").src = "img/volume.svg"
        }
    }
    )

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            currFolder = item.currentTarget.dataset.folder
            await getSongs(currFolder)
            playMusic(songs[0], true)
            togglePlayPause()
        }
        )
    }
    )

}

main()