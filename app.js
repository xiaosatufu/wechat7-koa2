const Koa = require('koa');

const wechat = require('./wechat-lib/middleware');
const config = require('./config/config');
const { reply } = require('./wechat/reply');

const { initSchemas, connect } = require('./app/database/init');


; (async () => {
    await connect(config.db);

    initSchemas();
    
    // 测试token的数据库存贮
    const { test } = require('./wechat/index');
    await test();
    
    
    // 生成服务器实例
    const app = new Koa();

    //加载认证中间件
    // ctx是koa的应用上下文
    // next就是串联中间件的钩子函数
    app.use(wechat(config, reply));

    app.listen(config.port);
    console.log('Listen' + config.port);
})();






