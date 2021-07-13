let searchInputValue = "";
let searchIndex = {};

document.addEventListener("DOMContentLoaded", () => {
    const searchable = document.getElementsByClassName("searchable");
    console.log(searchable);
    if (searchable.length > 0) {
        for (const element of searchable) {
            searchIndex[element.dataset.searchName] = element.dataset.searchLink;
        }
    }

    registerListener();
    console.log("page is fully loaded");
});

function findInIndex(searchValue) {
    const matchingStrings = [];

    Object.keys(searchIndex).forEach((string) => {
        if (string.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) > -1) {
            // console.log(string);
            matchingStrings.push({
                value: string,
                href: searchIndex[string]
            });
        }
    });

    return matchingStrings;
}

function registerListener() {
    const searchinput = document.getElementById("searchinput");
    const searchresult = document.getElementById("searchresult");

    searchinput.addEventListener("keyup", (event) => {
        const searchQuery = event.target.value;
        searchInputValue = searchQuery;
        searchresult.innerHTML = "";

        if (searchQuery.length == 0) {
            // create a new div element
            const newDiv = document.createTextNode("Start searching...");

            // add the text node to the newly created div
            searchresult.appendChild(newDiv);
            return;
        }

        if (searchQuery.length <= 2) {
            // create a new div element
            const newDiv = document.createTextNode("Please search for at least 2 characters...");

            // add the text node to the newly created div
            searchresult.appendChild(newDiv);
            return;
        }

        // list of search results
        const results = findInIndex(searchQuery);

        for (const key in results) {
            const anchor = document.createElement("a");
            anchor.href = results[key].href;
            anchor.text = results[key].value;

            // minimise and hide expanded on click
            anchor.addEventListener("click", (event) => {
                searchinput.style.width = "100%";
                searchresult.style.display = "none";
            });

            // add the text node to the newly created div
            searchresult.appendChild(anchor);
        }
    });
    searchinput.addEventListener("focus", (event) => {
        event.target.style.width = "400px";
        searchresult.style.display = "block";
    });
    searchinput.addEventListener("blur", (event) => {
        if (searchInputValue == "") {
            event.target.style.width = "100%";
            searchresult.style.display = "none";
        }
    });
}

function buildPopup(results) {}
