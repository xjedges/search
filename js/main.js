window.onload=main;
// debug({W:500,H:300});
function main(){
    //--------------------------------------------- Global
    var JSON=Json();
    var keyboard=KeyBoard();
    var windowW;
    var windowH;

    var optionSetting={
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
        showDeepLinks:{
            name:"Show Deep Links",
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
            // value:[
            //     "douban",
            //     "www.verycd",
            //     "aspxhome",
            //     "hi.baidu",
            //     "stackoverflow",
            //     "xker"
            // ]
        }
    };
    var menu=Menu();

    data=new Data();
    var previewBlackFilter=UrlFilter(option.get("previewBlackFilter"));
    
    var body=$("body");
    var results=Results();
    var searchBox=SearchBox();
    var preview=Preview();
    var leftFrame=$("div",{id:"leftFrame"});
    var topFrame=$("div",{id:"topFrame"});
 
    //--------------------------------------------- MainFrame
    body.append(
        menu,
        leftFrame.append(
            topFrame.append(
                searchBox
            ),
            results
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
        results.resize();
    }
    function Menu(){
        var self=$("div",{id:"menu"});
        option=Option(optionSetting);
        searchHistory=SearchHistory();
        self.append(
            option,
            searchHistory
        );
        option.tabBtn.onclick=function(){
            if(option.hasClass("show") && self.hasClass("show")){
                self.removeClass("show");
                option.removeClass("show");
            }else if(!option.hasClass("show") && self.hasClass("show")){
                option.showPanel();
                searchHistory.hidePanel();
            }else{
                self.addClass("show");
                option.showPanel();
            }
        };
        searchHistory.tabBtn.onclick=function(){
            if(searchHistory.hasClass("show") && self.hasClass("show")){
                self.removeClass("show");
                searchHistory.removeClass("show");
            }else if(!searchHistory.hasClass("show") && self.hasClass("show")){
                searchHistory.showPanel();
                option.hidePanel();
            }
            else{
                self.addClass("show");
                searchHistory.showPanel();
            }
        };

        return self;
    }
    function SearchHistory(){
        var self=$("div",{cls:"searchHistory tabPanel"});
        var panel=$("div",{cls:"panel"});
        self.tabBtn=$("div",{cls:"tabBtn"});
        var historyList=$("ul",{cls:"historyList"});
        self.append(self.tabBtn,panel.append(historyList));
        self.insert=function(queryWord){
            var li=$("li",{text:queryWord});
            li.onclick=function(){
                searchBox.get(this.text());
                this.remove();
            };
            historyList.append(li);
        };
        self.showPanel=function(){
            self.addClass("show");
        };
        self.hidePanel=function(){
            self.removeClass("show");
        };
        return self;
    }
    //--------------------------------------------- Option
    function Option(setting){
        var self=$("div",{cls:"option tabPanel"});
        var panel=$("div",{cls:"panel"});
        self.tabBtn=$("div",{cls:"tabBtn"});
        self.append(self.tabBtn,panel);
        var data=JSON.parse(window.localStorage.getItem("option")) || {};
        var initState=false;
        var UI={};
        for(var i in setting){
            data[i]=typeof(setting[i].value)==typeof(data[i])?data[i]:setting[i].value;
        }
        self.get=function(attr){
            return data[attr];
        };
        self.set=function(attr,value){
            if(data[attr]!=null && typeof(value)==typeof(data[attr])){
                data[attr]=value;
                UI[attr].setValue(value);
            }
        };
        function saveData(){
            // DD("saved")
            for(var i in UI){
                data[UI[i].id]=UI[i].getValue();
            }
            // JJ(data)
            window.localStorage.setItem("option",JSON.stringify(data));
            window.location.reload();
        }
        self.showPanel=function(){
            if(!initState){
                initState=true;
                var saveBtn=$("div",{id:"saveBtn",text:"Save"});
                for(var i in setting){
                    var item=Item(i,setting[i].name,setting[i].type,data[i],setting[i].format);
                    UI[i]=item;
                    panel.append(item);
                }
                saveBtn.onclick=function(){
                    saveData();
                };
                panel.append(saveBtn);
                self.addClass("show");
            }else{
                self.addClass("show");
            }
        };
        self.hidePanel=function(){
            self.removeClass("show");
        };

        function Item(id,name,type,value,format){
            var self=$("div",{id:id,cls:"opt "+type,text:name});
            self.id=id;
            var input;
            switch(type){
                case "checkbox":input=$("input",{type:type,checked:value}); break;
                case "text":input=$("input",{type:type,value:value}); break;
                case "array":input=Filter(value);break;
                case "select":input=Select(value,format);break;
            }
            self.getValue=function(){
                switch(type){
                    case "checkbox":return (typeof(value)=="number")?parseInt(input.checked):input.checked;
                    case "text":return (typeof(value)=="number")?parseInt(input.value):input.value;
                    case "array":return input.getValue();
                    case "select":return input.value;
                }
            };
            self.setValue=function(value){
                switch(type){
                    case "checkbox":input.checked=value;break;
                    case "text":input.value=value;break;
                    case "array":input.setValue(value);break;
                    case "select":input.value=value;break;//issus
                }
            };
            self.append(input);
            return self;
        }
        function Select(value,format){
            var self=$("select");
            for(var i in format){
                var opt=$("option",{html:format[i].name,value:format[i].value});
                if(value==format[i].value)opt.selected=true;
                self.append(opt);
            }
            return self;
        }
        function Filter(setting){
            var self=$("div",{cls:"filter"});
            var wrap=$("div",{cls:"wrap"});
            var filters=$("ul");
            var addBtn=$("div",{cls:"addBtn",text:"Add Filter"});
            for(var i in setting){
                var list=List(setting[i]);
                filters.append(list);
            }
            self.append(
                wrap.append(
                    filters
                ),
                addBtn
            );
            addBtn.onclick=function(){
                var list=List("");
                filters.append(list);
                list.input.focus();
            };
            self.getValue=function(){
                var valueArr=[];
                filters.each(function(){
                    valueArr.push(this.input.value);
                });
                return valueArr;
            };
            self.setValue=function(setting){
                filters.clear();
                for(var i in setting){
                    var list=List(setting[i]);
                    filters.append(list);
                }
            };
            function List(value){
                var self=$("li");
                self.input=$("input",{type:"text",value:value});
                var deleteBtn=$("div",{cls:"deleteBtn",text:"X"});
                self.input.onfocus=function(){
                    this.parent().addClass("active");
                };
                self.input.onblur=function(){
                    this.parent().removeClass("active");
                    if(this.value=="")this.parent().remove();
                };
                deleteBtn.onclick=function(){
                    this.parent().remove();
                };
                self.append(
                    self.input,
                    deleteBtn
                );
                return self;
            }
            return self;
        }
        return self;
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
        self.resize=function(){
            self.height(document.documentElement.clientHeight-100);
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
        self.onscroll=function(){
            if(self.scrollTop==self.scrollHeight-self.height())searchBox.gett();
        };
        self.getData=function(){
            if(!self.hasClass("loading")){
                self.addClass("loading");
                searchBox.gett();
            }
        };
        return self;
    }
    //--------------------------------------------- SearchBox
    function SearchBox(){
        var self=$("div",{id:"searchBox"});
        var queryInput=$("input",{cls:"queryInput"});
        var queryBtn=$("div",{cls:"queryBtn",text:"Search"});
        var suggestBox=$("ul",{cls:"suggestBox"});
        var spell=$("span",{cls:"spell"});
        var count=option.get("displayCount");
        var offset=0;
        var handle;
        var domain;
        self.curQueryWord="";
        self.append(queryInput,queryBtn,spell,suggestBox);
        queryBtn.onclick=function(){
            self.get(queryInput.value);
        };
        spell.onclick=function(){
            self.get(this.text());
        };
        queryInput.onkeyup=function(e){
            clearTimeout(handle);
            if(keyboard.is("Enter",e)){
                suggestBox.removeClass("show");
                self.get(queryInput.value);
                window.location=domain+queryInput.value;
            }else if(option.get("showSuggestQuery")){
                if(
                    keyboard.is("Number",e) || 
                    keyboard.is("Character",e) || 
                    keyboard.is("BackSpace",e)  || 
                    keyboard.is("Spacebar",e) ){
                    
                    suggestBox.clear();
                    handle=setTimeout(function(){
                        var finalQueryWord=transfer(queryInput.value);
                        data.getAutoFill(finalQueryWord,function(){
                            if(this.AS.Query==finalQueryWord && this.AS.FullResults>0){
                                var data=this.AS.Results[0].Suggests;
                                for(var i in data){
                                    var li=$("li",{text:data[i].Txt});
                                    li.onclick=function(){
                                        self.get(this.text());
                                        suggestBox.clear();
                                    };
                                    suggestBox.append(li);
                                }
                            }
                        });
                    },200);
                }else if(keyboard.is("Down",e)){
                    if(suggestBox.hasClass("show") && suggestBox.child().length>0){
                        var curObj=suggestBox.find(".cur");
                        if(curObj){
                            curObj.removeClass("cur");
                            curObj=curObj.next();
                            if(curObj){
                                curObj.addClass("cur");
                            }else{
                                curObj=suggestBox.child(0).addClass("cur");
                            }
                        }else{
                            curObj=suggestBox.child(0).addClass("cur");
                        }
                        queryInput.value=curObj.text();
                    } 
                }else if(keyboard.is("Up",e)){
                    if(suggestBox.hasClass("show") && suggestBox.child().length>0){
                        var curObj=suggestBox.find(".cur");
                        if(curObj){
                            curObj.removeClass("cur");
                            curObj=curObj.prev();
                            if(curObj){
                                curObj.addClass("cur");
                            }else{
                                curObj=suggestBox.child(suggestBox.child().length-1).addClass("cur");
                            }
                        }else{
                            curObj=suggestBox.child(suggestBox.child().length-1).addClass("cur");
                        }
                        queryInput.value=curObj.text();
                    }
                }
            }
        };
        queryInput.onfocus=function(){
            suggestBox.addClass("show");
        };
        queryInput.onblur=function(){
            suggestBox.removeClass("show");
        };
        self.init=function(){
            var index=location.href.search("#");
            if(index<0){
                domain=location.href+"#";
            }else{
                domain=location.href.substring(0,index+1);
                searchBox.get(location.href.substring(index+1));
            }
        };
        self.get=function(queryWord){
            if(queryWord!="" && queryWord!=self.curQueryWord){

                window.location=domain+queryWord;
                self.curQueryWord=queryWord;
                searchHistory.insert(queryWord);
                var finalQueryWord=transfer(queryWord);

                results.clear();
                if(option.get("showPluginSite")){
                    var pluginSite=PluginSite([
                        {name:"Baidu Image",url:"http://www.baidu.com/search/error.html#%s"},
                        {name:"Bing Image",url:"http://cn.bing.com/images/search?q=%s"},
                        {name:"Baidu",url:"http://www.baidu.com/s?wd=%s"}
                    ]);
                    results.append(pluginSite);
                }
                data.getResult("WebSource",{Query:finalQueryWord,"Web.Count":count,"Web.Offset":0},function(){
                    offset++;
                    queryInput.value=this.SearchResponse.Query.SearchTerms;
                    results.setData(this.SearchResponse.Web.Results);
                });
                if(option.get("showRelatedLinks")){
                    data.getResult("RelatedSearchSource",{Query:finalQueryWord},function(){
                        results.setRelatedSearch(this.SearchResponse.RelatedSearch && this.SearchResponse.RelatedSearch.Results);
                    });
                }
                if(option.get("showSpellCorrect")){
                    data.getResult("Spell",{Query:finalQueryWord},function(){
                        if(this.SearchResponse.Spell){
                            spell.html(this.SearchResponse.Spell.Results[0].Value);
                            spell.addClass("show");
                        }else{
                            spell.removeClass("show");
                        }
                    });
                }
            }
        };
        self.gett=function(){
            data.getResult("WebSource",{"Web.Offset":count*offset},function(){
                offset++;
                results.setData(this.SearchResponse.Web.Results);
            });
        };
        function transfer(queryword){
            return queryword.replace(/\+/g,"%2B")
                            /*.replace(/:/g,"%3A")
                            .replace(/\//g,"%2F")
                            .replace(/,/g,"%2C")
                            .replace(/=/g,"%3D")
                            .replace(/\?/g,"%3F")
                            .replace(/\@/g,"%40")
                            .replace(/\$/g,"%24")
                            .replace(/%/g,"%25")
                            .replace(/&/g,"%26")*/
                            .replace(/#/g,"%23")
                            .replace(/\s/g,"+");
        }
        return self;
    }
    //--------------------------------------------- PluginSite
    function PluginSite(setting){
        var self=$("ul",{id:"pluginSite"});
        for(var i in setting){
            var site=$("li",{text:setting[i].name,name:setting[i].url});
            site.onclick=function(){
                if(this.hasClass("cur")){
                    preview.minimize();
                    this.removeClass("cur");
                }else{
                    var currentObj=results.find(".cur");
                    currentObj && (currentObj.removeClass("cur"));
                    this.addClass("cur");
                    preview.load(this.name.replace(/%s/,searchBox.curQueryWord));
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
        //DeepLinks
        if(option.get("showDeepLinks") && data.DeepLinks){
            var deepLinks=$("ul",{cls:"deepLinks"});
            for(var i in data.DeepLinks){
                var link=$("li",{text:data.DeepLinks[i].Title});
                link.onclick=function(){window.open(data.DeepLinks[i].Url)};
                deepLinks.append(link);
            }
            self.append(deepLinks);
        }
        
        //displayUrl & dateTime
        var dateTime=$("span",{cls:"dateTime",html:data.DateTime.match(/[\d-]*/)});
        var displayUrl=$("span",{cls:"displayUrl",html:highlight(data.DisplayUrl)});
        displayUrl.onclick=function(){
            self.addClass("readed");
            window.open(data.Url);
        };
        self.append(
            displayUrl,
            dateTime
        );
        // PreviewBtn
        if(option.get("showPreview") && previewBlackFilter.match(data.Url)){
            var previewBtn=$("span",{cls:"previewBtn",text:"view"});
            previewBtn.onclick=function(){
                if(self.hasClass("cur")){
                    preview.minimize();
                    self.removeClass("cur");
                }else{
                    var currentObj=results.find(".cur");
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
    //--------------------------------------------- Data
    function Data(){
        var requestURL="";
        var baseURL="http://api.search.live.net/json.aspx?";
        var head=$("head");
        this.API={
            Constants:{
                AppId:"A545D5D8EBA2DF8ACE9B33DCACAEEE0B1CBFD9B2",
                Version:"2.2",
                Market:option.get("language"),
                JsonType:"callback",
                Options:"EnableHighlighting",
            },
            WebSource:{
                option:{
                    Query:"",
                    Sources:"Web",
                    "Web.Count":10,
                    "Web.Offset":0,
                    JsonCallback:"data.API.WebSource.success",
                },
                success:function(data){this.scriptNode.remove();this.callback.apply(data)},
                callback:null,
                scriptNode:null,
            },
            RelatedSearchSource:{
                option:{
                    Query:"",
                    Sources:"RelatedSearch",
                    JsonCallback:"data.API.RelatedSearchSource.success",
                },
                success:function(data){this.scriptNode.remove();this.callback.apply(data)},
                callback:null,
                scriptNode:null,
            },
            Spell:{
                option:{
                    Query:"",
                    Sources:"Spell",
                    JsonCallback:"data.API.Spell.success",
                },
                success:function(data){this.scriptNode.remove();this.callback.apply(data)},
                callback:null,
                scriptNode:null,
            },
        };
        this.AutoFill={
            //http://sg1.api.bing.com/qsonhs.aspx?
            requestURL:"http://api.bing.com/qsonhs.aspx?",
            option:{
                FORM:"ASAPIH",
                cb:"data.AutoFill.success",
                mkt:option.get("language"),
                // o:(option.get("language")=="en-US")?"p+l+a+fs+h":"p+a",
                type:"cb",
            },
            success:function(data){this.callback.apply(data)},
            callback:null,
            scriptNode:null,
        };
        
        for(var i in this.AutoFill.option)this.AutoFill.requestURL+=(i+"="+this.AutoFill.option[i]+"&");

        this.getResult=function(sourceTypes,setting,callback){
            if(typeof(sourceTypes)=="string" && !!this.API[sourceTypes]){
                var option=this.API[sourceTypes].option;
                var value=this.API[sourceTypes];
                for(var i in setting)
                    if(option[i]!=null)
                        option[i]=setting[i];

                requestURL=baseURL;
                for(var i in this.API.Constants)requestURL+=(i+"="+this.API.Constants[i]+"&");
                for(var i in option)requestURL+=(i+"="+option[i]+"&");

                value.scriptNode=$("script",{src:requestURL});
                value.callback=callback;
                head.append(value.scriptNode);
            }
        };
        this.getAutoFill=function(queryWord,callback){
            if(this.AutoFill.scriptNode){this.AutoFill.scriptNode.remove(); this.AutoFill.scriptNode.scriptNode=null}
            var option=this.AutoFill.option;
            var value=this.AutoFill;

            value.scriptNode=$("script",{src:this.AutoFill.requestURL+"q="+queryWord+"&cp="+queryWord.length});
            value.callback=callback;
            head.append(value.scriptNode);
        };
    }
    //--------------------------------------------- UrlFilter
    function UrlFilter(list){
        var filterStr="";
        for(var i in list){
            filterStr+=list[i].replace(/([\.\/])/g,"\\$1")+(i==list.length-1?"":"|");
        }
        var filter=new RegExp(filterStr);
        this.match=function(url){
            var domain=url.match(/\/\/[^\/]*/).toString();
            if(domain.search(filter)>0)return false;
            return true;
        };
        return this;
    }
    //--------------------------------------------- Json
    function Json(){
        this.stringify=function(obj){
            switch(typeof obj){   
                case 'string':   
                    return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';   
                case 'array':   
                    return '[' + obj.map(this.stringify).join(',') + ']';   
                case 'object':   
                     if(obj instanceof Array||obj.constructor.toString().match(/function\sArray\(/)){   
                        var strArr = [];   
                        var len = obj.length;   
                        for(var i=0; i<len; i++){   
                            strArr.push(this.stringify(obj[i]));   
                        }   
                        return '[' + strArr.join(',') + ']';   
                    }else if(obj.constructor=="Table"){
                        return '{constructor:"Table"}';
                    }
                    else if(obj==null){   
                        return 'null';  
                    }else{   
                        var string = [];   
                        for (var property in obj) string.push(this.stringify(property) + ':' + self.stringify(obj[property]));   
                        return '{' + string.join(',') + '}';   
                    }   
                case 'number':   
                    return obj;   
                case'boolean':
                    return new Boolean(obj);
                case false:   
                    return obj;   
            }   
        };
        this.parse=function(str){
            return eval('(' + str + ')');   
        };
        return this;
    }
    //--------------------------------------------- Keyboard
    function KeyBoard(){
        this.is=function(type,event){
            var keycode=event.keyCode;
            switch(type){
                case "Number":if(keycode>=48 && keycode<=57)return true;break;
                case "Character":if(keycode>=65 && keycode<=90)return true;break;
                case "Enter":if(keycode==13)return true;break;
                case "Left":if(keycode==37)return true;break;
                case "Right":if(keycode==27)return true;break;
                case "Down":if(keycode==40)return true;break;
                case "Up":if(keycode==38)return true;break;
                case "BackSpace":if(keycode==8)return true;break;
                case "Spacebar":if(keycode==32)return true;break;
            }
        };
        return this;
    }
}