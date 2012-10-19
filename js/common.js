//--------------------------------------------- Data
function Data(){
    var baseURL="https://api.datamarket.azure.com/Bing/Search/";
    var requestURL=baseURL;
    var head=$("head");
    var API={
        Web:{
            Query:[],
            Options:["EnableHighlighting"],
            Adult:["Moderate"],//Off, Moderate, Strict 
            $top:10,
            $skip:0,
            Market:["zh-CN"],//en-US, fr-FR, zh-CN, zh-HK, zh-TW
            $format:"JSON",
        },
        RelatedSearch:{
            Query:[],
            Market:["zh-CN"],//en-US, fr-FR, zh-CN, zh-HK, zh-TW
            $format:"JSON",
        },
        SpellingSuggestions:{
            Query:[],
            $format:"JSON",
        },
        Image:{
            Query:[],
            Adult:["Moderate"],//Off, Moderate, Strict 
            $top:10,
            $skip:0,
            Market:["zh-CN"],//en-US, fr-FR, zh-CN, zh-HK, zh-TW
            $format:"JSON",
            ImageFilters:[""],
            /*
                Size:[Small,Medium,Large,Width:<val>,Height:<val>]+
                Aspect:[Square,Wide,Tall]+
                Color:[Color,Monochrome]+
                Style:[Photo,Graphics]+
                Face:[Face,Portrait,Other]
            */
        },
        Video:{
            Query:[],
            Adult:["Moderate"],//Off, Moderate, Strict 
            $top:10,
            $skip:0,
            Market:["zh-CN"],//en-US, fr-FR, zh-CN, zh-HK, zh-TW
            $format:"JSON",
            VideoFilters:[""],
            /*
                Duration:[Short,Medium,Long]+
                Aspect:[Standard,Widescreen]+
                Resolution:[Low,Medium,High]
            */
            // VideoSortBy:[""],//Date, Relevance
        },
    };
    this.AutoFill={
        requestURL:"http://api.bing.com/qsonhs.aspx?",
        option:{
            FORM:"ASAPIH",
            cb:"data.AutoFill.success",
            type:"cb",
        },
        success:function(data){this.callback.apply(data)},
        callback:null,
        scriptNode:null,
    };
    
    for(var i in this.AutoFill.option)this.AutoFill.requestURL+=(i+"="+this.AutoFill.option[i]+"&");

    this.getResult=function(sourceTypes,setting,callback){
        if(typeof(sourceTypes)=="string" && !!API[sourceTypes]){
            var option=API[sourceTypes];
            for(var i in setting){
                if(option[i]!=null){
                    if(typeof(option[i])=="object"){
                        option[i][0]=setting[i];
                    }else{
                        option[i]=setting[i];
                    }
                }
            }
            
            requestURL=baseURL;
            requestURL+=sourceTypes+"?";
            for(var i in option){
                if(typeof(option[i])=="object"){
                    requestURL+=i+"=%27"+encodeURIComponent(option[i][0])+"%27"+"&";
                }else{
                    requestURL+=i+"="+option[i]+"&";
                }
            }
            requestURL=requestURL.substring(0,requestURL.length-1);

            var xmlhttp=new XMLHttpRequest();
            xmlhttp.onreadystatechange=function(){
                if(4==xmlhttp.readyState){
                    if(200==xmlhttp.status){
                        eval("var data="+xmlhttp.responseText);
                        callback(data);
                    }else{
                        //alert("error");
                    }
                }
            };
            /*
            ------------------------------------------------------------
            xjedges@hotmail.com qazwsxedc
            /734pV4+D1BSJiEAdR1B6IgmE4BfFEF8/qISI5MXJMM=
            Oi83MzRwVjQrRDFCU0ppRUFkUjFCNklnbUU0QmZGRUY4L3FJU0k1TVhKTU09
            ------------------------------------------------------------
            xj.edges@hotmail.com Bonjur2012
            jOZrd7x1RRmTmTqJLQKHJm2GXtS1s5QPxjleJ3O6l9w=
            OmpPWnJkN3gxUlJtVG1UcUpMUUtISm0yR1h0UzFzNVFQeGpsZUozTzZsOXc9
            ------------------------------------------------------------
            */
            xmlhttp.open("post",requestURL,true); 
            xmlhttp.setRequestHeader('Authorization', 'Basic OmpPWnJkN3gxUlJtVG1UcUpMUUtISm0yR1h0UzFzNVFQeGpsZUozTzZsOXc9');
            xmlhttp.send(null);
        }
    };
    this.getAutoFill=function(queryWord,language,callback){
        if(this.AutoFill.scriptNode){this.AutoFill.scriptNode.remove(); this.AutoFill.scriptNode.scriptNode=null}
        var option=this.AutoFill.option;
        var value=this.AutoFill;

        value.scriptNode=$("script",{src:this.AutoFill.requestURL+"q="+queryWord+"&cp="+queryWord.length+"&mkt="+language});
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
function keyboard(type,event){
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
}
function setTimeFormat(time){
    var second=0,minute=0,hour=0
    if(typeof(time)=="number"){
        second=time%60
        minute=(time-second)/60%60
        hour=(time-second-minute*60)/3600
    }else if(typeof(time)=="string"){
        var timeArr=time.split(":")
        var len=timeArr.length
        timeArr[len-1] && (second=parseInt(timeArr[len-1]))
        timeArr[len-2] && (minute=parseInt(timeArr[len-2]))
        timeArr[len-3] && (hour=parseInt(timeArr[len-3]))
    }
    return  (hour           //hour
                ?hour+":"
                :""
            )+
            (hour           //minute
                ?(minute<10?"0"+minute:minute)+":"
                :minute?minute+":":""
            )+
            ((hour||minute) //second
                ?(second<10?"0"+second:second)
                :second
            )
}
function getTimeFrames(time){
    if(typeof(time)!="string") return;
    var timeArr=time.split(":")
    var frames=0
    var len=timeArr.length
    for(var i=len;i>0;i--){
        var value=parseInt(timeArr[i-1])
        if(i>len-3){
            frames+=value*Math.pow(60,len-i)
        }
    }
    return frames
}