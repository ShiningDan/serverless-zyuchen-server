'use strict';
const Serivce = require('egg').Service;
const { flatMongoResponse, extractCreateAtUpdateAt } = require('../util/mongoUtil');
const marked = require('marked');
const markdownToc = require('markdown-toc');

class AdminService extends Serivce {
  async login(name, password) {
    const { ctx } = this;
    const User = ctx.model.User;
    const user = await User.findOne({ name });
    if (user) {
      if (user.name === name && user.password === password) {
        return {
          auth: true,
          user: {
            name,
            password,
          },
        };
      }
    }
    return {
      auth: false,
    };
  }

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
        meta: 1,
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

  async getCategories() {
    const Category = this.ctx.model.Category;
    const categories = await Category.find({})
      .select({
        name: 1,
      }).exec();
    return categories;
  }

  async getSeries() {
    const Series = this.ctx.model.Series;
    const series = await Series.find({})
      .select({
        name: 1,
      }).exec();
    return series;
  }

  async create(uploadObj) {
    this.handleUploadObj(uploadObj);
    return uploadObj;
  }

  async handleUploadObj(uploadObj) {
    let markdowntocdiv = '<div id="toc"><header>文章目录</header>' + marked(markdownToc(uploadObj.content).content) + '</div>';
    let content = marked(uploadObj.content);
    uploadObj.md = uploadObj.content;
    // 处理文章的目录栏
    const tocreg = /<h(\d)([\s\S]+?)id="([\s\S]+?)"([\s\S]+?)>/g;
    let tocIndex = 0;
    content = content.replace(tocreg, function(value, p1, p2, p3, p4) {
      // console.log(value, p1, p2, p3, p4);
      tocIndex++;
      return '<h' + p1 + p2 + 'id="toc-' + tocIndex + '"' + p4 + '>';
    });
    tocIndex = 0;
    const tocheader = /<a href="([\s\S]+?)">/g;
    markdowntocdiv = markdowntocdiv.replace(tocheader, function() {
      tocIndex++;
      return '<a href="#toc-' + tocIndex + '">';
    });
    uploadObj.content = markdowntocdiv + content;
  }
}

module.exports = AdminService;
