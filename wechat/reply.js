const { resolve } = require('path');

let reply = async (ctx, next) => {
    const message = ctx.weixin;

    let mp = require('./index');
    let client = mp.getWechat();


    if (message.MsgType === 'text') {
        let content = message.Content;
        let reply = 'Oh,你说的' + content + '太复杂了无法解析';

        if (content === '1') {
            reply = '天下第一吃打大米';
        } else if (content === '2') {
            reply = '天下第二吃豆腐';
        } else if (content === '3') {
            reply = '天下第三尺鸭蛋'
        } else if (content === '4') {
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../img.jpg'));
            // 临时素材
            // errmsg: 'media data missing hint node 错误没有解决

            console.log('4的中的data');
            console.log(data);

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if (content === '5') {
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../video.mp4'));
            // 临时素材
            // errmsg: 'media data missing hint node 错误没有解决

            // console.log('5的中的data');
            // console.log(data);

            reply = {
                type: 'video',
                title: '回复的视频标题',
                description: '测试啊测试',
                mediaId: data.media_id
            }
        } else if (content === '6') {
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../video.mp4'), {
                type: 'video',
                description: '{"title":"这个地方很棒","introduction":"永久测试"}'
            });

            console.log('6的中的data');
            console.log(data);

            reply = {
                type: 'video',
                title: '永久视频测试',
                description: '测试啊测试',
                mediaId: data.media_id
            }
        } else if (content === '7') {
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../img.jpg'), {
                type: 'image'
            });
            // 永久素材
            // errmsg: 'media data missing hint node 错误没有解决

            console.log('7的中的data');
            console.log(data);

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if (content === '8') {
            // 回复图文

            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../img.jpg'), {
                type: 'image'
            });

            let data2 = await client.handle('uploadMaterial', 'pic', resolve(__dirname, '../img.jpg'), {
                type: 'image'
            });

            let media = {
                articles: [
                    {
                        title: '这是服务端上传的图文 1',
                        thumb_media_id: data.media_id,
                        author: '咸蛋超人',
                        digest: '没有摘要',
                        show_cover_pic: 1,
                        content: '去往百度的车',
                        content_source_url: 'https://www.baidu.com/'
                    },
                    {
                        title: '这是服务端上传的图文 2',
                        thumb_media_id: data.media_id,
                        author: '咸蛋超人',
                        digest: '没有摘要',
                        show_cover_pic: 1,
                        content: '同样去百度的车',
                        content_source_url: 'https://www.baidu.com/'
                    },
                ]
            }

            let uploadData = await client.handle('uploadMaterial', 'news', media, {});

            console.log(uploadData);
            
            reply = '上传成功'
        }

        ctx.body = reply;
    }

    await next();
}

module.exports = {
    reply
}