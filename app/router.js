'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  // Admin
  router.get('/admin/list', controller.admin.list);
  router.get('/admin/upload/:id', controller.admin.getArticle);
  router.get('/admin/categories', controller.admin.getCategories);
  router.get('/admin/series', controller.admin.getSeries);
};
