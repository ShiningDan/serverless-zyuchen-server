'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    name: {
      type: String,
      unique: true,
    },
    password: String,
    // 0: normal user
    // 1: verified user
    // 2: professional user
    // >10: admin
    // > 50: super admin
    role: {
      type: Number,
      default: 0,
    },
    meta: {
      createAt: {
        type: Date,
        default: Date.now(),
      },
      updateAt: {
        type: Date,
        default: Date.now(),
      },
    },
  });

  UserSchema.pre('save', function(next) {
    if (this.isNew) {
      this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
      this.meta.updateAt = Date.now();
    }
    next();
  });

  UserSchema.methods = {
    comparePassword(_password) {
      return this.password === _password;
    },
  };

  return mongoose.model('User', UserSchema);
};
