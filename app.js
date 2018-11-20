const Koa = require('koa');

const wechat = require('./wechat-lib/middleware');
const config = require('./config/config');
const { reply } = require('./wechat/reply');
const Router = require('koa-router');

const { initSchemas, connect } = require('./app/database/init');


; (async () => {
    await connect(config.db);

    initSchemas();
    
    // 测试token的数据库存贮
    // const { test } = require('./wechat/index');
    // await test();
    
    
    // 生成服务器实例
    const app = new Koa();
    const router = new Router();

    //接入微信消息中间件
    // ctx是koa的应用上下文
    // next就是串联中间件的钩子函数
    require('./config/routes')(router);
    // app.use(wechat(config, reply));

    // 让路由中间件生效
    app.use(router.routes()).use(router.allowedMethods());

    app.listen(config.port);
    console.log('Listen' + config.port);
})();






