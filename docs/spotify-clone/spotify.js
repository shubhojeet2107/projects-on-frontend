console.log("We are writing javascript");

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/docs/spotify-clone/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs;
}

async function main() {
    let songs = await getSongs();
    console.log(songs);

    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    let currentAudio = null;
    let currentlyPlayingIcon = null;
    let currentIndex = -1;

    const songLists = document.querySelectorAll(".songlist");
    const greenBtn = document.querySelector(".box-1");
    const greenIcon = document.querySelector(".img-m-1");

    const shuffleBtn = document.querySelector(".shuffle");
    const repeatBtn = document.querySelector(".repeat");
    const prevBtn = document.querySelector(".previous");
    const nextBtn = document.querySelector(".next");
    const playBtn = document.querySelector(".play");

    let isShuffle = false;
    let isRepeat = false;

    shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;
        shuffleBtn.style.filter = isShuffle ? "invert(100%)" : "invert(50%)";
    });

    repeatBtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        repeatBtn.style.filter = isRepeat ? "invert(100%)" : "invert(50%)";
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            playSong(currentIndex - 1);
        }
    });

    nextBtn.addEventListener("click", () => {
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playSong(randomIndex);
        } else {
            let nextIndex = (currentIndex + 1) % songs.length;
            playSong(nextIndex);
        }
    });

    playBtn.addEventListener("click", () => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                playBtn.src = "right-section/pause.svg";
            } else {
                currentAudio.pause();
                playBtn.src = "right-section/play.svg";
            }
        } else {
            playSong(0);
            playBtn.src = "right-section/pause.svg";
        }
    });

    function playSong(index) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.removeEventListener("timeupdate", updateProgress);
            currentAudio.removeEventListener("ended", handleSongEnd);
        }

        if (currentlyPlayingIcon) {
            currentlyPlayingIcon.classList.remove("fa-pause");
            currentlyPlayingIcon.classList.add("fa-play");
        }

        currentAudio = new Audio(songs[index]);
        currentAudio.play();

        progressBar.value = 0;
        currentTimeEl.textContent = "0:00";
        durationEl.textContent = "0:00";

        currentAudio.addEventListener("loadedmetadata", () => {
            progressBar.max = currentAudio.duration;
            durationEl.textContent = formatTime(currentAudio.duration);
        });

        function updateProgress() {
            progressBar.value = currentAudio.currentTime;
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
            const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressBar.style.setProperty('--progress', `${percent}%`);
        }

        function handleSongEnd() {
            if (isRepeat) {
                playSong(currentIndex); // replay the same song
            } else if (isShuffle) {
                const randomIndex = Math.floor(Math.random() * songs.length);
                playSong(randomIndex);
            } else {
                let nextIndex = (currentIndex + 1) % songs.length;
                playSong(nextIndex);
            }
        }

        currentAudio.addEventListener("timeupdate", updateProgress);
        currentAudio.addEventListener("ended", handleSongEnd);

        const songElement = songLists[index];
        const playIcon = songElement.querySelector(".play-icon i");
        playIcon.classList.remove("fa-play");
        playIcon.classList.add("fa-pause");
        greenIcon.src = "right-section/pause.svg";

        currentlyPlayingIcon = playIcon;
        currentIndex = index;
    }

    songLists.forEach((songElement, index) => {
        const playIcon = songElement.querySelector(".play-icon i");

        playIcon.addEventListener("click", (e) => {
            e.stopPropagation();

            if (currentIndex === index && currentAudio && !currentAudio.paused) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                playIcon.classList.remove("fa-pause");
                playIcon.classList.add("fa-play");
                greenIcon.src = "right-section/m-1.svg";
                currentAudio = null;
                currentlyPlayingIcon = null;
            } else {
                playSong(index);
            }
        });
    });

    greenBtn.addEventListener("click", () => {
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            greenIcon.src = "right-section/m-1.svg";

            if (currentlyPlayingIcon) {
                currentlyPlayingIcon.classList.remove("fa-pause");
                currentlyPlayingIcon.classList.add("fa-play");
            }
        } else {
            if (currentAudio) {
                currentAudio.play();
                greenIcon.src = "right-section/pause.svg";

                if (currentlyPlayingIcon) {
                    currentlyPlayingIcon.classList.remove("fa-play");
                    currentlyPlayingIcon.classList.add("fa-pause");
                }
            } else {
                playSong(0);
            }
        }
    });

    progressBar.addEventListener('input', () => {
        if (currentAudio) {
            currentAudio.currentTime = progressBar.value;
        }
    });
}

main();
