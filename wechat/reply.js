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
            // 临时素材 图片上传
            
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if (content === '5') {
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../video.mp4'));
            // 临时素材 视频的上传测试

            // console.log('5的中的data');
            // console.log(data);

            reply = {
                type: 'video',
                title: '临时素材视频',
                description: '测试临时素材视频',
                mediaId: data.media_id
            }
        } else if (content === '6') {
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../video.mp4'), {
                type: 'video',
                description: '{"title":"永久素材视频素材测试","introduction":"永久测试"}'
            });


            reply = {
                type: 'video',
                title: '永久素材视频测试',
                description: '测试啊测试',
                mediaId: data.media_id
            }
        } else if (content === '7') {
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../img.jpg'), {
                type: 'image'
            });
            // 永久素材 图片

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if (content === '8') {
            // 回复图文

            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../img.jpg'), {
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
        } else if (content === '9'){
            // 查询媒体数量
            let counts = await client.handle('countMaterial');

            console.log(JSON.stringify(counts));

            let res = await Promise.all([
                client.handle('batchMaterial',{
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial',{
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial',{
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial',{
                    type: 'news',
                    offset: 0,
                    count: 10
                }),
            ]);

            console.log(res);

            reply = `
                image: ${res[0].total_count}
                video: ${res[1].total_count}
                voice: ${res[2].total_count}
                news: ${res[3].total_count}
            `
        }

        ctx.body = reply;
    }

    await next();
}

module.exports = {
    reply
}