console.log("We are writing javascript");

// Create an Audio object - we'll reuse this
let currentAudio = new Audio();
let currentlyPlayingIcon = null; // Track the icon of the currently playing song
let currentIndex = -1; // Track the index of the currently playing song based on songLists
let songLists = []; // Will be populated after the DOM is loaded
let isShuffle = false;
let isRepeat = false;

async function main() {
    songLists = document.querySelectorAll(".songlist"); // Populate songLists here
    console.log(`Found ${songLists.length} song elements.`);

    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const playBtn = document.querySelector(".play"); // Main play/pause button
    const prevBtn = document.querySelector(".previous");
    const nextBtn = document.querySelector(".next");
    const shuffleBtn = document.querySelector(".shuffle");
    const repeatBtn = document.querySelector(".repeat");
    // Maybe other elements like green play button if needed
    // const greenBtn = document.querySelector(".box-1");
    // const greenIcon = document.querySelector(".img-m-1");


    function formatTime(time) {
        if (time == null || isNaN(time) || !isFinite(time) || time <= 0) {
            return "0:00";
        }
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Function to update UI elements (main button, song icon)
    function updatePlayPauseUI(isPlaying, targetIcon = currentlyPlayingIcon) {
         // Reset all icons first
         songLists.forEach(item => {
            const icon = item.querySelector(".play-icon i");
            if (icon) {
                icon.classList.remove("fa-pause");
                icon.classList.add("fa-play");
                // Also reset the track number visibility toggle if you implemented that
                const trackNo = item.querySelector(".track-no");
                if (trackNo) trackNo.style.display = 'inline';
                icon.style.display = 'none'; // Hide play icon by default in non-hover state
            }
             item.classList.remove("playing"); // Remove highlight from all
         });


        if (isPlaying) {
            playBtn.src = "right-section/pause.svg";
             if (targetIcon) {
                 targetIcon.classList.remove("fa-play");
                 targetIcon.classList.add("fa-pause");
                 targetIcon.style.display = 'inline'; // Ensure playing icon is visible
                 const parentNum = targetIcon.closest('.num');
                 if(parentNum) {
                     const trackNo = parentNum.querySelector('.track-no');
                     if (trackNo) trackNo.style.display = 'none'; // Hide track number
                 }
             }
             // Highlight the playing song
             if (currentIndex >= 0 && currentIndex < songLists.length) {
                 songLists[currentIndex].classList.add("playing");
             }
        } else {
            playBtn.src = "right-section/play.svg";
             // If a specific icon was targeted (meaning we paused THAT song), reset it
             if (targetIcon) {
                targetIcon.classList.remove("fa-pause");
                targetIcon.classList.add("fa-play");
                 // Optional: revert visibility based on hover state if needed,
                 // but for now, we keep it simple. The default reset handles non-playing icons.
             }
              // Remove highlight if paused
              if (currentIndex >= 0 && currentIndex < songLists.length) {
                songLists[currentIndex].classList.remove("playing");
            }
        }
    }


    function playSong(index) {
        if (index < 0 || index >= songLists.length) {
            console.error("Invalid song index:", index);
            // Stop playback if index is invalid
             if (!currentAudio.paused) {
                 currentAudio.pause();
             }
             // Reset UI completely
             updatePlayPauseUI(false, null); // Pass null as no specific icon is targeted
             currentIndex = -1;
             currentlyPlayingIcon = null;
             currentAudio.src = ""; // Clear source
             currentTimeEl.textContent = "0:00";
             durationEl.textContent = "0:00";
             progressBar.value = 0;
             progressBar.style.setProperty('--progress', '0%');
            return;
        }

        const songElement = songLists[index];
        const songSrc = songElement.getAttribute("data-src");
        const playIcon = songElement.querySelector(".play-icon i");

        if (!songSrc) {
            console.error("No data-src found for song index:", index);
            return;
        }

        // If clicking the same song that's already loaded and playing, pause it
        if (currentIndex === index && !currentAudio.paused) {
            currentAudio.pause();
            updatePlayPauseUI(false, playIcon); // Update UI to show paused state for this icon
            return; // Exit function, don't reload
        }

         // If clicking the same song that's paused, resume it
         if (currentIndex === index && currentAudio.paused) {
            currentAudio.play().then(() => {
                updatePlayPauseUI(true, playIcon); // Update UI to show playing state for this icon
            }).catch(error => console.error("Error resuming playback:", error));
            return; // Exit function
        }


        // --- New song selected ---
        // Stop previous audio and reset its icon if different song
        if (!currentAudio.paused) {
            currentAudio.pause();
            // Reset the icon of the *previously* playing song
            if (currentlyPlayingIcon) {
                 updatePlayPauseUI(false, currentlyPlayingIcon);
                 // Make sure the old one reverts to showing track number etc. if needed
                 const oldSongElement = songLists[currentIndex];
                 if (oldSongElement) {
                    const oldNum = oldSongElement.querySelector('.num');
                    const oldTrackNo = oldNum?.querySelector('.track-no');
                    const oldPlayIcon = oldNum?.querySelector('.play-icon i');
                    if(oldTrackNo) oldTrackNo.style.display = 'inline';
                    if(oldPlayIcon) oldPlayIcon.style.display = 'none'; // Hide icon unless hovered
                    oldSongElement.classList.remove('playing');
                 }

            }
        }


        // Load and play the new song
        currentIndex = index;
        currentlyPlayingIcon = playIcon; // Update the tracked icon
        currentAudio.src = songSrc;
        currentAudio.currentTime = 0; // Reset time

        // Reset progress bar immediately
        progressBar.value = 0;
        currentTimeEl.textContent = "0:00";
        durationEl.textContent = "0:00"; // Reset duration until loaded
        progressBar.style.setProperty('--progress', '0%');


        currentAudio.play().then(() => {
            console.log(`Playing: ${songSrc}`);
            updatePlayPauseUI(true, currentlyPlayingIcon); // Update UI for the new song
            // Ensure metadata is loaded to get duration
             if (currentAudio.readyState >= 1) { // HAVE_METADATA or more
                handleLoadedMetadata();
            }
        }).catch(error => {
            console.error("Error playing audio:", error);
            updatePlayPauseUI(false, currentlyPlayingIcon); // Reset UI on error
            currentAudio.src = ""; // Clear src on error
            currentIndex = -1;
            currentlyPlayingIcon = null;
        });
    }

    // Add listeners for hover effect on song list items
    songLists.forEach((item) => {
        const numDiv = item.querySelector('.num');
        const trackNo = numDiv?.querySelector('.track-no');
        const playIcon = numDiv?.querySelector('.play-icon i');

        if (trackNo && playIcon) {
            item.addEventListener('mouseenter', () => {
                // Show play icon only if it's not the currently playing song's pause icon
                if (!playIcon.classList.contains('fa-pause')) {
                    trackNo.style.display = 'none';
                    playIcon.style.display = 'inline';
                }
            });

            item.addEventListener('mouseleave', () => {
                 // Hide play/pause icon only if it's not the currently playing song's pause icon
                if (!playIcon.classList.contains('fa-pause')) {
                    trackNo.style.display = 'inline';
                    playIcon.style.display = 'none';
                }
                 // Ensure the pause icon remains visible if it IS the current song
                 else if (playIcon.classList.contains('fa-pause')) {
                     playIcon.style.display = 'inline'; // Keep pause icon visible
                     trackNo.style.display = 'none'; // Keep track number hidden
                 }
            });
        }
    });


    // Add click listeners to individual song play icons
    songLists.forEach((songElement, index) => {
        const playIconContainer = songElement.querySelector(".play-icon"); // Target container or icon itself

        if (playIconContainer) {
             playIconContainer.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent triggering other listeners if nested
                console.log(`Play icon clicked for index: ${index}`);
                playSong(index);
            });
        } else {
            console.warn(`Play icon container not found for song index ${index}`);
        }
    });

     // Main play button listener
     playBtn.addEventListener("click", () => {
         if (currentAudio.src) { // Check if a song is loaded
            if (currentAudio.paused) {
                // If paused, find the current song's icon and play
                 const currentSongElement = songLists[currentIndex];
                 const icon = currentSongElement?.querySelector(".play-icon i");
                 currentAudio.play().then(() => {
                     updatePlayPauseUI(true, icon);
                 }).catch(error => console.error("Error resuming via main play:", error));
            } else {
                // If playing, find the current song's icon and pause
                 const currentSongElement = songLists[currentIndex];
                 const icon = currentSongElement?.querySelector(".play-icon i");
                 currentAudio.pause();
                 updatePlayPauseUI(false, icon);
            }
        } else if (songLists.length > 0) {
            // If no song is loaded, play the first song
            playSong(0);
        }
    });


    // --- Event Listeners for Audio Element ---

    currentAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
    currentAudio.addEventListener("timeupdate", updateProgress);
    currentAudio.addEventListener("ended", handleSongEnd);
    // Add error handling
    currentAudio.addEventListener("error", (e) => {
        console.error("Audio Error:", currentAudio.error, e);
        updatePlayPauseUI(false, currentlyPlayingIcon); // Reset UI on error
        // Potentially try next song or display an error message
        currentTimeEl.textContent = "Error";
        durationEl.textContent = "0:00";
         progressBar.value = 0;
         progressBar.style.setProperty('--progress', '0%');
         // Clear src and index to prevent retry loops on the same bad file
         currentAudio.src = "";
         currentIndex = -1;
         currentlyPlayingIcon = null;
    });


     function handleLoadedMetadata() {
        console.log("Metadata loaded! Duration:", currentAudio.duration);
        if (currentAudio && currentAudio.duration > 0 && isFinite(currentAudio.duration)) {
            progressBar.max = currentAudio.duration;
            const formattedDuration = formatTime(currentAudio.duration);
            durationEl.textContent = formattedDuration;
        } else {
             console.warn("Invalid or zero duration detected in handleLoadedMetadata:", currentAudio ? currentAudio.duration : 'No currentAudio');
             // Attempt to get duration again shortly after, sometimes metadata loads slightly delayed
             setTimeout(() => {
                 if (currentAudio && currentAudio.duration > 0 && isFinite(currentAudio.duration)) {
                     progressBar.max = currentAudio.duration;
                     durationEl.textContent = formatTime(currentAudio.duration);
                 } else {
                    console.warn("Duration still invalid after delay.");
                    durationEl.textContent = "0:00"; // Fallback if still invalid
                    progressBar.max = 100; // Default max if duration fails
                 }
             }, 200); // Wait 200ms
        }
    }


    function updateProgress() {
         // Make sure duration is valid before calculating percentage
        if (currentAudio && currentAudio.duration > 0 && isFinite(currentAudio.duration)) {
            progressBar.value = currentAudio.currentTime;
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
            const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressBar.style.setProperty('--progress', `${percent}%`);

             // Update duration here as well, as loadedmetadata might fire too early sometimes
             if (durationEl.textContent === "0:00" || durationEl.textContent === "Error") {
                 durationEl.textContent = formatTime(currentAudio.duration);
                 progressBar.max = currentAudio.duration;
             }
        } else {
             // If duration is somehow invalid during playback, reset time display
             // currentTimeEl.textContent = "0:00"; // Avoid constant flickering if duration is temporarily NaN
             // console.log("updateProgress: Invalid duration ", currentAudio.duration);
        }
    }


    function handleSongEnd() {
        console.log("Song ended. Repeat:", isRepeat, "Shuffle:", isShuffle, "Current Index:", currentIndex);
         let nextIndex;

        if (isRepeat) {
            nextIndex = currentIndex; // Play the same song again
        } else if (isShuffle) {
             // Simple shuffle: pick a random index different from the current one
            if (songLists.length <= 1) {
                nextIndex = 0; // Only one song, just play it again
            } else {
                do {
                    nextIndex = Math.floor(Math.random() * songLists.length);
                } while (nextIndex === currentIndex);
            }
        } else {
             // Play the next song in order, loop back to start if at the end
            nextIndex = (currentIndex + 1); // Don't apply modulo yet
            if (nextIndex >= songLists.length) {
                 console.log("Reached end of playlist.");
                 // Stop playback, reset UI
                 updatePlayPauseUI(false, null);
                 currentIndex = -1;
                 currentlyPlayingIcon = null;
                 currentAudio.src = "";
                 currentTimeEl.textContent = "0:00";
                 durationEl.textContent = "0:00";
                 progressBar.value = 0;
                 progressBar.style.setProperty('--progress', '0%');
                 return; // Explicitly stop if not repeating/shuffling and at the end
            }
        }
         playSong(nextIndex);
    }


    // --- Progress Bar Interaction ---
    progressBar.addEventListener('input', () => {
        if (currentAudio.src && currentAudio.duration > 0 && isFinite(currentAudio.duration)) {
            currentAudio.currentTime = progressBar.value;
            // Update the visual progress immediately
             const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
             progressBar.style.setProperty('--progress', `${percent}%`);
        }
    });


    // --- Button Listeners (Shuffle, Repeat, Prev, Next) ---
    shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle("active", isShuffle);
        console.log("Shuffle:", isShuffle);
        // If shuffle is turned on, repeat should be turned off (typical behavior)
        if (isShuffle && isRepeat) {
            isRepeat = false;
            repeatBtn.classList.remove("active");
        }
    });

    repeatBtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle("active", isRepeat);
        console.log("Repeat:", isRepeat);
         // If repeat is turned on, shuffle should be turned off
         if (isRepeat && isShuffle) {
            isShuffle = false;
            shuffleBtn.classList.remove("active");
        }
    });

     prevBtn.addEventListener("click", () => {
         if (songLists.length === 0) return;

         let prevIndex;
         if (isShuffle) {
              // Simple shuffle: pick a random index different from the current one
            if (songLists.length <= 1) {
                prevIndex = 0;
            } else {
                do {
                    prevIndex = Math.floor(Math.random() * songLists.length);
                } while (prevIndex === currentIndex);
            }
         } else {
             prevIndex = currentIndex - 1;
             if (prevIndex < 0) {
                 prevIndex = songLists.length - 1; // Loop to end
             }
         }
         playSong(prevIndex);
     });

     nextBtn.addEventListener("click", () => {
         if (songLists.length === 0) return;

         let nextIndex;
         if (isShuffle) {
              // Simple shuffle: pick a random index different from the current one
            if (songLists.length <= 1) {
                nextIndex = 0;
            } else {
                do {
                    nextIndex = Math.floor(Math.random() * songLists.length);
                } while (nextIndex === currentIndex);
            }
         } else {
             nextIndex = currentIndex + 1;
             if (nextIndex >= songLists.length) {
                 nextIndex = 0; // Loop to start
             }
         }
         playSong(nextIndex);
     });

    // Initial UI setup
    updatePlayPauseUI(false);
    progressBar.value = 0;
    progressBar.style.setProperty('--progress', '0%');

}

// Ensure the DOM is fully loaded before running the main script
document.addEventListener('DOMContentLoaded', main);
