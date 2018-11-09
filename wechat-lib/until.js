const xml2js = require('xml2js');
const template = require('./template');

exports.parseXML = (xml) => {
    return new Promise((resolve,reject) => {
        xml2js.parseString(xml,{trim:true},(error,content) => {
            if(error){
                reject(err);
            }else{
                resolve(content);
            }
        })
    })
}

exports.formatMessage = (result) => {
    let message = {};
    // console.log(result);

    if (typeof result === 'object') {
        const keys = Object.keys(result);

        // console.log('keys');
        // console.log(keys);

        for (let i = 0; i < keys.length; i++) {
            let item = result[keys[i]];
            let key = keys[i];

            if (!(item instanceof Array) || item.length === 0) {
                continue
            }

            if (item.length === 1) {
                let val = item[0];

                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                }else{
                    message[key] = ( val || '').trim();
                }
            }else{
                message[key] = [];

                for (let i = 0; i < item.length; i++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }

    return message
}

exports.tpl = (content,message) => {
    let type = 'text';

    if (Array.isArray(content)) {
        type = 'news';
    }

    if (!content) {
        content = 'Empty News';
    }

    if (!content) {
        type = content.type;
    }

    let info = Object.assign({},{
        content: content,
        msgType: type,
        createTime: new Date().getTime(),
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName
    })

    return template(info); 
}


