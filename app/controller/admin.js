'use strict';

const Controller = require('egg').Controller;

class AdminController extends Controller {

  async alive() {
    this.ctx.body = true;
  }

  async login() {
    const { ctx } = this;
    const { name, password } = ctx.request.body;
    const login = await ctx.service.admin.login(name, password);
    if (login.auth) {
      ctx.cookies.set('name', login.user.name, {
        encrypt: true,
      });
      ctx.body = {
        status: 200,
        message: 'auth success',
      };
    } else {
      ctx.body = {
        status: 401,
        message: 'auth fail',
      };
    }
  }

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

  async create() {
    const ctx = this.ctx;
    const uploadObj = ctx.request.body;
    console.log(uploadObj);
    ctx.body = await ctx.service.admin.create(uploadObj);
  }
}

module.exports = AdminController;
