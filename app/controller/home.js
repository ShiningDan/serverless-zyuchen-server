'use strict';

const Controller = require('egg').Controller;
const { flatMongoResponse, extractCreateAtUpdateAt } = require('../util/mongoUtil');

class HomeController extends Controller {
  async list() {
    const { ctx } = this;
    const { lt, gt } = ctx.query;
    ctx.body = await ctx.service.home.list(lt, gt);
  }

  async article() {
    const { ctx } = this;
    ctx.body = await ctx.service.home.article(ctx.path);
  }

  async articleNav() {
    const { ctx } = this;
    const { id } = ctx.query;
    ctx.body = await ctx.service.home.articleNav(id);
  }

  async articleSeries() {
    const { ctx } = this;
    const { series } = ctx.query;
    if (series) {
      ctx.body = await ctx.service.home.articleSeries(series);
    } else {
      ctx.body = [];
    }
  }

  async index() {
    const Abstract = this.ctx.model.Abstract;
    const articles = await Abstract.find({
      title: '博客性能优化之静态资源优化',
    }).select({
      title: 1,
      categories: 1,
      meta: 1,
      link: 1,
    }).exec();
    this.ctx.body = articles.map(article => flatMongoResponse(article))
      .map(article => extractCreateAtUpdateAt(article));
  }

  async archives() {
    const { ctx } = this;
    ctx.body = await ctx.service.home.archives();
  }

  async series() {
    const { ctx } = this;
    ctx.body = await ctx.service.home.series();
  }
}

module.exports = HomeController;
