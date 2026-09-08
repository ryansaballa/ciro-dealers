const axios = require("axios");
const cheerio = require ("cheerio");
const fs = require ("fs");

console.log("Start Scraping");

async function scrapePage(page) {
  const url =
    `https://www.ciro.ca/office-investor/dealers-we-regulate?page=${page}`;

  const response = await axios.get(url);

  const $ = cheerio.load(response.data);

  console.log($("article.node--type-regulated-dealer").length);
}

scrapePage(0);
