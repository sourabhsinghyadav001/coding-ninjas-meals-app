const navbar = document.getElementById("navbar");
const results = document.getElementById("results");
const favorites = document.getElementById("favorites");
const searchBox = document.getElementById("search");
const searchBoxContainer = document.getElementById("search-container");
const navbarText = document.getElementById("navbar-text");
const initialResultsTemplate = document.getElementById(
  "initial-results-template"
);
const loadingScreenTemplate = document.getElementById("loading-template");
const resultListTemplate = document.getElementById("result-list-template");
const resultItemTemplate = document.getElementById("result-item-template");
const noResultsTemplate = document.getElementById("no-results-template");
const errorTemplate = document.getElementById("error-template");
const mdpTemplate = document.getElementById("mdp-template");
const favoriteIcon = document.getElementById("navbar-favorite");
let searchKeyword = "";

//safely getting a template by cloning
function getTemplate(JSX) {
  JSX = JSX.cloneNode(true);
  JSX.classList.remove("d-none");
  return JSX;
}
//custom render function
function render(containerId, JSX) {
  JSX.classList.remove("d-none");

  switch (containerId) {
    case "navbar":
      navbar.innerHTML = "";
      navbar.appendChild(JSX);
      break;
    case "results":
      favorites.innerHTML = "";
      results.innerHTML = "";
      searchBoxContainer.classList.remove("d-none");
      results.appendChild(JSX);
      break;
    case "favorites":
      favorites.innerHTML = "";
      results.innerHTML = "";
      searchBoxContainer.classList.add("d-none");
      searchKeyword = "";
      searchBox.value = "";
      favorites.appendChild(JSX);
      break;
    default:
      document.body.innerHTML = "Invalid Render!";
      break;
  }
}
//function for making list of elements
function makeList(parent, array) {
  if (array?.length > 0)
    array?.forEach((element) => parent?.appendChild(element));
  else parent?.appendChild(getTemplate(noResultsTemplate));
  return parent;
}
function gotoDetailsPage(meal) {
  const page = getTemplate(mdpTemplate);
  page
    .getElementsByClassName("mdp-img")[0]
    .setAttribute("src", meal.strMealThumb);
  page.getElementsByClassName("mdp-img-caption")[0].innerHTML = meal.strMeal;
  page.getElementsByClassName("mdp-details")[0].innerHTML =
    meal.strInstructions;
  render("results", page);
}
function toggleFavorite(meal, card, event) {
  event.stopPropagation();
  //creating special syntax for favorites so that keys don't clash with other keys.
  if (localStorage.getItem(`favorite_1337_${meal.idMeal}`) === null) {
    localStorage.setItem(`favorite_1337_${meal.idMeal}`, JSON.stringify(meal));
    card
      .getElementsByClassName("result-item-favorite")[0]
      .classList.add("already");
  } else {
    localStorage.removeItem(`favorite_1337_${meal.idMeal}`);
    card
      .getElementsByClassName("result-item-favorite")[0]
      .classList.remove("already");
  }
}
const makeListItem = (meal) => {
  const item = getTemplate(resultItemTemplate);
  item.onclick = () => gotoDetailsPage(meal);
  item
    .getElementsByClassName("result-item-img")[0]
    .setAttribute("src", meal.strMealThumb);
  item.getElementsByClassName("result-item-title")[0].innerHTML = meal.strMeal;
  item.getElementsByClassName("result-item-details")[0].innerHTML =
    meal.strInstructions;
  if (localStorage.getItem(`favorite_1337_${meal.idMeal}`) !== null)
    item
      .getElementsByClassName("result-item-favorite")[0]
      .classList.add("already");
  item.getElementsByClassName("result-item-favorite")[0].onclick = (event) =>
    toggleFavorite(meal, item, event);

  return item;
};
async function searchOnChangeHandler(event) {
  searchKeyword = event.target.value;
  render(
    "results",
    searchKeyword.trim() === ""
      ? getTemplate(initialResultsTemplate)
      : getTemplate(loadingScreenTemplate)
  );
  try {
    const thisSearch = searchKeyword;

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchKeyword}`
    );
    if (!response.ok) {
      throw new Error("An error occured");
    }
    const results = await response.json();

    //To stop previous result replace the most recent result due to asynchronous nature,
    //I have used the check thisSearch === searchKeyword
    if (thisSearch === searchKeyword)
      render(
        "results",
        makeList(
          getTemplate(resultListTemplate),
          results.meals?.map(makeListItem)
        )
      );
  } catch (err) {
    render("results", getTemplate(errorTemplate));
    return;
  }
}
function gotoFavorites() {
  const list = [];
  for (let key in localStorage) {
    if (key.startsWith("favorite_1337_"))
      list.push(makeListItem(JSON.parse(localStorage[key])));
  }
  render("favorites", makeList(getTemplate(resultListTemplate), list));
}
favoriteIcon.onclick = gotoFavorites;
searchBox.addEventListener("input", searchOnChangeHandler);
navbarText.onclick = function navbarTextClickHandler() {
  render("results", getTemplate(initialResultsTemplate));
};
