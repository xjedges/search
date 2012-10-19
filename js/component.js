//--------------------------------------------- Menu
function Menu(subMenus){
    var self=$("div",{id:"menu"});
    var curIndex=-1;

    for(var i in subMenus){
        subMenus[i].panel=TabView(subMenus[i])
        subMenus[i].panel.tab.menuInfo=subMenus[i]

        subMenus[i].panel.tab.onclick=function(e){
            var panel=e.target.menuInfo.panel
            var index=e.target.menuInfo.index
            if(curIndex==-1){
                self.addClass("show");
                panel.showPanel()
                curIndex=index
            }else if(curIndex==index){
                self.removeClass("show");
                panel.hidePanel()
                curIndex=-1
            }else{
                subMenus[curIndex].panel.hidePanel()
                curIndex=index
                subMenus[curIndex].panel.showPanel()
            }
        }
        self.append(subMenus[i].panel)
    }
    function TabView(menuSetting){
        var panel=menuSetting.panel
        panel.addClass("panel")
        var self=$("div",{cls:menuSetting.name+" tabPanel"});
        self.tab=$("div",{cls:"tabBtn"});
        self.append(self.tab,panel);
        self.showPanel=function(){
            self.addClass("show");
            if(panel.init){panel.init(); panel.init=null}
            if(panel.onShow){panel.onShow()}
        };
        self.hidePanel=function(){
            self.removeClass("show");
            if(panel.onHide){panel.onHide()}
        };
        return self
    }

    return self;
}
//--------------------------------------------- SearchHistory
function SearchHistory(){
    var self=$("div");
    var historyList=$("ul",{cls:"historyList"});
    self.append(historyList);
    self.insert=function(queryWord){
        var li=$("li",{text:queryWord});
        li.onclick=function(){
            searchBox.get(this.text());
            this.remove();
        };
        historyList.append(li);
    };
    return self;
}
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

//--------------------------------------------- Option
function Option(setting){
    var self=$("div");
    var data=JSON.parse(window.localStorage.getItem("option")) || {};
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
    self.init=function(){
        var saveBtn=$("div",{id:"saveBtn",text:"Save"});
        for(var i in setting){
            var item=Item(i,setting[i].name,setting[i].type,data[i],setting[i].format);
            UI[i]=item;
            self.append(item);
        }
        saveBtn.onclick=function(){
            saveData();
        };
        self.append(saveBtn);
    };
    return self;
}
//--------------------------------------------- SearchBox
function SearchBox(option,callback,callback1){
    var self=$("div",{id:"searchBox"});
    var queryInput=$("input",{cls:"queryInput"});
    var queryBtn=$("div",{cls:"queryBtn",text:"Search"});
    var suggestBox=$("ul",{cls:"suggestBox"});
    var spell=$("span",{cls:"spell"});
    self.count=option.get("displayCount");
    self.offset=0;
    var handle;
    var domain;
    self.append(queryInput,queryBtn,spell,suggestBox);
    queryBtn.onclick=function(){
        self.get(queryInput.value);
    };
    spell.onclick=function(){
        self.get(this.text());
    };
    queryInput.onkeyup=function(e){
        clearTimeout(handle);
        if(keyboard("Enter",e)){
            suggestBox.removeClass("show");
            self.get(queryInput.value);
            window.location=domain+queryInput.value;
        }else if(option.get("showSuggestQuery")){
            if(
                keyboard("Number",e) || 
                keyboard("Character",e) || 
                keyboard("BackSpace",e)  || 
                keyboard("Spacebar",e) ){
                
                suggestBox.clear();
                handle=setTimeout(function(){
                    data.getAutoFill(queryInput.value,option.get("language"),function(){
                        if(this.AS.Query==queryInput.value && this.AS.FullResults>0){
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
            }else if(keyboard("Down",e)){
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
            }else if(keyboard("Up",e)){
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
            self.get(decodeURIComponent(location.href.substring(index+1)));
            queryInput.value=decodeURIComponent(location.href.substring(index+1));
        }
    };
    self.get=function(queryWord){
        if(queryWord!=""){

            window.location=domain+queryWord;
            self.queryword=queryWord;
            self.offset=0;
            callback.apply(self);

            if(option.get("showSpellCorrect")){
                data.getResult("SpellingSuggestions",{Query:queryWord},function(data){
                    if(data.d.results.length>0){
                        spell.html(data.d.results[0].Value);
                        spell.addClass("show");
                    }else{
                        spell.removeClass("show");
                    }
                });
            }
        }
    };
    self.gett=function(){
        callback1.apply(self);
    };
    return self;
}