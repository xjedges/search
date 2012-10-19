var JSON=Json();
var data=new Data();
window.onload=main;
// debug({W:500,H:300},main);
function main(){
    //--------------------------------------------- Global
    var windowW;
    var windowH;
    var body=$("body");
    var option=Option({
        language:{
            name:"Language",
            type:"select",
            value:"zh-CN",
            format:[
                {name:"China",value:"zh-CN"},
                {name:"Taiwan",value:"zh-TW"},
                {name:"Hong Kong",value:"zh-HK"},
                {name:"Unite State",value:"en-US"},
                {name:"France",value:"fr-FR"}
            ]
        },
        contentControl:{
            name:"Content Control",
            type:"select",
            value:"Moderate",
            format:[
                {name:"Off",value:"Off"},
                {name:"Moderate",value:"Moderate"},
                {name:"Strict",value:"Strict"}
            ]
        },
        showSpellCorrect:{
            name:"Show Spell Correct",
            type:"checkbox",
            value:true
        },
        showSuggestQuery:{
            name:"Show Suggest Query",
            type:"checkbox",
            value:true
        },
        showPluginSite:{
            name:"Show Plugin Site",
            type:"checkbox",
            value:true
        },
        showSiteIcon:{
            name:"Show Site Icon",
            type:"checkbox",
            value:true
        },
        showRelatedLinks:{
            name:"Show Related Links",
            type:"checkbox",
            value:true
        },
        showPreview:{
            name:"Show Preview",
            type:"checkbox",
            value:true
        },
        displayCount:{
            name:"Display Count",
            type:"text",
            value:10
        },
        previewBlackFilter:{
            name:"Preview Black Filter",
            type:"array",
            value:[]
        }
    });
    var searchHistory=SearchHistory();

    var menu=Menu([
        {
            name:"option",
            index:0,
            panel:option,
        },{
            name:"searchHistory",
            index:1,
            panel:searchHistory,
        }
    ]);

    var previewBlackFilter=UrlFilter(option.get("previewBlackFilter"));
    
    var results=Results();
    var searchBox=SearchBox(option,
        function(){
            searchHistory.insert(this.queryword);
            results.clear();
            
            data.getResult("Web",{Query:this.queryword,$skip:this.offset,$top:this.count,Market:option.get("language"),Adult:option.get("contentControl")},function(data){
                results.setData(data.d.results);
            });
            if(option.get("showRelatedLinks")){
                data.getResult("RelatedSearch",{Query:this.queryword,Market:option.get("language")},function(data){
                    results.setRelatedSearch(data.d.results);
                });
            }
        },function(){
            data.getResult("Web",{$skip:this.count*++this.offset},function(data){
                results.setData(data.d.results);
            });
    });
    var preview=Preview();
    var resultsView=ResultsView()
    if(option.get("showPluginSite")){
        var pluginSite=PluginSite([
            {name:"Baidu Image",url:"http://www.baidu.com/search/error.html#%s",target:"preview"},
            {name:"Bing Image",url:"http://cn.bing.com/images/search?q=%s",target:"preview"},
            {name:"Baidu",url:"http://www.baidu.com/s?wd=%s",target:"preview"},
            {name:"Google",url:"http://www.google.com.hk/search?q=%s",target:"newTab"},
            {name:"My Bing Image",url:"image.html#%s",target:"preview"},
            {name:"My Bing Video",url:"video.html#%s",target:"preview"},
        ]);
        resultsView.append(pluginSite);
    }
    //--------------------------------------------- MainFrame
    body.append(
        menu,
        $("div",{id:"leftFrame"}).append(
            $("div",{id:"topFrame"}).append(
                searchBox
            ),
            resultsView.append(
                results
            )
        ),
        preview
    );
    //--------------------------------------------- FirstInit
    searchBox.init();
    resize();
    window.onresize=resize;
    function resize(){
        windowW=document.documentElement.clientWidth;
        windowH=document.documentElement.clientHeight;
        preview.resize();
        resultsView.resize();
    }
    function ResultsView(){
        var self=$("div",{id:"resultsView"});
        self.resize=function(){
            self.height(document.documentElement.clientHeight-100);
        };
        self.onscroll=function(){
            if(self.scrollTop==self.scrollHeight-self.height())searchBox.gett();
        };
        return self
    }
    //--------------------------------------------- ResultsWrap
    function Results(){
        var self=$("ul",{id:"results"});
        self.setData=function(data){
            var frag=$("frag");
            for(var i in data){
                var result=Result(data[i]);
                frag.append(result);
            }
            self.append(frag);
            self.removeClass("loading");
        };
        self.setRelatedSearch=function(data){
            var relatedSearch=$("ul",{cls:"relatedSearch"});
            for(var i in data){
                var link=$("li",{text:data[i].Title});
                link.onclick=function(){
                    searchBox.get(this.text());
                };
                relatedSearch.append(link);
            }
            self.prepend(relatedSearch);
        };
        self.getData=function(){
            if(!self.hasClass("loading")){
                self.addClass("loading");
                searchBox.gett();
            }
        };
        return self;
    }
    //--------------------------------------------- PluginSite
    function PluginSite(setting){
        var self=$("ul",{id:"pluginSite"});
        for(var i in setting){
            var site=$("li",{text:setting[i].name,name:setting[i].url,target:setting[i].target});
            site.onclick=function(){
                if(this.target=="newTab"){
                    window.open(this.name.replace(/%s/,searchBox.queryword))
                }else{
                    if(this.hasClass("cur")){
                        preview.minimize();
                        this.removeClass("cur");
                    }else{
                        var currentObj=resultsView.find(".cur");
                        currentObj && (currentObj.removeClass("cur"));
                        this.addClass("cur");
                        preview.load(this.name.replace(/%s/,searchBox.queryword));
                    }
                }
            };
            self.append(site);
        }
        return self;
    }
    //--------------------------------------------- Result
    function Result(data){
        var self=$("li",{cls:"result"});
        //SiteIcon
        if(option.get("showSiteIcon")){
            var siteIcon=$("img",{cls:"siteIcon"});
            var siteIconUrl=data.Url.match(/http[s]?:\/\/[^\/]*/).toString()+"/favicon.ico";
            siteIcon.src=siteIconUrl;
            siteIcon.onload = function() {
                self.prepend(siteIcon);
            };
        }
        //Title
        var title=$("h4",{cls:"title",html:highlight(data.Title)});
        self.append(title);
        title.onclick=function(){
            self.addClass("readed");
            window.open(data.Url);
        };
        //Description
        if(data.Description){
            var description=$("p",{cls:"description",html:highlight(data.Description)});
            self.append(description);
        }
        
        //displayUrl & dateTime
        var displayUrl=$("span",{cls:"displayUrl",html:highlight(data.DisplayUrl)});
        displayUrl.onclick=function(){
            self.addClass("readed");
            window.open(data.Url);
        };
        self.append(
            displayUrl
        );
        // PreviewBtn
        if(option.get("showPreview") && previewBlackFilter.match(data.Url)){
            var previewBtn=$("span",{cls:"previewBtn",text:"view"});
            previewBtn.onclick=function(){
                if(self.hasClass("cur")){
                    preview.minimize();
                    self.removeClass("cur");
                }else{
                    var currentObj=resultsView.find(".cur");
                    currentObj && (currentObj.removeClass("cur"));
                    self.addClass("cur readed");
                    preview.load(data.Url);
                }
            };
            self.append(previewBtn);
        }
        function highlight(str){
            str=str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
            return str.replace(/\uE000/g,"<em>").replace(/\uE001/g,"</em>");
        }
        return self;
    }
    //--------------------------------------------- Preview
    function Preview(){
        var self=$("div",{id:"preview"});
        var closeBtn=$("div",{cls:"closeBtn"});
        var maxBtn=$("div",{cls:"maxBtn"});
        var iframe=null;
        var showState=false;
        var previewW;
        var maximizeW;
        self.append(
            closeBtn,
            maxBtn
        );
        maxBtn.onclick=function(){
            if(self.hasClass("max")){
                self.restore();
            }else{
                self.maximize();
            }
        };
        closeBtn.onclick=function(){
            self.minimize();
            var currentObj=results.find(".cur");
            currentObj && (currentObj.removeClass("cur"));
        };
        self.resize=function(){
            previewW=windowW-leftFrame.css("width")-40-10-40;
            maximizeW=windowW-40-40-10-40;
            if(self.hasClass("show")){
                if(self.hasClass("max")){
                    self.maximize();
                }else{
                    self.restore();
                }
            }else{
                self.minimize();
            }
        };
        self.minimize=function(){
            if(iframe)iframe.remove();
            leftFrame.removeClass("hide");
            self.removeClass("show");
            showState=false;
            self.css({width:leftFrame.css("width")-40-10-40});
        };
        self.restore=function(){
            if(!showState){
                self.removeClass("max");
                self.css({width:previewW});
                self.addClass("show");
            }
            leftFrame.removeClass("hide");
        };
        self.maximize=function(){
            leftFrame.addClass("hide");
            self.addClass("max");
            self.css({width:maximizeW});
        };
        self.load=function(urlStr){
            if(iframe)iframe.remove();
            iframe=$("iframe",{cls:"iframe"});
            self.append(iframe);
            self.restore();
            iframe.src=urlStr;
        };
        return self;
    }
}