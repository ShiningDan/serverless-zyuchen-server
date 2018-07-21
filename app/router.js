'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.list);
  router.get('/archives', controller.home.archives);
  router.get('/series', controller.home.series);
  router.get('/post/:id', controller.home.article);
  router.get('/articleNav', controller.home.articleNav);
  router.get('/articleSeries', controller.home.articleSeries);

  // Admin
  router.get('/admin/list', controller.admin.list);
  router.get('/admin/upload/:id', controller.admin.getArticle);
  router.get('/admin/categories', controller.admin.getCategories);
  router.get('/admin/series', controller.admin.getSeries);
};
