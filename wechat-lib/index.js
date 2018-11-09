const request = require('request-promise');

const base = 'https://api.weixin.qq.com/cgi-bin/';

const api = {
    accessToken: base + 'token?grant_type=client_credential'
}

module.exports = class Wechat{
    constructor(opts){
        
        this.opts = Object.assign({},opts);
        this.appID = opts.appID;
        this.appSecret = opts.appSecret;

        this.fetchAccessToken();
    }
    
    async request (options){
        options = Object.assign({},options,{json:true})

        try {
            const res = await request(options);

            return res
        } catch (error) {
            console.log(err);
        }
    }

    async fetchAccessToken(){
        let data

        if (this.getAccessToken) {
            data = await this.getAccessToken();
        }

        if (!this.isValidToken(data)) {
            data = await this.updateAccessToken();
        }
    }

    async updateAccessToken(){
        const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;

        const data = await this.request({url});
        const now = new Date().getTime();
        const expiresIn = now + (data.expires_in - 20) * 1000;

        data.expires_in = expiresIn;
        
        console.log('data');
        console.log(data);

        
        return data
    }

    isValidToken(data){
        if (!data || !data.expires_in) {
            return false
        }

        const expiresIn = data.expires_in;
        const now = new Date().getTime();

        if (now < expiresIn) {
            return true
        }else{
            return false
        }
    }
}