document.addEventListener("DOMContentLoaded", () => {
    for (item of JSON.parse(localStorage.getItem("memorygame")) || []) {
        currentbest = item.bestscore;
        currentbestlevel = item.bestlevel;
    }
    document.addEventListener("input", (e) => {
        if (e.target.className === "slider")
            document.querySelector("p.difficultylevel").innerText = e.target.value;
    });
    document.addEventListener("click", (e) => {
        if (e.target.className === "shownitem" && !e.target.getAttribute("id")) {
            if (disablemoreclicks)
                return;
            UpdateCurrentScore();
            clickcount++;
            e.target.setAttribute("id", "gameitemshown");
            if (clickcount === 2) {
                clickcount = 0;
                CompareSelected();
            }
        }
        if (e.target.tagName === "INPUT" && e.target.className === "startbutton") {
            currentlevel = document.querySelector("p.difficultylevel").innerText;
            generateGameObjects(currentlevel);
            document.querySelector(".currentGameStatistics").setAttribute("id", "currentGameStatisticsShown");
            document.querySelector(".currentdifficulty").innerHTML = document.querySelector(".currentdifficulty").innerHTML.substring(0, 26) + currentlevel;
            document.querySelector(".currentscore").innerHTML = "Current<br />" + currentscore;
            closeStartMenu();
        }
        if (e.target.className === "mainMenu") {
            for (item of document.querySelectorAll(".gameitemwrapper"))
                item.remove();
            document.querySelector("#currentGameWonShown").setAttribute("id", "currentGameWonHidden");
            document.querySelector(".currentGameStatistics").setAttribute("id", "currentGameStatisticsHidden");
            generateMainMenu();
            resetcurrentScoreLevel();
        }
    });
    for (item of document.querySelectorAll(".gameitemwrapper"))
        item.remove();
    //generateGameObjects(8);    
    //document.querySelector("#currentGameWonHidden").setAttribute("id", "currentGameWonShown");
    document.querySelector(".currentGameStatistics").setAttribute("id", "currentGameStatisticsHidden");
    generateMainMenu();
});
function generateGameObjects(itemsAmount) {
    for (item of document.querySelectorAll(".gameitemwrapper"))
        item.remove();
    grabTenorDatabase(itemsAmount);
    let cardArray = [];
    const loadingLabel = document.createElement("span");
    loadingLabel.innerText = "Loading images from API...";
    loadingLabel.setAttribute("id", "deleteme");
    document.querySelector(".gamepanel").appendChild(loadingLabel);
    const newFun = setTimeout(() => {
        let i = 0;
        while (tenorimages.length != 0) {
            const url = tenorimages.pop();
            cardArray.push(generateCard(i, url, "a"));
            cardArray.push(generateCard(i, url, "b"));
            i++;
        }
        shuffle(cardArray);
        loadingLabel.remove();
        populateGameObjects(cardArray);
        tenorimages = [];
    }, 1000);
}
var tenorimages = [];
let currentscore = 0;
let currentbest = 0;
let currentlevel = 0;
let currentbestlevel = 0;
let clickcount = 0;
let disablemoreclicks = 0;
function resetcurrentScoreLevel() {
    currentscore = 0;
    currentlevel = 0;
}
function UpdateCurrentScore() {
    currentscore++;
    document.querySelector(".currentscore").innerHTML = "Current<br />" + currentscore;
}
function UpdateBestScore() {
    if (currentbest != 0 && currentbest < currentscore && currentbestlevel != 0 && currentlevel < currentbestlevel)
        return;
    if (currentbest === 0 || currentbest > currentscore)
        currentbest = currentscore;
    if (currentbestlevel === 0 || currentlevel > currentbestlevel)
        currentbestlevel = currentlevel;
    document.querySelector(".bestscore").innerHTML = "Best<br />" + currentbest;

    //Local Storage
    const saved = [];
    saved.push({ bestlevel: currentbestlevel, bestscore: currentbest });
    localStorage.setItem("memorygame", JSON.stringify(saved));
}
function closeStartMenu() {
    document.getElementsByClassName("gameIntro")[0].remove();
    document.getElementsByClassName("gameStatistics")[0].remove();
}
function CompareSelected() {
    let selectedCards = document.querySelectorAll("#gameitemshown");
    let selecteditems = new Set();
    let currentsize = selecteditems.size;
    for (item of selectedCards)
        selecteditems.add(item.getAttribute("data-label").substring(4).substring(0, item.getAttribute("data-label").length - 5));
    if (selecteditems.size === 1) {
        for (item of document.querySelectorAll("#gameitemshown"))
            item.setAttribute("id", "gameitemcompleted");
        CheckGameCompletion();
        selecteditems.clear();
        return;
    }
    for (item of document.querySelectorAll("#gameitemshown")) {
        item.setAttribute("id", "pendingreset");
        disablemoreclicks = 1;
        const newFunct = setTimeout((item) => { item.removeAttribute("id"); disablemoreclicks = 0; }, 1000, item);
    }
    selecteditems.clear();
}
function CheckGameCompletion() {
    if (document.querySelectorAll("[id='pendingreset'").length != 0 || document.querySelectorAll("#gameitemshown").length != 0)
        return;
    for (item of document.getElementsByClassName("shownitem"))
        if (!item.getAttribute("id"))
            return;
    document.querySelector("#currentGameWonHidden").setAttribute("id", "currentGameWonShown");
    UpdateBestScore();
    regenWinElement();
}

function regenWinElement() {
    document.querySelector(".currentGameWon").innerHTML = "<h1 class=\"currentGameWonMsg\">YOU WON!</h1><br />" +
        "DIFFICULTY: " + currentlevel +
        "<br />BEST: " + currentbest + "<br />" + "Your Score: " + currentscore + "<br />";
    const newButton = document.createElement("input");
    newButton.className = "mainMenu";
    newButton.setAttribute("type", "button");
    newButton.setAttribute("id", "mainMenu");
    newButton.setAttribute("value", "MAIN MENU");
    document.querySelector(".currentGameWon").appendChild(newButton);
}
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
    gameIntro2.setAttribute("value", Math.max(currentlevel === 0 ? 8 : currentlevel, 4));
    const gameIntro3 = document.createElement("p");
    gameIntro3.className = "difficultylevel";
    gameIntro3.innerText = Math.max(currentlevel === 0 ? 8 : currentlevel, 4);
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

    const gameOutro1 = document.createAttribute("span");
    gameOutro1.className = "highscore";
    gameOutro1.innerText = currentbest;
    const gameOutro3 = document.createElement("div");
    gameOutro3.innerHTML = gameOutro3.innerHTML + "<br />BEST SCORE<br />" + currentbest + "<br />BEST LEVEL<br />" + currentbestlevel;
    gameOutro3.className = "gameStatistics";
    document.querySelector("html").appendChild(gameOutro3);
}
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
function populateGameObjects(cardArray) {
    for (item of cardArray)
        document.querySelector(".gamepanel").appendChild(item);
}
function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] =
            [array[randomIndex], array[currentIndex]];
    }
}
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
function tenorCallback_search(responsetext) {
    const ResultsTest = JSON.parse(responsetext)["results"];
    for (item of ResultsTest)
        tenorimages.push(item["media_formats"]["gif"]["url"]);
    return;
}
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
    httpGetAsync(search_url, tenorCallback_search);
    return;
}
