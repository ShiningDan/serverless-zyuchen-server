'use strict';
const Serivce = require('egg').Service;
const { flatMongoResponse, extractCreateAtUpdateAt } = require('../util/mongoUtil');
const marked = require('marked');
const sizeOf = require('image-size');
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
    const { ctx } = this;
    const { Article, Abstract } = ctx.model;
    this.handleUploadObj(uploadObj);
    const article = Article({
      title: uploadObj.title,
      content: uploadObj.content,
      contentWebp: uploadObj.content,
      md: uploadObj.md,
      link: uploadObj.link,
      comments: [],
      categories: uploadObj.categories,
      series: uploadObj.series,
      meta: {
        createAt: new Date(uploadObj.createAt),
        updateAt: new Date(uploadObj.updateAt),
      },
    });
    const abstract = Abstract({
      title: uploadObj.title,
      abstract: uploadObj.abstract,
      link: uploadObj.link,
      comments: [],
      categories: uploadObj.categories,
      meta: {
        createAt: new Date(uploadObj.createAt),
        updateAt: new Date(uploadObj.updateAt),
      },
    });
    await Promise.all([ article.save(), abstract.save() ]);
    return uploadObj;
  }

  async handleUploadObj(uploadObj) {
    const { ctx } = this;
    uploadObj.content = uploadObj.md;
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
    content = markdowntocdiv + content;
    // 图片使用原来的图片，不过为了实现懒加载的能力，所以在创建 content 之后，需要得到图片的大小
    // const imageReg = /<img[\s\S]+?src\s*="([\s\S]+?)(.png|.jpg|)"/g;
    const imageReg = /<img[\s\S]+?src\s*="([\s\S]+?)"/g;
    const toBeReplace = [];
    content.replace(imageReg, (...args) => {
      toBeReplace.push(args);
    });
    // console.log(toBeReplace);
    const downloadImgPromiseArray = toBeReplace.map(match => {
      const imgUrl = match[1];
      return ctx.curl(imgUrl, {
        method: 'GET',
        contentType: 'arraybuffer',
      }).then(response => sizeOf(response.data))
        .catch(() => ({ height: 0, width: 0 }));
    });
    const imgSize = await Promise.all(downloadImgPromiseArray);
    console.log(imgSize);
    toBeReplace.forEach((match, index) => {
      const format = `<img data-src="${match[1]}" width=${imgSize[index].width} height=${imgSize[index].height}`;
      content = content.replace(match[0], format);
    });
    uploadObj.content = content;
  }

  addArticlesToSeries(serieses, id) {
    const { Series } = this.ctx.model;
    if (serieses.length !== 0) {
      return serieses.map(function(series) {
        return Series.findOne({ name: series }).then(function(s) {
          if (s) {
            // 如果该 series 已经存在了
            const sSet = new Set(s.articles.map(function(article) {
              return article.toString();
            }));
            sSet.add(id.toString());
            s.articles = Array.from(sSet);
            // 有问题！！！！
            s.save();
          } else {
            // 如果该 series 不存在
            const _series = new Series({
              name: series,
              articles: [ id ],
            });
            _series.save();
          }
        }).then(s => console.log('series:', s.name, 'updated'));
      });
    }
  }
}

module.exports = AdminService;
