console.log("We are writing javascript");

async function getSongs(){
    let a = await fetch("http://127.0.0.1:3000/docs/spotify-clone/songs/")
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href)
        }
    }
    return songs
}

async function main(){

    //get the list of all songs
    let songs = await getSongs();
    console.log(songs);

    //play the first song
    let audio = new Audio(songs[0]);
    document.querySelector(".play").addEventListener("click", () => {
        audio.play();
    });
}

main();