const sha1 = require('sha1');
const getRawBody = require('raw-body');
const util = require('./until');

// 配置验证微信的过程
module.exports = (config, reply) => {
    return async (ctx, next) => {
        // signature 微信加密签名，signature结合了开发者填写的token参数和请求中的timestamp参数、nonce参数。
        // timestamp	时间戳
        // nonce	随机数
        // echostr	随机字符串
        
        // console.log('ctx.query');
        // console.log(ctx.query);

        const { signature, timestamp, nonce, echostr } = ctx.query;
        const token = config.wechat.token;
        let str = [token, timestamp, nonce].sort().join('');

        const sha = sha1(str);

        if (ctx.method === 'GET') {
            if (sha === signature) {
                ctx.body = echostr;
            } else {
                ctx.body = 'Failed';
            }
        } else if (ctx.method === 'POST') {
            if (sha !== signature) {
                return ctx.body = 'Failed';
            }

            const data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: '1mb',
                encoding: ctx.charset
            });

            const content = await util.parseXML(data);
            const message = util.formatMessage(content.xml);
            
            ctx.weixin = message;
            
            await reply.apply(ctx, [ctx, next]);

            const replyBody = ctx.body;
            const msg = ctx.weixin;
            const xml = util.tpl(replyBody,msg);

            console.log('xml');
            console.log(xml);
            
            ctx.status = 200;
            ctx.type = 'application/xml';
            ctx.body = xml;
        }
    }
}

