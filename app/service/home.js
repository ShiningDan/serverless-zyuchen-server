'use strict';
const Serivce = require('egg').Service;
const { flatMongoResponse, extractCreateAtUpdateAt } = require('../util/mongoUtil');
const PAGE_COUNT = 5;

class HomeService extends Serivce {
  async list(lt, gt) {
    const { ctx } = this;
    const Abstract = ctx.model.Abstract;
    let abstracts;
    // id 越大，代表文章越新
    // gt 返回的结果有问题，需要调试
    if (gt) {
      abstracts = await Abstract.find({
        _id: {
          $gt: gt,
        },
      })
        .limit(PAGE_COUNT + 1)
        // .sort({ _id: -1 })
        .select({
          title: 1,
          abstract: 1,
          meta: 1,
          link: 1,
        })
        .exec();
      if (abstracts.length === PAGE_COUNT + 1) {
        // 将前 length - 1 项翻转，补上最后一项
        const last = abstracts[PAGE_COUNT];
        const notLast = abstracts.slice(0, PAGE_COUNT);
        abstracts = notLast.reverse().concat(last);
      } else {
        abstracts = abstracts.reverse();
      }
    } else if (lt) {
      abstracts = await Abstract.find({
        _id: {
          $lt: lt,
        },
      })
        .sort({ _id: -1 })
        .limit(PAGE_COUNT + 1)
        .select({
          title: 1,
          abstract: 1,
          meta: 1,
          link: 1,
        })
        .exec();
    } else {
      abstracts = await Abstract.find({})
        .sort({ _id: -1 })
        .limit(PAGE_COUNT + 1)
        .select({
          title: 1,
          abstract: 1,
          meta: 1,
          link: 1,
        })
        .exec();
    }
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

  async series() {
    const { ctx } = this;
    const Series = ctx.model.Series;
    const series = await Series.find({}).populate('articles', [ 'title', 'link', 'meta.createAt' ]);
    series.forEach(function(s) {
      s.articles = s.articles.sort(function(a, b) {
        return b.meta.createAt - a.meta.createAt;
      });
    });
    return series;
  }
}

module.exports = HomeService;
