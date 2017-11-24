var express = require('express');
var fs = require('fs');
var request = require('request');
var axios = require('axios');
var cheerio = require('cheerio');
var app = express();

var options = {
  url: 'http://contracts.onecle.com/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
  }
};
var category = 'Miscellaneous';
// var subCategory = 'Administration Agreement';
var subCategory = 'liquidity agreement';
let fileName = '';

axios.get(options.url)
  .then((response)=> {
    var $ = cheerio.load(response.data);

    let tagForSubCategory = $('a').filter(function () {
      return $(this).text().trim().toLowerCase()  === subCategory.toLowerCase();
    });
    let linkForSubCategory = tagForSubCategory[0].attribs.href;

    return axios.get(linkForSubCategory)
  })
  .then((response)=> {
    $ = cheerio.load(response.data);
    let listOfLinksToArticles = $('.row .index ul').last();
    let linkArcticle = 'http://contracts.onecle.com' + listOfLinksToArticles.children()[0].children[0].attribs.href;
    return axios.get(linkArcticle)
  })
  .then((response)=> {
    $ = cheerio.load(response.data);

    fileName = $('.col-sm-12 p')[1].children[0].data;
//
    let linkToFinalHtml = $('a').filter(function () {
      return $(this).text().trim() === 'printer-friendly';
    });
    linkToFinalHtml = linkToFinalHtml[0].attribs.href;
    return axios.get(linkToFinalHtml)
  })
  .then((response)=> {

    fs.existsSync("./" + category) || fs.mkdirSync("./" + category);
    fs.existsSync("./" + category + '/' + subCategory) || fs.mkdirSync("./" + category + '/' + subCategory);
    fs.writeFile("./" + category + '/' + subCategory + '/' + fileName.substring(7) + '.html', response.data,()=>{});
    // res.send(response.data);
  })


app.get('/', function (req, res) {

  axios.get(options.url)
    .then((response)=> {
      var $ = cheerio.load(response.data);

      let tagForSubCategory = $('a').filter(function () {
        return $(this).text().trim() === subCategory;
      });
      let linkForSubCategory = tagForSubCategory[0].attribs.href;
      return axios.get(linkForSubCategory)
    })
    .then((response)=> {
      $ = cheerio.load(response.data);
      let listOfLinksToArticles = $('.row .index ul').last();
      let linkArcticle = 'http://contracts.onecle.com' + listOfLinksToArticles.children()[0].children[0].attribs.href;
      return axios.get(linkArcticle)
    })
    .then((response)=> {
      $ = cheerio.load(response.data);

      fileName = $('.col-sm-12 p')[1].children[0].data;
//
      let linkToFinalHtml = $('a').filter(function () {
        return $(this).text().trim() === 'printer-friendly';
      });
      linkToFinalHtml = linkToFinalHtml[0].attribs.href;
      return axios.get(linkToFinalHtml)
    })
    .then((response)=> {

      fs.existsSync("./" + category) || fs.mkdirSync("./" + category);
      fs.existsSync("./" + category + '/' + subCategory) || fs.mkdirSync("./" + category + '/' + subCategory);
      fs.writeFile("./" + category + '/' + subCategory + '/' + fileName.substring(7) + '.html', response.data,()=>{});
      res.send(response.data);
    })

});

app.listen('4000');

exports = module.exports = app;