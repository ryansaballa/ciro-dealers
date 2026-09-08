const axios = require("axios");
const cheerio = require ("cheerio");
const fs = require ("fs");

console.log("Start Scraping");

async function scrapePage(page) {
  const url =
    `https://www.ciro.ca/office-investor/dealers-we-regulate?page=${page}`;

  const response = await axios.get(url);

  console.log(`Downloaded page ${page}`);

  return response.data;
}
