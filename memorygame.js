document.addEventListener("DOMContentLoaded", () => {
    for (item of JSON.parse(localStorage.getItem("memorygame")) || []) {
        bestScore = item.bestscore;
        bestLevel = item.bestlevel;
    }
    document.addEventListener("input", (e) => {
        if (e.target.className === "slider")
            document.querySelector("p.difficultylevel").innerText = e.target.value;
    });
    document.addEventListener("click", (e) => {
        if (e.target.className === "shownitem" && !e.target.getAttribute("id")) {
            if (disableMoreClicks)
                return;
            updateCurrentScore();
            clickCount++;
            e.target.setAttribute("id", "gameitemshown");
            if (clickCount === 2) {
                clickCount = 0;
                compareSelected();
            }
        }
        if (e.target.tagName === "INPUT" && e.target.className === "startbutton") {
            level = document.querySelector("p.difficultylevel").innerText;
            generateGameObjects(level);
            document.querySelector(".currentGameStatistics").setAttribute("id", "currentGameStatisticsShown");
            document.querySelector(".currentdifficulty").innerHTML = document.querySelector(".currentdifficulty").innerHTML.substring(0, 26) + level;
            document.querySelector(".currentscore").innerHTML = "Current<br />0";
            document.querySelector(".bestscore").innerHTML = "Best<br />" + bestLevel;
            closeStartMenu();
        }
        if (e.target.className === "mainMenu") {
            for (item of document.querySelectorAll(".gameitemwrapper"))
                item.remove();
            document.querySelector("#currentGameWonShown").setAttribute("id", "currentGameWonHidden");
            document.querySelector(".currentGameStatistics").setAttribute("id", "currentGameStatisticsHidden");
            generateMainMenu();
            resetscoreLevel();
        }
    });
    for (item of document.querySelectorAll(".gameitemwrapper"))
        item.remove();
    //generateGameObjects(8);    
    //document.querySelector("#currentGameWonHidden").setAttribute("id", "currentGameWonShown");
    document.querySelector(".currentGameStatistics").setAttribute("id", "currentGameStatisticsHidden");
    generateMainMenu();
});
/**
* Clears any game objects currently showing and appends new cards to the Game Panel.
* Queries the tenor v2 API, shuffles the results and creates the game objects for the user.
* @param {number} itemsAmount - Generate game objects based on number
* @return {void}
*/
function generateGameObjects(itemsAmount) {
    for (item of document.querySelectorAll(".gameitemwrapper"))
        item.remove();
    grabTenorDatabase(itemsAmount);
    let cardArray = [];
    const loadingLabel = document.createElement("span");
    loadingLabel.innerText = "Loading images from API...";
    loadingLabel.setAttribute("id", "deleteme");
    document.querySelector(".gamepanel").appendChild(loadingLabel);
    setTimeout(() => {
        let i = 0;
        while (tenorImages.length != 0) {
            const url = tenorImages.pop();
            cardArray.push(generateCard(i, url, "a"));
            cardArray.push(generateCard(i, url, "b"));
            i++;
        }
        shuffle(cardArray);
        loadingLabel.remove();
        populateGameObjects(cardArray);
        tenorImages = [];
    }, 1000);
}
let tenorImages = [];

let score = 0;
let level = 0;

let bestScore = 0;
let bestLevel = 0;

let clickCount = 0;
let disableMoreClicks = 0;
/**
* Resets global variables for current score and current level
* @return {void}
*/
function resetscoreLevel() {
    score = 0;
    level = 0;
}
/**
* Increments score by 1 and updates the DOM to show current score
* @return {void}
*/
function updateCurrentScore() {
    score++;
    document.querySelector(".currentscore").innerHTML = "Current<br />" + score;
}
/**
* Updates the best score and level by comparing both, updates DOM, and stores into Local Storage
* @return {void}
*/
function updateBestScore() {
    if (bestScore != 0 && bestScore < score && bestLevel != 0 && level < bestLevel)
        return;
    if (bestScore === 0 || bestScore > score)
        bestScore = score;
    if (bestLevel === 0 || level > bestLevel)
        bestLevel = level;
    document.querySelector(".bestscore").innerHTML = "Best<br />" + bestScore;
    //Local Storage
    const saved = [];
    saved.push({ bestlevel: bestLevel, bestscore: bestScore });
    localStorage.setItem("memorygame", JSON.stringify(saved));
}
/**
* Closes the start menu by deleting Start Menu elements from the DOM
* @return {void}
*/
function closeStartMenu() {
    document.getElementsByClassName("gameIntro")[0].remove();
    document.getElementsByClassName("gameStatistics")[0].remove();
}
/**
* Searches the DOM for selected cards and determines if they are a match.
* If they are not a match, they will automatically flip back after 1 second.
* @return {void}
*/
function compareSelected() {
    let selectedCards = document.querySelectorAll("#gameitemshown");
    let selectedItems = new Set();
    for (item of selectedCards)
        selectedItems.add(item.getAttribute("data-label").substring(4).substring(0, item.getAttribute("data-label").length - 5));
    if (selectedItems.size === 1) {
        for (item of document.querySelectorAll("#gameitemshown"))
            item.setAttribute("id", "gameitemcompleted");
        checkGameCompletion();
        selectedItems.clear();
        return;
    }
    for (item of document.querySelectorAll("#gameitemshown")) {
        item.setAttribute("id", "pendingreset");
        disableMoreClicks = 1;
        setTimeout((item) => { item.removeAttribute("id"); disableMoreClicks = 0; }, 1000, item);
    }
    selectedItems.clear();
}
/**
* Searches the DOM for unsolved cards
* If there are no remaining cards, the game will be completed.
* @return {void}
*/
function checkGameCompletion() {
    if (document.querySelectorAll("[id='pendingreset'").length != 0 || document.querySelectorAll("#gameitemshown").length != 0)
        return;
    for (item of document.getElementsByClassName("shownitem"))
        if (!item.getAttribute("id"))
            return;
    document.querySelector("#currentGameWonHidden").setAttribute("id", "currentGameWonShown");
    updateBestScore();
    regenWinElement();
}
/**
* Generate the elements to show the user they have won the game and update all game statistics.
* @return {void}
*/
function regenWinElement() {
    document.querySelector(".currentGameWon").innerHTML = "<h1 class=\"currentGameWonMsg\">YOU WON!</h1><br />" +
        "DIFFICULTY: " + level +
        "<br />BEST: " + bestScore + "<br />" + "Your Score: " + score + "<br />";
    const newButton = document.createElement("input");
    newButton.className = "mainMenu";
    newButton.setAttribute("type", "button");
    newButton.setAttribute("id", "mainMenu");
    newButton.setAttribute("value", "MAIN MENU");
    document.querySelector(".currentGameWon").appendChild(newButton);
}
/**
* Generate elements required to display the difficulty level form and game statistics.
* @return {void}
*/
function generateMainMenu() {
    const gameIntro1 = document.createElement("input");
    gameIntro1.setAttribute("type", "button");
    gameIntro1.className = "startbutton";
    gameIntro1.setAttribute("id", "Start");
    gameIntro1.setAttribute("value", "START");
    const gameIntro2 = document.createElement("input");
    gameIntro2.setAttribute("type", "range");
    gameIntro2.className = "slider";
    gameIntro2.setAttribute("id", "Difficulty");
    gameIntro2.setAttribute("min", "4");
    gameIntro2.setAttribute("max", "150");
    gameIntro2.setAttribute("value", Math.max(level === 0 ? 8 : level, 4));
    const gameIntro3 = document.createElement("p");
    gameIntro3.className = "difficultylevel";
    gameIntro3.innerText = Math.max(level === 0 ? 8 : level, 4);
    const gameIntro4 = document.createElement("span");
    gameIntro4.className = "labeldifficultyrequest";
    gameIntro4.innerText = "DIFFICULTY";
    const gameIntro5 = document.createElement("div");
    gameIntro5.className = "gameIntro";
    gameIntro5.appendChild(gameIntro4);
    gameIntro5.appendChild(gameIntro3);
    gameIntro5.appendChild(gameIntro2);
    gameIntro5.appendChild(gameIntro1);
    document.querySelector("body").appendChild(gameIntro5);

    const gameOutro = document.createElement("div");
    gameOutro.innerHTML = "<br />BEST SCORE<br />" + bestScore + "<br />BEST LEVEL<br />" + bestLevel;
    gameOutro.className = "gameStatistics";
    document.querySelector("html").appendChild(gameOutro);
}
/**
* Generate a card based on an index, assign an image to show for the card, and apply a suffix as a unique identifier for matches.
* Function is generally called twice with unique suffixes.
* @param {number} count - An index to uniquely identify the card
* @param {URL} url - A URL of an image to display when the card is chosen
* @param {string} suffix - An additional string to add at the end of each item to identify the card
* @return {Element}
*/
function generateCard(count, url, suffix) {
    const templateA = document.createElement("div");
    templateA.className = "gameitemwrapper";
    templateA.setAttribute("data-label", "item" + count + suffix);
    const templateB = document.createElement("div");
    templateB.className = "gameiteminner";
    const templateC = document.createElement("div");
    templateC.className = "shownitem";
    templateC.setAttribute("data-label", "item" + count + suffix);
    const templateD = document.createElement("img");
    templateD.className = "hiddenitem";
    templateD.setAttribute("data-label", "item" + count + suffix);
    templateD.setAttribute("src", url);
    templateC.appendChild(templateD);
    templateB.appendChild(templateC);
    templateA.appendChild(templateB);
    return templateA;
}
/**
* Append an array of HTML objects to the Game Panel.
* @param {array} cardArray - An Array containing the HTML objects that have been generated
* @return {void}
*/
function populateGameObjects(cardArray) {
    for (item of cardArray)
        document.querySelector(".gamepanel").appendChild(item);
}
/**
* Shuffle an Array.
* @param {array} array - An Array containing items to be shuffled
* @return {void}
*/
function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] =
            [array[randomIndex], array[currentIndex]];
    }
}
/**
* Async function to call a URL with a callback function once completed.
* Handles the HTTP request.
* @param {URL} theUrl - A HTTP link to retrieve data
* @param {function} callback - A function to call when the Async task is completed
* @return {void}
*/
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
    return;
}
/**
* A Function used as a callback to return the contents of httpGetAsync.
* Results are pushed to a global array.
* @param {string} responsetext - A JSON string returned from the server
* @return {void}
*/
function tenorCallback_Search(responsetext) {
    const ResultsTest = JSON.parse(responsetext)["results"];
    for (item of ResultsTest)
        tenorImages.push(item["media_formats"]["gif"]["url"]);
    return;
}
/**
* Accesses the Tenor V2 API and query for unique images to be used for game objects.
* Results are stored in a global object.
* @param {number} amt - The amount of unique GIF's to retrieve
* @return {void}
*/
function grabTenorDatabase(amt) {
    let apikey = "AIzaSyB1WKQJpvPVYj3czgkrYKlaezhf009xlik";
    let clientkey = "MemoryGameDevelopment";
    let lmt = amt;
    let search_terms = ["happy", "programming", "laughing", "crying", "applause", "sad", "excited", "celebrities", "tv", "birthday", "christmas", "new year", "cats", "dogs", "penguins", "soccer", "basketball", "football", "facepalm", "eyeroll", "shrug"];
    let search_term = search_terms[Math.floor(Math.random() * search_terms.length)];
    let search_url = "https://tenor.googleapis.com/v2/search?q=" + search_term +
        "&key=" + apikey +
        "&client_key=" + clientkey +
        "&contentfilter=high" +
        "&limit=" + lmt +
        "&random=true" +
        "&media_filter=gif";
    httpGetAsync(search_url, tenorCallback_Search);
    return;
}
