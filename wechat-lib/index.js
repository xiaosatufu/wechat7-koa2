var fs = require('fs');
const request = require('request-promise');

const base = 'https://api.weixin.qq.com/cgi-bin/';
const mpBase = 'https://mp.weixin.qq.com/cgi-bin/';
const semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?';

const api = {
    semanticUrl,
    accessToken: base + 'token?grant_type=client_credential',
    temporary: {
        upload: base + 'media/upload?',
        // 获取临时素材
        fetch: base + 'media/get?'
    },
    permanent: {
        upload: base + 'material/add_material?',
        uploadNews: base + 'material/add_news?',
        uploadNewsPic: base + 'media/uploadimg?',
        // 获取永久素材
        fetch: base + 'material/get_material?',
        // 删除永久素材
        del: base + 'material/del_material?',
        // 更新永久素材
        update: base + 'material/update_material?',
        // 获取素材总数
        count: base + 'material/get_materialcount?',
        // 获取素材列表
        batch: base + 'material/batchget_material?'
    },
    tag: {
        create: base + 'tags/create?',
        fetch: base + 'tags/get?',
        update: base + 'tags/update?',
        del: base + 'tags/delete?',
        fetchUsers: base + 'user/tag/get?',
        batchTag: base + 'tags/members/batchtagging?',
        batchUnTag: base + 'tags/members/batchuntagging?',
        getUserTags: base + 'tags/getidlist?'
    },
    user: {
        fetch: base + 'user/get?',
        remark: base + 'user/info/updateremark?',
        info: base + 'user/info?',
        batch: base + 'user/info/batchget?'
    },
    qrcode: {
        create: base + 'qrcode/create?',
        show: mpBase + 'showqrcode?'
    },
    shortUrl: {
        create: base + 'shorturl?'
    },
    ai: {
        translate: base + 'media/voice/translatecontent?'
    },
    menu: {
        create: base + 'menu/create?',
        del: base + 'menu/delete?',
        custom: base + 'menu/addconditional?',
        fetch: base + 'menu/get?'
    },
    ticket: {
        get: base + 'ticket/getticket?'
    }
}

module.exports = class Wechat {
    constructor(opts) {
        this.opts = Object.assign({}, opts);
        this.appID = opts.appID;
        this.appSecret = opts.appSecret;
        this.getAccessToken = opts.getAccessToken;
        this.saveAccessToken = opts.saveAccessToken;
        this.getTicket = opts.getTicket
        this.saveTicket = opts.saveTicket

        this.fetchAccessToken();
    }

    async request(options) {
        options = Object.assign({}, options, { json: true })

        try {
            const res = await request(options);

            return res
        } catch (error) {
            console.log(error);
        }
    }


    // 1.首先检查数据库里的token是否过期
    // 2.过期则刷新
    // 3.token入库
    async fetchAccessToken() {
        let data = await this.getAccessToken();

        // if (this.getAccessToken) {
        //     data = await this.getAccessToken();
        // }

        if (!this.isValid(data, 'access_token')) {
            data = await this.updateAccessToken();
        }

        await this.saveAccessToken(data);

        return data
    }

    // 获取token
    async updateAccessToken() {
        const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;

        const data = await this.request({ url });
        const now = new Date().getTime();
        const expiresIn = now + (data.expires_in - 20) * 1000;

        data.expires_in = expiresIn;

        // console.log('获取token');
        // console.log(data);

        return data
    }


    async fetchTicket(token) {
        let data = await this.getTicket()

        if (!this.isValid(data, 'ticket')) {
            data = await this.updateTicket(token)
        }

        await this.saveTicket(data)
        return data
    }

    // 获取 token
    async updateTicket(token) {
        const url = `${api.ticket.get}access_token=${token}&type=jsapi`

        const data = await this.request({ url })
        const now = new Date().getTime()
        const expiresIn = now + (data.expires_in - 20) * 1000

        data.expires_in = expiresIn

        return data
    }

    isValid(data,name) {
        if (!data || !data[name].expires_in) {
            return false
        }

        const expiresIn = data.expires_in;
        const now = new Date().getTime();

        if (now < expiresIn) {
            return true
        } else {
            return false
        }
    }

    uploadMaterial(token, type, material, permanent = false) {
        let form = {};
        let url = api.temporary.upload;

        // 永久素材 form是个obj,继承外面传入的新对象
        if (permanent) {
            url = api.permanent.upload;
            form = Object.assign(form, permanent);
        }

        // 上传图文消息的图片素材
        if (type === 'pic') {
            url = api.permanent.uploadNewsPic;
        }

        // 图文非图文的素材提交表单的切换
        if (type === 'news') {
            url = api.permanent.uploadNews;
            form = material;
        } else {
            form.media = fs.createReadStream(material);
        }

        // material是个文件路径
        // form.media = fs.createReadStream(material);
        // form.media = fs.readFileSync(material);

        let uploadUrl = `${url}access_token=${token}`

        // 根据素材永久性填充token
        if (!permanent) {
            uploadUrl += `&type=${type}`
        } else {
            if (type !== 'news') {
                form.access_token = token;
            }
        }

        const options = {
            method: 'POST',
            url: uploadUrl,
            json: true,
            // formData: form
        }

        // 图文和非图文在request 提交主体判断
        if (type === 'news') {
            options.body = form;
        } else {
            options.formData = form;
        }

        // console.log('options.formData');
        // console.log(options.formData);

        return options
    }

    async handle(operation, ...args) {
        const tokenData = await this.fetchAccessToken();
        // console.log('...args');
        // console.log(...args);

        const options = this[operation](tokenData.token, ...args);

        const data = await this.request(options);

        return data;
    }

    fetchMaterial(token, mediaId, type, permanent) {
        let form = {};
        let fetchUrl = api.temporary.fetch;

        if (permanent) {
            fetchUrl = api.permanent.fetch;
        }

        let url = fetchUrl + 'access_token=' + token
        let options = {
            method: 'POST',
            url
        }

        if (permanent) {
            form.media_id = mediaId;
            form.access_token = token;
            options.body = form;
        } else {
            if (type === 'video') {
                // 获取临时素材时需要将https转换成http
                url = url.replace('https:', 'http:');
            }

            url += '$media_id' + mediaId;
        }

        return options
    }

    deleteMaterial(token, mediaId) {
        const form = {
            media_id: mediaId
        }

        const url = `${api.permanent.del}access_token=${token}&media_id=${mediaId}`;

        return {
            method: 'POST',
            url,
            body: form
        }
    }

    updateMaterial(token, mediaId, news) {
        let form = {
            media_id: mediaId
        }

        form = Object.assign(form, news);

        const url = `${api.permanent.update}access_token=${token}&media_id=${mediaId}`;

        return {
            method: 'POST',
            url,
            body: form
        }
    }

    countMaterial(token) {
        const url = `${api.permanent.count}access_token=${token}`;

        return {
            method: 'POST',
            url
        }
    }

    batchMaterial(token, options) {
        options.type = options.type || 'image';
        options.offset = options.offset || 0;
        options.count = options.count || 10;

        const url = `${api.permanent.batch}access_token=${token}`;

        return {
            method: 'POST',
            url,
            body: options
        }
    }

    // 创建标签
    createTag(token, name) {
        const body = {
            tag: {
                name
            }
        }

        const url = api.tag.create + 'access_token=' + token

        return { method: 'POST', url, body }
    }

    // 获取全部的标签
    fetchTags(token) {
        const url = api.tag.fetch + 'access_token=' + token

        return { url }
    }

    // 编辑标签
    updateTag(token, id, name) {
        const body = {
            tag: {
                id,
                name
            }
        }

        const url = api.tag.update + 'access_token=' + token
        return { method: 'POST', url, body }
    }

    // 删除标签
    delTag(token, id) {
        const body = {
            tag: {
                id
            }
        }

        const url = api.tag.del + 'access_token=' + token

        return { method: 'POST', url, body }
    }

    // 获取标签下的粉丝列表
    fetchTagUsers(token, id, openId) {
        const body = {
            tagid: id,
            next_openid: openId || ''
        }

        const url = api.tag.fetchUsers + 'access_token=' + token

        return { method: 'POST', url, body }
    }

    // 批量加标签和取消标签
    batchTag(token, openidList, id, unTag) {
        const body = {
            openid_list: openidList,
            tagid: id
        }

        let url = !unTag ? api.tag.batchTag : api.tag.batchUnTag
        url += 'access_token=' + token

        return { method: 'POST', url, body }
    }

    getUserTags(token, openId) {
        const body = {
            openid: openId
        }

        const url = api.tag.getUserTags + 'access_token=' + token

        return { method: 'POST', url, body }
    }

    // 给用户设置别名 服务号专用接口
    remarkUser(token, openId, remark) {
        const body = {
            openid: openId,
            remark
        }

        const url = api.user.remark + 'access_token=' + token

        return { method: 'POST', url, body }
    }

    // 获取粉丝列表
    fetchUserList(token, openId) {
        const url = api.user.fetch + 'access_token=' + token + '&next_openid=' + (openId || '')

        return { url }
    }

    // 获取用户的详细信息
    getUserInfo(token, openId, lan = 'zh_CN') {
        const url = api.user.info + 'access_token=' + token + '&openid=' + openId + '&lang=' + lan

        return { url }
    }

    // 批量获取用户详细信息
    fetchBatchUsers(token, openIdList) {
        const body = {
            user_list: openIdList
        }

        const url = api.user.batch + 'access_token=' + token;

        return { method: 'POST', url, body }
    }

    // 创建二维码 Ticket
    createQrcode(token, qr) {
        const url = api.qrcode.create + 'access_token=' + token
        const body = qr

        return { method: 'POST', url, body }
    }

    // 通过 Ticket 换取二维码
    showQrcode(ticket) {
        const url = api.qrcode.show + 'ticket=' + encodeURI(ticket)

        return url
    }

    // 长链接转短链接
    createShortUrl(token, action = 'long2short', longurl) {
        const url = api.shortUrl.create + 'access_token=' + token
        const body = {
            action,
            long_url: longurl
        }

        return { method: 'POST', url, body }
    }

    // 语义理解-查询特定的语句进行分析
    semantic(token, semanticData) {
        const url = api.semanticUrl + 'access_token=' + token
        semanticData.appid = this.appID

        return { method: 'POST', url, body: semanticData }
    }

    // AI 接口
    aiTranslate(token, body, lfrom, lto) {
        const url = api.ai.translate + 'access_token=' + token + '&lfrom=' + lfrom + '&lto=' + lto

        return { method: 'POST', url, body }
    }

    // 创建菜单和自定义菜单
    createMenu(token, menu, rules) {
        let url = api.menu.create + 'access_token=' + token

        if (rules) {
            url = api.menu.custom + 'access_token=' + token
            menu.matchrule = rules
        }

        return { method: 'POST', url, body: menu }
    }

    // 删除菜单
    deleteMenu(token) {
        const url = api.menu.del + 'access_token=' + token

        return { url }
    }

    // 获取菜单
    fetchMenu(token) {
        const url = api.menu.fetch + 'access_token=' + token

        return { url }
    }

}