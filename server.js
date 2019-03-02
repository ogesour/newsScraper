const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const axios = require("axios");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const path = require("path");
const db = require("./app/models");

const PORT = process.env.port || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("app/public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//connect to Mongo using mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/webscrape";

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log("Connected to database");
  })
  .catch(err => {
    console.log(err);
  });



app.get("/scrape", (req, res) => {
  axios.get("https://www.pe.com/").then(response => {
    var $ = cheerio.load(response.data);

    //this is the node that contains all the information to scrape
    $("span.dfm-title").each(function(i, element) {
      const results = {};

      results.title = $(this).text();
      results.link = $(this)
        .find("a")
        .attr("href");
      results.imageSrc = $(this)
        .find("a")
        .find("img")
        .attr("src");

      db.Article.create(results)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
      console.log(results);
    });
  });
  res.send("Scrape Complete");
});

app.get("/articles", (req, res) => {
  db.Article.find({})
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    });
});

app.get("/articles:id", (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));