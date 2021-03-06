const Wechat = require('../app/controllers/wechat');

module.exports = router => {
    router.get('/sdk', Wechat.sdk);

    // 进入微信消息中间件
    router.get('/wx-hear', Wechat.hear);
    router.post('/wx-hear', Wechat.hear);

    // 跳到授权中间服务页面
    router.get('/wx-oauth', Wechat.oauth);
    // 通过code获取用户信息
    router.get('/userinfo', Wechat.userinfo);

}
