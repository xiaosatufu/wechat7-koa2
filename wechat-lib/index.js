var fs = require('fs');
const request = require('request-promise');

const base = 'https://api.weixin.qq.com/cgi-bin/';

const api = {
    accessToken: base + 'token?grant_type=client_credential',
    temporary: {
        upload: base + 'media/upload?'
    }
}

module.exports = class Wechat {
    constructor(opts) {
        this.opts = Object.assign({}, opts);
        this.appID = opts.appID;
        this.appSecret = opts.appSecret;
        this.getAccessToken = opts.getAccessToken;
        this.saveAccessToken = opts.saveAccessToken;


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

        if (!this.isValidToken(data)) {
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

    isValidToken(data) {
        if (!data || !data.expires_in) {
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
        let url = api.temporary.upload

        if (permanent) {
            // url = api.p
        }

        console.log('material');
        console.log(material);

        // material是个文件路径
        form.media = fs.createReadStream(material);
        // form.media = fs.readFileSync(material);

        let uploadUrl = `${url}access_token=${token}&type=${type}`

        const options = {
            methods: 'POST',
            url: uploadUrl,
            json: true,
            formData: form
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
}