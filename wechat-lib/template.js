const ejs = require('ejs');

const tpl = `
    <xml>
        <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
        <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
        <CreateTime><%= createTime %></CreateTime>
        <% if(msgType === 'text') { %>
            <MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[<%- content %>]]></Content>
        <% } else if(msgType === 'image') { %>
            <Image>
                <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
            </Image>
        <% } else if(msgType === 'voice') { %>
            <Voice>
                <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
            </Voice>
        <% } else if(msgType === 'video') { %>
            <Video>
                <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
                <Title><![CDATA[<%= content.title %>]]></Title>
                <Description><![CDATA[<%= content.description %>]]></Description>
            </Video>
        <% } else if(msgType === 'music') { %>
            <Video>
                <Title><![CDATA[<%= content.title %>]]></Title>
                <Description><![CDATA[<%= content.description %>]]></Description>
                <MusicUrl><![CDATA[<%= content.musicUrl %>]]></MusicUrl>
                <HQMusicUrl><![CDATA[<%= content.hqMusicUrl %>]]></HQMusicUrl>
                <ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
            </Video>
        <% } else if(msgType === 'news') { %>
            <ArticleCount><![CDATA[<%= content.length %>]]></ArticleCount>
            <Articles>
                <% content.forEach(function(item){ %>
                    <item>
                        <Title><![CDATA[<%= content.title %>]]></Title>
                        <Description><![CDATA[<%= content.description %>]]></Description>
                        <PicUrl><![CDATA[<%= content.picUrl %>]]></PicUrl>
                        <Url><![CDATA[<%= item.url %>]]></Url>
                    </item>
                <% })%>
            </Articles>
        <% } %>
    </xml>`;

const compiled = ejs.compile(tpl);

module.exports = compiled;