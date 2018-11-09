let reply = async (ctx,next) => {
    const message = ctx.weixin;

    if(message.MsgType === 'text'){
        let content = message.Content;
        let reply = 'Oh,你说的' + content + '太复杂了无法解析';

        if (content === '1') {
            reply = '天下第一吃打大米';
        }else if(content === '2'){
            reply = '天下第二吃豆腐';
        }else if(content === '3'){
            reply = '天下第三尺鸭蛋'
        }

        ctx.body = reply;
    }

    await next();
}

module.exports = {
    reply
}