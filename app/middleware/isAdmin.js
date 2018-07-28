'use strict';

module.exports = () => {
  return async function isAdmin(ctx, next) {
    const name = ctx.cookies.get('name', {
      encrypt: true,
    });
    const User = ctx.model.User;
    const user = await User.findOne({ name });
    if (user) {
      await next();
    } else {
      ctx.body = {
        status: 401,
        message: 'auth fail',
      };
      return;
    }
  };
};
