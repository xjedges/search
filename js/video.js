var JSON=Json();
var data=new Data();
// window.onload=main;
debug({W:500,H:300},main);
function main(){
	body=$("body")
	var filters=Filters({
		Duration:{
            name:"Duration",
            type:"select",
            value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"Short",value:"Short"},
                {name:"Medium",value:"Medium"},
                {name:"Long",value:"Long"},
            ]
        },
        Aspect:{
        	name:"Aspect",
            type:"select",
        	value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"Standard",value:"Standard"},
                {name:"Widescreen",value:"Widescreen"},
            ]
        },
        Resolution:{
        	name:"Resolution",
            type:"select",
        	value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"Low",value:"Low"},
                {name:"Medium",value:"Medium"},
                {name:"Hign",value:"Hign"},
            ]
        }
	})
    option=Option({
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
        autoLoadNext:{
            name:"Auto Load Next",
            type:"checkbox",
            value:false
        },
        displayCount:{
            name:"Display Count",
            type:"text",
            value:10
        }
    });
	searchBox=SearchBox(
    	function(){
	        searchHistory.insert(this.queryword);
	        results.clear();
	        loader.start();
	        data.getResult("Video",{Query:this.queryword,VideoFilters:filters.getValue(),$skip:this.offset,$top:this.count,Market:option.get("language"),Adult:option.get("contentControl")},function(data){
	            results.setData(data.d.results)
                loader.end();
	        });
	    },function(){
	    	data.getResult("Video",{$skip:this.count*++this.offset},function(data){
	            results.setData(data.d.results);
                loader.end();
	        });
    	}
    );
    var searchHistory=SearchHistory();
    var menu=Menu([
		{
			name:"filters",
            index:0,
            panel:filters,
		},{
            name:"option",
            index:1,
            panel:option,
        },{
            name:"searchHistory",
            index:2,
            panel:searchHistory,
        }
    ]);
	var results=Gallery(Pic,{picMgnY:20});
    
    var resultsView=ResultsView()
    var loader=Loader();
	body.append(
		menu,
		$("div",{id:"topbar"}).append(
			searchBox
		),
		resultsView.append(
			results,
			loader
		)
	);
    searchBox.init()
    resize();
    window.onresize=resize;
    function resize(){
    	resultsView.resize();
        results.resize();
    }
	function Pic(data){
		var self		= $("li");
		var img			= $("img",{cls:"thumbnail",src:data.Thumbnail.MediaUrl});
		var title		= $("div",{cls:"title",text:data.Title});
		var pad			= 5;
		self.isInDom	= false;//是否添加进DOM
		self.W			= 0;
		self.H			= 0;
		self.radio		= data.Thumbnail.Width/data.Thumbnail.Height;
		self.append(img,title);
		var loadIconTimeHandler=setTimeout(function(){
			var site=data.MediaUrl.match(/\.([\w\d]*)\./,"$1");
			if(site && site[1]){
				var info=$("div",{cls:"info",text:site[1]});
				self.append(info)
			}else{
				var site=data.MediaUrl.match(/\/([\w\d]*)\./,"$1");
				if(site && site[1]){
					var info=$("div",{cls:"info",text:site[1]});
					self.append(info)
				}else{
					var site=data.MediaUrl.match(/\/([\w\d]*)\./,"$1");
				}
			}
		},1000);
		var siteIcon=$("img",{cls:"siteIcon"});
        var siteIconUrl=data.MediaUrl.match(/http[s]?:\/\/[^\/]*/).toString()+"/favicon.ico";
        img.onload = function() {
        	img.addClass("show")
        };
        siteIcon.src=siteIconUrl;
        siteIcon.onload = function() {
        	clearTimeout(loadIconTimeHandler)
            self.append(siteIcon);
        };
		if(data.RunTime!="0"){
			var time=setTimeFormat(Math.floor(parseInt(data.RunTime)/1000));
			var runTime=$("div",{cls:"runTime",text:time});
			self.append(runTime);
		}
		self.css({padding:pad});
		self.onclick=function(){
			window.open(data.MediaUrl);
		};
		self.setWH=function(w,h){
			self.W=w;
			self.H=h;
			self.css({width:w-pad*2});
			img.css({width:w-pad*2,height:h-pad*2});
		};
		self.setXY=function(x,y){
			self.css({top:y,left:x});
		};
		return self;
	};
};