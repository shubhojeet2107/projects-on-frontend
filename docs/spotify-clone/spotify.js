console.log("We are writing javascript");

async function main() {
    // Define the songs array directly
    const songs = [
        "songs/Enrique Iglesias - Somebody's Me.mp3",
        "songs/Rag'n'Bone Man - Human (Official Video).mp3",
        "songs/James Arthur - Say You Won't Let Go.mp3",
        "songs/Boulevard of Broken Dreams.mp3",
        "songs/One Direction - Night Changes (Audio).mp3",
        "songs/Avril Lavigne - Complicated ( Audio ).mp3",
        "songs/Plain White T's - Hey There Delilah (Official Audio).mp3",
        "songs/Diet Mountain Dew.mp3"
    ];
    console.log(songs); // Keep this log to verify

    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    function formatTime(time) {
        if (time == null || isNaN(time) || !isFinite(time) || time <= 0) {
            return "0:00";
        }
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
        shuffleBtn.classList.toggle("active", isShuffle);
    });

    repeatBtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle("active", isRepeat);
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
                updatePlayPauseUI(true);
            } else {
                currentAudio.pause();
                updatePlayPauseUI(false);
            }
        } else {
            if (songs.length > 0) {
                playSong(0);
            }
        }
    });

    function updatePlayPauseUI(isPlaying) {
        if (isPlaying) {
            playBtn.src = "right-section/pause.svg";
            greenIcon.src = "right-section/pause.svg";
            if (currentlyPlayingIcon) {
                currentlyPlayingIcon.classList.remove("fa-play");
                currentlyPlayingIcon.classList.add("fa-pause");
            }
        } else {
            playBtn.src = "right-section/play.svg";
            greenIcon.src = "right-section/m-1.svg";
            if (currentlyPlayingIcon) {
                currentlyPlayingIcon.classList.remove("fa-pause");
                currentlyPlayingIcon.classList.add("fa-play");
            }
        }
    }

    function playSong(index) {
        if (currentAudio) {
            currentAudio.pause();
            if (currentlyPlayingIcon && currentIndex !== index) {
                currentlyPlayingIcon.classList.remove("fa-pause");
                currentlyPlayingIcon.classList.add("fa-play");
            }
            currentAudio.removeEventListener("timeupdate", updateProgress);
            currentAudio.removeEventListener("ended", handleSongEnd);
        }

        if (index < 0 || index >= songs.length) {
            console.error("Invalid song index:", index);
            return;
        }

        currentAudio = new Audio(songs[index]);
        currentIndex = index;

        if (index < songLists.length) {
            const songElement = songLists[index];
            if (songElement) {
                const playIcon = songElement.querySelector(".play-icon i");
                if (playIcon) {
                    currentlyPlayingIcon = playIcon;
                } else {
                    console.warn(`Play icon not found for song index ${index}`);
                    currentlyPlayingIcon = null;
                }
            } else {
                console.warn(`Song element not found for index ${index}`);
                currentlyPlayingIcon = null;
            }
        } else {
            console.warn(`Song list element index ${index} out of bounds`);
            currentlyPlayingIcon = null;
        }

        currentAudio.addEventListener("timeupdate", updateProgress);
        currentAudio.addEventListener("ended", handleSongEnd);

        currentAudio.play().then(() => {
            updatePlayPauseUI(true);
            progressBar.value = 0;
            currentTimeEl.textContent = "0:00";
            durationEl.textContent = "0:00";
            progressBar.style.setProperty('--progress', `0%`);
            currentlyPlayingIcon = null;
        }).catch(error => {
            console.error("Error playing audio:", error);
            updatePlayPauseUI(false);
            if (currentlyPlayingIcon) {
                currentlyPlayingIcon.classList.remove("fa-pause");
                currentlyPlayingIcon.classList.add("fa-play");
            }
            currentAudio = null;
            currentIndex = -1;
            currentlyPlayingIcon = null;
        });
    }

    function handleLoadedMetadata() {
        console.log("Metadata loaded! Duration:", currentAudio.duration);
        if (currentAudio && currentAudio.duration > 0 && isFinite(currentAudio.duration)) {
            progressBar.max = currentAudio.duration;
            const formattedDuration = formatTime(currentAudio.duration);
            durationEl.textContent = formattedDuration;
        } else {
            console.warn("Invalid duration detected in handleLoadedMetadata:", currentAudio ? currentAudio.duration : 'No currentAudio');
            durationEl.textContent = "0:00";
        }
    }

    function updateProgress() {
        if (currentAudio && currentAudio.duration > 0 && isFinite(currentAudio.duration)) {
            progressBar.value = currentAudio.currentTime;
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
            const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressBar.style.setProperty('--progress', `${percent}%`);

            if (durationEl.textContent === "0:00") {
                durationEl.textContent = formatTime(currentAudio.duration);
                progressBar.max = currentAudio.duration;
                console.log("Duration updated via updateProgress");
            }
        }
    }

    function handleSongEnd() {
        if (isRepeat) {
            playSong(currentIndex);
        } else if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playSong(randomIndex);
        } else {
            let nextIndex = (currentIndex + 1) % songs.length;
            playSong(nextIndex);
        }
    }

    songLists.forEach((songElement, index) => {
        const playIcon = songElement.querySelector(".play-icon i");

        if (playIcon) {
            playIcon.addEventListener("click", (e) => {
                e.stopPropagation();

                if (currentIndex === index && currentAudio) {
                    if (!currentAudio.paused) {
                        currentAudio.pause();
                        updatePlayPauseUI(false);
                    } else {
                        currentAudio.play().then(() => {
                            updatePlayPauseUI(true);
                        }).catch(error => console.error("Error resuming playback:", error));
                    }
                } else {
                    playSong(index);
                }
            });
        } else {
            console.warn(`Play icon not found for song element at index ${index}, cannot attach listener.`);
        }
    });

    greenBtn.addEventListener("click", () => {
        if (currentAudio) {
            if (!currentAudio.paused) {
                currentAudio.pause();
                updatePlayPauseUI(false);
            } else {
                currentAudio.play().then(() => {
                    updatePlayPauseUI(true);
                }).catch(error => console.error("Error resuming playback from green button:", error));
            }
        } else {
            if (songs.length > 0) {
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
