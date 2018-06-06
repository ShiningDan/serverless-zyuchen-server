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
  async getArticle() {
    // const Article = this.ctx.model.Article;
    // console.log(id);
    // const article = await Article.findById(id);
    // console.log(article);
    return 'v';
  }
}

module.exports = AdminService;
