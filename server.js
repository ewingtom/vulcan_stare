const express = require('express');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const app = express();

const API_KEY = 'YOUR_API_KEY_HERE';
const CUSTOM_SEARCH_ENGINE_ID = 'YOUR_CSE_ID_HERE';

app.get('/getArticleText', (req, res) => {
  const companyName = req.query.companyName;
  const query = '"' + companyName + '"' + ' AND (site:govconwire.com/ OR site:siliconangle.com/ OR site:techcrunch.com OR site:forbes.com/sites/ OR site:finsmes.com/ OR site:businesswire.com/ OR site:techfundingnews.com OR site:marketscreener.com/ OR site:msspalert.com/ OR site:theverge.com OR site:reseller.co.nz/ OR site:bizjournals.com/ OR site:prnewswire.com/ OR site:linkedin.com/company/defense-news/ OR site:defensenews.com)';
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&sort=date&tbm=nws`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      let articleText = "";
      if (data.items && data.items.length > 0) {
        for (let i = 0; i < Math.min(5, data.items.length); i++) {
          const article = data.items[i];
          fetch(article.link)
            .then(response => response.text())
            .then(articleContent => {
              const parser = new xml2js.Parser();
              parser.parseString(articleContent, (err, result) => {
                const articleElement = result.html.body[0].div[2].div[0].div[0].div[0].div[0].div[0].div[0];
                const paragraphs = articleElement.p;
                for (let j = 0; j < paragraphs.length; j++) {
                  articleText += paragraphs[j]._ + "\n";
                }
              });
            })
            .catch(error => console.error(error));
        }
        setTimeout(() => {
          res.send(articleText);
        }, 5000);
      } else {
        res.send(null);
      }
