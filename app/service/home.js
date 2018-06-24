'use strict';
const Serivce = require('egg').Service;
const { flatMongoResponse, extractCreateAtUpdateAt } = require('../util/mongoUtil');

class HomeService extends Serivce {
  async list() {
    const { ctx } = this;
    const Abstract = ctx.model.Abstract;
    const abstracts = await Abstract.find({})
      .select({
        title: 1,
        abstract: 1,
        meta: 1,
        link: 1,
      }).exec();
    return abstracts.map(abstract => flatMongoResponse(abstract))
      .map(abstract => extractCreateAtUpdateAt(abstract));
  }

  async article(path) {
    const { ctx } = this;
    const Article = ctx.model.Article;
    const article = await Article.findOne({
      link: path,
    }).select({
      content: 1,
      meta: 1,
      categories: 1,
      series: 1,
    }).exec();
    return flatMongoResponse(extractCreateAtUpdateAt(article));
  }

  async archives() {
    const { ctx } = this;
    const articles = {};
    const Abstract = ctx.model.Abstract;
    const abstracts = await Abstract.find({})
      .select({
        title: 1,
        meta: 1,
        link: 1,
      }).exec();
    abstracts.forEach(abstract => {
      const date = new Date(abstract.meta.createAt);
      const year = date.getFullYear();
      const month = date.getUTCMonth() + 1;
      const { link, title } = abstract;
      if (articles[year]) {
        // aYear should be an array of months
        const aYear = articles[year];
        if (aYear[month]) {
          // aMonth should be an array of article info
          const aMonth = aYear[month];
          aMonth.push({
            title,
            link,
            date,
          });
        } else {
          aYear[month] = [{
            title,
            link,
            date,
          }];
        }
      } else {
        articles[year] = {};
        articles[year][month] = [{
          title,
          link,
          date,
        }];
      }
    });
    const articleArray = [];
    for (const i in articles) {
      const years = {};
      years[i] = [];
      articleArray.push(years);
      for (const j in articles[i]) {
        const months = {};
        months[j] = articles[i][j];
        articleArray[articleArray.length - 1][i].push(months);
      }
    }
    return articleArray;
  }
}

module.exports = HomeService;
