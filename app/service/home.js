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
}

module.exports = HomeService;
