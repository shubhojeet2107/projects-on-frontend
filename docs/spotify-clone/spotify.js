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
                currentAudio.play().then(() => {
                    updatePlayPauseUI(true);
                    // Add playing class to current song item
                    const currentSongElement = (currentIndex >= 0 && currentIndex < songLists.length) ? songLists[currentIndex] : null;
                    if (currentSongElement) currentSongElement.classList.add("playing");
                }).catch(error => console.error("Error resuming playback:", error));
            } else {
                currentAudio.pause();
                updatePlayPauseUI(false); // Update UI first
                // Remove playing class from current song item slightly delayed
                const currentSongElement = (currentIndex >= 0 && currentIndex < songLists.length) ? songLists[currentIndex] : null;
                if (currentSongElement) {
                    setTimeout(() => {
                        // Check if it's still the current song and paused before removing
                        if (currentAudio && currentAudio.paused && currentIndex === Array.from(songLists).indexOf(currentSongElement)) {
                           currentSongElement.classList.remove("playing");
                        }
                    }, 10); // Small delay
                }
            }
        } else {
            // If no song is loaded, play the first song
            if (songs.length > 0) {
                playSong(0);
                // playSong handles adding the class
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
        // Stop and cleanup previous audio if any
        const oldIndex = currentIndex; // Store old index before changing
        const oldSongElement = (oldIndex >= 0 && oldIndex < songLists.length) ? songLists[oldIndex] : null;

        if (currentAudio) {
            currentAudio.pause();
            // Remove playing class from the old song element
            if (oldSongElement) {
                oldSongElement.classList.remove("playing");
            }
            // Reset the icon of the previously playing song IF it's different from the new one
            if (currentlyPlayingIcon && oldIndex !== index) {
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

        // Find the correct play icon and song element for the new song
        const newSongElement = (currentIndex >= 0 && currentIndex < songLists.length) ? songLists[currentIndex] : null;

        if (newSongElement) {
            const playIcon = newSongElement.querySelector(".play-icon i");
            if (playIcon) {
                currentlyPlayingIcon = playIcon; // Assign the new icon
            } else {
                console.warn(`Play icon not found for song index ${index}`);
                currentlyPlayingIcon = null; // Reset if not found
            }
        } else {
            console.warn(`Song list element index ${index} out of bounds`);
            currentlyPlayingIcon = null; // Reset if out of bounds
        }

        currentAudio.addEventListener("timeupdate", updateProgress);
        currentAudio.addEventListener("ended", handleSongEnd);

        currentAudio.play().then(() => {
            updatePlayPauseUI(true);
            // Add playing class to the new song element AFTER playback starts
            if (newSongElement) {
                newSongElement.classList.add("playing");
            }
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
            if (newSongElement) {
                newSongElement.classList.remove("playing");
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

        // Check if playIcon exists before adding listener
        if (playIcon) {
            playIcon.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent potential parent clicks

                if (currentIndex === index && currentAudio) {
                    // Clicked on the currently playing song's icon
                    if (!currentAudio.paused) {
                        // If playing, pause it
                        currentAudio.pause();
                        updatePlayPauseUI(false); // Update UI first
                        // Remove playing class slightly delayed
                        if (songElement) {
                             setTimeout(() => {
                                // Check if it's still the current song and paused before removing
                                if (currentAudio && currentAudio.paused && currentIndex === index) {
                                    songElement.classList.remove("playing");
                                 }
                            }, 10); // Small delay
                        }
                    } else {
                        // If paused, play it
                        currentAudio.play().then(() => {
                            updatePlayPauseUI(true);
                            // Add playing class
                            if (songElement) songElement.classList.add("playing");
                        }).catch(error => console.error("Error resuming playback:", error));
                    }
                } else {
                    // Clicked on a different song, play it
                    playSong(index);
                }
            });
        } else {
            console.warn(`Play icon not found for song element at index ${index}, cannot attach listener.`);
        }
    });

    greenBtn.addEventListener("click", () => {
        const currentSongElement = (currentIndex >= 0 && currentIndex < songLists.length) ? songLists[currentIndex] : null;
        if (currentAudio) {
            if (!currentAudio.paused) {
                // If playing, pause
                currentAudio.pause();
                updatePlayPauseUI(false); // Update UI first
                // Remove playing class slightly delayed
                if (currentSongElement) {
                     setTimeout(() => {
                        // Check if it's still the current song and paused before removing
                         if (currentAudio && currentAudio.paused && currentIndex === Array.from(songLists).indexOf(currentSongElement)) {
                           currentSongElement.classList.remove("playing");
                         }
                    }, 10); // Small delay
                }
            } else {
                // If paused, play
                currentAudio.play().then(() => {
                    updatePlayPauseUI(true);
                    // Add playing class
                    if (currentSongElement) currentSongElement.classList.add("playing");
                }).catch(error => console.error("Error resuming playback from green button:", error));
            }
        } else {
            // If no song is loaded, play the first song
            if (songs.length > 0) {
                playSong(0);
                // playSong handles adding the class
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
