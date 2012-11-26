var JSON=Json();
var data=new Data();
// window.onload=main;
debug({W:200,H:300},main);
function main(){
	body=$("body")
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
	        data.getResult("Image",{Query:this.queryword,ImageFilters:filters.getValue(),$skip:this.offset,$top:this.count,Market:option.get("language"),Adult:option.get("contentControl")},function(data){
	            results.setData(data.d.results);
                loader.end();
	        });
	    },function(){
	    	data.getResult("Image",{$skip:this.count*++this.offset},function(data){
	            results.setData(data.d.results);
                loader.end();
	    	});
    	}
    );
	var filters=Filters({
		Color:{
            name:"Color",
            type:"select",
            value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"Color",value:"Color"},
                {name:"Mono",value:"Monochrome"},
            ]
        },
        Size:{
        	name:"Size",
            type:"select",
        	value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"XL",value:"Small"},
                {name:"XXL",value:"Medium"},
                {name:"XXXL",value:"Large"},
            ]
        },
        Aspect:{
        	name:"Aspect",
            type:"select",
        	value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"Square",value:"Square"},
                {name:"Wide",value:"Wide"},
                {name:"Tall",value:"Tall"},
            ]
        },
        Style:{
        	name:"Style",
            type:"select",
        	value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"Photo",value:"Photo"},
                {name:"Graphics",value:"Graphics"},
            ]
        },
        Face:{
        	name:"Face",
            type:"select",
        	value:"All",
            format:[
                {name:"All",value:"All"},
                {name:"Face",value:"Face"},
                {name:"Portrait",value:"Portrait"},
                {name:"Other",value:"Graphics"},
            ]
        }
	})
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
	var results=Gallery(Pic);
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
		//-------------------------------------------------------------- 变量
		var self		= $("li");
		var img			= $("img",{src:data.Thumbnail.MediaUrl});
		var imgB		= null;
		var title		= null;
		var info		= null;
		var pad			= 5;
		var handlerShow	= null;//监听定时显示事件
		var handlerHide	= null;//监听定时隐藏事件
		var detailState	= false;
		self.isInDom	= false;//是否添加进DOM
		self.W			= 0;
		self.H			= 0;
		self.radio		= data.Width/data.Height;
		//-------------------------------------------------------------- 初始
		self.append(img);
		self.css({padding:pad});
		//-------------------------------------------------------------- 事件
		self.onmouseover=function(){
			window.clearTimeout(handlerHide);
			handlerShow=window.setTimeout(function(){
				if(results.curPic){results.curPic.restore()};		//还原前一个大图
				results.curPic=self;								//注册为当前大图
				self.magnify();										//显示大图
			},500);
			
		};
		self.onmouseout=function(){
			window.clearTimeout(handlerShow);
			handlerHide=window.setTimeout(function(){
				self.restore();										//还原大图
			},2000);
		};
		self.onclick=function(){
			window.open(data.SourceUrl);
		};
		//-------------------------------------------------------------- 方法
		self.detail=function(){
			imgB=$("img",{src:data.MediaUrl});
			info=$("div",{cls:"info",text:data.Width+"*"+data.Height+" "+data.ContentType});
			title=$("div",{cls:"title",text:data.Title});
			imgB.css({width:self.W*2-pad*2,height:self.H*2-pad*2,position:"absolute",top:pad,left:pad});
			self.append(imgB,info,title);
		};
		self.magnify=function(){
			if(!detailState){
				detailState=true;
				self.detail();
			}
			var x=self.offsetLeft;
			var y=self.offsetTop;
			var offsetX=-(self.W-pad)/2;
			var offsetY=-(self.H-pad)/2;
			var boundaryW=self.parent().width()
			var boundaryH=self.parent().height()
			var threshold=10;
			
			if((x+offsetX)<0){offsetX=threshold}
			else if((x+self.W-offsetX)>(boundaryW)){offsetX=-self.W-threshold};
			
			if((y+offsetY)<0){offsetY=threshold}
			else if((y+self.H-offsetY)>(boundaryH)){offsetY=-self.H};
			
			self.css({width:self.W*2-pad*2,margin:[offsetY,0,0,offsetX]});
			img.css({width:self.W*2-pad*2,height:self.H*2-pad*2});
			self.addClass("magnify");
			title.show();
			info.show();
			imgB.show();
			
		};
		self.restore=function(){
			self.css({width:self.W-pad*2,margin:0});
			img.css({width:self.W-pad*2,height:self.H-pad*2});
			self.removeClass("magnify")
			if(detailState){
				title.hide();
				info.hide();
				imgB.hide();
			};
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