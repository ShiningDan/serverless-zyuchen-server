'use strict';

const Controller = require('egg').Controller;

class AdminController extends Controller {
  async list() {
    const ctx = this.ctx;
    ctx.body = await ctx.service.admin.list();
  }

  async getArticle() {
    console.log(this.ctx.path, '------');
    const ctx = this.ctx;
    const id = ctx.params.id;
    ctx.body = await ctx.service.admin.getArticle(id);
  }
}

module.exports = AdminController;
