'use strict';
const Serivce = require('egg').Service;
const { flatMongoResponse, extractCreateAtUpdateAt } = require('../util/mongoUtil');

class AdminService extends Serivce {
  async list() {
    const Article = this.ctx.model.Article;
    const articles = await Article.find({})
      .select({
        title: 1,
        categories: 1,
        meta: 1,
        link: 1,
      }).exec();
    return articles.map(article => flatMongoResponse(article))
      .map(article => extractCreateAtUpdateAt(article));
  }
  // 在 upload 的时候需要判断是否和现有的文章重合
  // 如果重合，需要删除现有的文章，以及相关的内容
  // async upload() {}

  // 根据文章的 id 来获得该文章原始的内容
  async getArticle(id) {
    const { ctx } = this;
    const Article = ctx.model.Article;
    const Abstract = ctx.model.Abstract;
    const article = await Article.findById(id)
      .select({
        title: 1,
        md: 1,
        link: 1,
        series: 1,
        categories: 1,
        createAt: 1,
        updateAt: 1,
      }).exec();
    const { title } = article;
    const abstract = await Abstract.findOne({
      title,
    }).select({
      abstract: 1,
    }).exec();
    const payload = extractCreateAtUpdateAt(flatMongoResponse(article));
    payload.abstract = abstract.abstract;
    return payload;
  }
}

module.exports = AdminService;
