const { reply } = require('../../wechat/reply');
const config = require('../../config/config');
const wechatMiddle = require('../../wechat-lib/middleware');
const { getOAuth } = require('../../wechat/index');

// 接入微信中间件
exports.sdk = async (ctx, next) => {
    // ctx.body = 'sdk page';
    await ctx.render('wechat/sdk',{
        title: 'SDK Test',
        desc: '测试 SDK'
    })
}


// 接入微信消息中间件
exports.hear = async (ctx, next) => {
    const middle = wechatMiddle(config, reply);

    await middle(ctx, next);
}

exports.oauth = async (ctx, next) => {
    // const state = ctx.query.id;
    // const scope = 'snsapi_userinfo';
    // const target = config.baseUrl + 'userinfo';
    // const url = api.wechat.getAuthorizeURL(scope, target, state);

    // ctx.redirect(url)

    const oauth = getOAuth();
    const target = config.baseUrl + 'userinfo';
    const scope = 'snsapi_userinfo';
    const state = ctx.query.id;
    const url = oauth.getAuthorizeURL(scope, target, state);

    ctx.redirect(url);

}

exports.userinfo = async (ctx, next) => {
    // const userData = await api.wechat.getUserinfoByCode(ctx.query.code);

    // ctx.body = userData;

    const oauth = getOAuth();
    const code = ctx.query.code;
    const data = await oauth.fetchAccessToken(code);
    const userData = await oauth.getUserInfo(data.access_token, data.openid);

    ctx.body = userData;
}


