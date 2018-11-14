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
        let maxConnectTimes = 0;

        //  开启数据库调试
        if(process.env.NODE_ENV !== 'production'){
            // mongoose.set('debug',true);
        }
        
        mongoose.connect(db, { useNewUrlParser: true });
        mongoose.connection.on('disconnect', () => {
            maxConnectTimes++;

            if(maxConnectTimes < 5){
                mongoose.connect(db);
            } else{
                throw new Error('数据库挂了吧少年');
            }
            
        })
        mongoose.connection.on('error', (err) => {
            maxConnectTimes++;

            if(maxConnectTimes < 5){
                mongoose.connect(db);
            } else{
                throw new Error('数据库报错了少年');
            }
        })
        mongoose.connection.on('open', () => {
            resolve();
            console.log('Mongodb 连接成功');
        })
    })
}