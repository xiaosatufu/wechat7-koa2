const mongoose = require('mongoose');
const { resolve } = require('path');
// 读路径的库
const glob = require('glob');

mongoose.Promise = global.Promise;

exports.initSchemas = () => {
    glob.sync(resolve(__dirname, './schema', '**/*.js'))
        .forEach(require)
}

exports.connect = (db) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(db, { useNewUrlParser: true });
        mongoose.connection.on('disconnect', () => {
            console.log('数据库挂了吧少年');
        })
        mongoose.connection.on('error', (err) => {
            console.log(err);
        })
        mongoose.connection.on('open', () => {
            resolve();
            console.log('Mongodb 连接成功');
        })
    })
}