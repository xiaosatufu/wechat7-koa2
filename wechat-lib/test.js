var fs = require('fs');

var path = 'E:/myProject/wechat7-koa2/img.jpg';

var media = fs.createReadStream(path);

media.on('data',function () {
    console.log(media);
})

console.log(123);