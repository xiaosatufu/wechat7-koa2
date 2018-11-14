const { resolve } = require('path');

let reply = async (ctx,next) => {
    const message = ctx.weixin;

    let mp = require('./index');
    let client = mp.getWechat();


    if(message.MsgType === 'text'){
        let content = message.Content;
        let reply = 'Oh,你说的' + content + '太复杂了无法解析';

        if (content === '1') {
            reply = '天下第一吃打大米';
        }else if(content === '2'){
            reply = '天下第二吃豆腐';
        }else if(content === '3'){
            reply = '天下第三尺鸭蛋'
        }else if(content === '4'){
            let data = await client.handle('uploadMaterial','image',resolve(__dirname,'../img.jpg'));

            // errmsg: 'media data missing hint node 错误没有解决
            
            // console.log('4的中的data');
            // console.log(data);

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }else if(content === '5'){
            let data = await client.handle('uploadMaterial','video',resolve(__dirname,'../video.mp4'));
            // errmsg: 'media data missing hint node 错误没有解决

            // console.log('5的中的data');
            // console.log(data);

            reply = {
                type: 'video',
                title: '回复的视频标题',
                description: '测试啊测试',
                mediaId: data.media_id
            }
        }

        ctx.body = reply;
    }

    await next();
}

module.exports = {
    reply
}