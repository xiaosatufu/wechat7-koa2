const { resolve } = require('path');

let reply = async (ctx, next) => {
    const message = ctx.weixin;

    let mp = require('./index');
    let client = mp.getWechat();
    if (message.MsgType === 'event') {

        let reply = '';

        if (message.Event === 'LOCATION') {
            // 地理位置上报
            reply = `您上报的位置是：${message.Latitude}-${message.Longitude}-${message.Precision}`
        }

        ctx.body = reply;

    } else if (message.MsgType === 'text') {
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

            if (data.errcode) {
                console.log('报错了');
                console.log(data);
            }

            // let data2 = await client.handle('uploadMaterial','pic',resolve(__dirname, '../img.jpg'),{type: 'image'});

            // console.log('data');
            // console.log(data);

            let media = {
                articles: [
                    {
                        title: '这是服务端上传的图文 1',
                        thumb_media_id: data.media_id,
                        author: '咸蛋超人',
                        digest: '一号的摘要',
                        show_cover_pic: 1,
                        content: '一号的内容',
                        content_source_url: 'https://www.baidu.com/'
                    },
                    {
                        title: '这是服务端上传的图文 2',
                        thumb_media_id: data.media_id,
                        author: '咸蛋超人',
                        digest: '二号的摘要',
                        show_cover_pic: 1,
                        content: '二号的内容',
                        content_source_url: 'https://www.baidu.com/'
                    },
                ]
            }

            let uploadData = await client.handle('uploadMaterial', 'news', media, {});
            let newsData = await client.handle('fetchMaterial', uploadData.media_id, 'news', true);

            let items = newsData.news_item;
            let news = [];

            // console.log('newsData');
            // console.log(newsData);

            items.forEach(item => {
                news.push({
                    title: item.title,
                    description: item.description,
                    picUrl: data.url,
                    url: item.url
                })
            });

            // console.log('newsData');
            // console.log(news);

            // reply = '上传成功'
            reply = news;
        } else if (content === '9') {
            // 查询媒体数量
            let counts = await client.handle('countMaterial');

            // console.log(JSON.stringify(counts));

            let res = await Promise.all([
                client.handle('batchMaterial', {
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'news',
                    offset: 0,
                    count: 10
                }),
            ]);

            // console.log(res);


            reply = `
                image: ${res[0].total_count}
                video: ${res[1].total_count}
                voice: ${res[2].total_count}
                news: ${res[3].total_count}
            `
        } else if (content === '10') {
            // 创建标签
            // let newTag = await client.handle('createTag', 'imooc')
            // console.log(newTag)

            // 删除标签
            // await client.handle('delTag', 100)

            // 编辑标签
            // await client.handle('updateTag', 101, '慕课网')

            // 批量打标签/取消标签
            // 打标签
            // await client.handle('batchTag', [message.FromUserName], 100)
            // 取消标签
            // await client.handle('batchTag', [message.FromUserName], 100, true)

            // 获取某个标签的用户列表
            // let userList = await client.handle('fetchTagUsers', 2)
            // console.log(userList)

            // 获取公众号的标签列表
            let tagsData = await client.handle('fetchTags')
            console.log('tagsData');
            console.log(tagsData);


            // 获取某个用户的标签列表
            // let userTags = await client.handle('getUserTags', message.FromUserName)

            reply = tagsData.tags.length
        } else if (content === '11') {
            // 获取用户列表

            let userList = await client.handle('fetchUserList')
            console.log(userList)
            reply = userList.total + ' 个关注者'

        } else if (content === '12') {
            // 给用户加备注，服务号可用
            await client.handle('remarkUser', message.FromUserName, 'ScottScott');
            reply = '改名成功'
        } else if (content === '13') {
            // 获取单个用户信息
            let userInfoData = await client.handle('getUserInfo', message.FromUserName)

            console.log(userInfoData)

            reply = JSON.stringify(userInfoData)
        } else if (content === '14') {
            // 批量获取用户信息
            let batchUsersInfo = await client.handle('fetchBatchUsers', [{
                openid: message.FromUserName,
                lang: 'zh_CN'
            }])

            console.log(batchUsersInfo)

            reply = JSON.stringify(batchUsersInfo)
        } else if (content === '15') {
            // 二维码测试

            // 临时二维码
            // let tempQrData = {
            //     expire_seconds: 400000,
            //     action_name: 'QR_SCENE',
            //     action_info: {
            //         scene: {
            //             scene_id: 101
            //         }
            //     }
            // }
            // let tempTicketData = await client.handle('createQrcode', tempQrData)
            // console.log(tempTicketData)
            // let tempQr = client.showQrcode(tempTicketData.ticket)

            // reply = tempQr

            // 永久二维码
            let qrData = {
                // 去掉过期时间就是永久二维码了
                action_name: 'QR_SCENE',
                action_info: {
                    scene: {
                        scene_id: 99
                    }
                }
            }
            let ticketData = await client.handle('createQrcode', qrData)
            console.log(ticketData)
            let qr = client.showQrcode(ticketData.ticket)
            console.log(qr)

            reply = qr

        } else if (content === '16') {
            let longurl = 'https://coding.imooc.com/class/178.html?a=1'
            let shortData = await client.handle('createShortUrl', 'long2short', longurl)

            console.log(shortData)

            reply = shortData.short_url
        } else if (content === '17') {
            let semanticData = {
                query: '查一下明天从杭州到北京的南航机票',
                city: '杭州',
                category: 'flight,hotel',
                uid: message.FromUserName
            }
            let searchData = await client.handle('semantic', semanticData)

            console.log(searchData)

            reply = JSON.stringify(searchData)
        } else if (content === '18') {
            let body = '你好啊，我来自中国';
            let aiData = await client.handle('aiTranslate', body, 'zh_CN', 'en_US')

            reply = JSON.stringify(aiData);
        } else if (content === '19') {
            try {
                let delData = await client.handle('deleteMenu')
                console.log(delData)
                let menu = {
                    button: [
                        {
                            name: '一级菜单',
                            sub_button: [
                                {
                                    name: '二级菜单 1',
                                    type: 'click',
                                    key: 'no_1'
                                }, {
                                    name: '二级菜单 2',
                                    type: 'click',
                                    key: 'no_2'
                                }, {
                                    name: '二级菜单 3',
                                    type: 'click',
                                    key: 'no_3'
                                }, {
                                    name: '二级菜单 4',
                                    type: 'click',
                                    key: 'no_4'
                                }, {
                                    name: '二级菜单 5',
                                    type: 'click',
                                    key: 'no_5'
                                }
                            ]
                        },
                        {
                            name: '分类',
                            type: 'view',
                            url: 'https://www.imooc.com'
                        },
                        {
                            name: '新菜单_' + Math.random(),
                            type: 'click',
                            key: 'new_111'
                        }
                    ]
                }
                let createData = await client.handle('createMenu', menu)
                console.log(createData)
            } catch (e) {
                console.log(e)
            }

            reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
        } else if (content === '20') {
            try {
                // let delData = await client.handle('deleteMenu')
                let menu = {
                    button: [
                        {
                            name: 'Scan_Photo',
                            sub_button: [
                                {
                                    name: '系统拍照',
                                    type: 'pic_sysphoto',
                                    key: 'no_1'
                                }, {
                                    name: '拍照或者发图',
                                    type: 'pic_photo_or_album',
                                    key: 'no_2'
                                }, {
                                    name: '微信相册发布',
                                    type: 'pic_weixin',
                                    key: 'no_3'
                                }, {
                                    name: '扫码',
                                    type: 'scancode_push',
                                    key: 'no_4'
                                }, {
                                    name: '等待中扫码',
                                    type: 'scancode_waitmsg',
                                    key: 'no_5'
                                }
                            ]
                        },
                        {
                            name: '跳新链接',
                            type: 'view',
                            url: 'https://www.imooc.com'
                        },
                        {
                            name: '其他',
                            sub_button: [
                                {
                                    name: '点击',
                                    type: 'click',
                                    key: 'no_11'
                                }, {
                                    name: '地理位置',
                                    type: 'location_select',
                                    key: 'no_12'
                                }
                            ]
                        }
                    ]
                }
                let rules = {
                    // "tag_id": "2",
                    // "sex": "1",
                    // "country": "中国",
                    // "province": "广东",
                    // "city": "广州",
                    // "client_platform_type": "2",
                    language: 'en'
                }
                await client.handle('createMenu', menu, rules)
            } catch (e) {
                console.log(e)
            }

            let menus = await client.handle('fetchMenu')
            console.log(JSON.stringify(menus))

            reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
        }

        ctx.body = reply;
    }

    await next();
}

module.exports = {
    reply
}