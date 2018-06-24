'use strict';

const Controller = require('egg').Controller;

class AdminController extends Controller {
  async list() {
    const ctx = this.ctx;
    ctx.body = await ctx.service.admin.list();
  }

  async getArticle() {
    const ctx = this.ctx;
    const id = ctx.params.id;
    ctx.body = await ctx.service.admin.getArticle(id);
  }

  async getCategories() {
    const ctx = this.ctx;
    ctx.body = await ctx.service.admin.getCategories();
  }

  async getSeries() {
    const ctx = this.ctx;
    ctx.body = await ctx.service.admin.getSeries();
  }
}

module.exports = AdminController;
