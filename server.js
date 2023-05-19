const express = require('express');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const app = express();
const config = require('./config');

// Access the values
const API_KEY = config.API_KEY;
const CUSTOM_SEARCH_ENGINE_ID = config.CUSTOM_SEARCH_ENGINE_ID;


app.get('/getArticleText', async (req, res) => {
  try {
    const companyName = req.query.companyName;
    const query = `"${companyName}" AND (site:govconwire.com/ OR site:siliconangle.com/ OR site:techcrunch.com OR site:forbes.com/sites/ OR site:finsmes.com/ OR site:businesswire.com/ OR site:techfundingnews.com OR site:marketscreener.com/ OR site:msspalert.com/ OR site:theverge.com OR site:reseller.co.nz/ OR site:bizjournals.com/ OR site:prnewswire.com/ OR site:linkedin.com/company/defense-news/ OR site:defensenews.com)`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&sort=date&tbm=nws`;

    const response = await fetch(url);
    const data = await response.json();

    let articleText = "";
    if (data.items && data.items.length > 0) {
      const articlePromises = data.items.slice(0, 5).map(async (article) => {
        const articleResponse = await fetch(article.link);
        const articleContent = await articleResponse.text();

        // Parse articleContent using HTML parser instead if it's in HTML format

        const parser = new xml2js.Parser();
        const parsedArticleContent = await parser.parseStringPromise(articleContent);

        const articleElement = parsedArticleContent.html.body[0].div[2].div[0].div[0].div[0].div[0].div[0].div[0];
        const paragraphs = articleElement.p;
        for (let j = 0; j < paragraphs.length; j++) {
          articleText += paragraphs[j]._ + "\n";
        }
      });

      await Promise.all(articlePromises);
    }

    res.send(articleText || null);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
