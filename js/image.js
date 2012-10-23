var JSON=Json();
var data=new Data();
window.onload=main;
// debug({W:500,H:300},main);
function main(){
	var body=$("body")
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
        displayCount:{
            name:"Display Count",
            type:"text",
            value:10
        }
    });
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
	var results=Results();
    var searchBox=SearchBox(option,
    	function(){
	        searchHistory.insert(this.queryword);
	        results.clear();
	        
	        data.getResult("Image",{Query:this.queryword,ImageFilters:filters.getValue(),$skip:this.offset,$top:this.count,Market:option.get("language"),Adult:option.get("contentControl")},function(data){
	            results.setData(data.d.results)
	        });
	    },function(){
	    	data.getResult("Image",{$skip:this.count*++this.offset},function(data){
	            results.setData(data.d.results);
	        });
    });
	body.append(
		menu,
		$("div",{id:"topbar"}).append(
			searchBox
		),
		results
	);
    searchBox.init()
	function Results(){
		//-------------------------------------------------------------- 变量
		var self		= $("ul",{id:"gallery"});
		var pad			= 10;
		var mgn			= 50;
		var picMgnX		= 10;
		var picMgnY		= 10;
		var accumulateX	= pad;
		var accumulateY	= pad;
		var W			= document.documentElement.clientWidth-pad*2-mgn;
		var H			= document.documentElement.clientHeight-pad*2-mgn;
		var num			= Math.floor(W/180);
		var row			= Math.floor(H/140);
		var loading		= false;
		var picsAll		= [];//全部图片对象
		var picsDo		= [];//正处理图片对象
		var picsLeft	= [];//剩余图片对象
		var eleList		= [];//DOM对象队列
		self.curPic		= null;
		//-------------------------------------------------------------- 初始
		self.css({marginLeft:40});
		//-------------------------------------------------------------- 事件
		window.onresize=function(){self.resize()};
		window.onscroll=function(){
			if(!loading){
				if(self.scrollHeight<body.scrollHeight){
                    loading=true;
                    searchBox.gett();
                }
            }
		};
		//-------------------------------------------------------------- 方法
		self.resize=function(){
			var w=document.documentElement.clientWidth-pad*2-mgn;
			var h=document.documentElement.clientHeight-pad*2-mgn;
			if(w!=W){
				W		= w;
				num		= Math.floor(W/180);
				eleList		= [];
				accumulateY	= pad;
				self.manage(picsAll);
			}else if(h>H){
				if(!loading)
                    if(self.scrollHeight<body.scrollHeight)
                        searchBox.gett();
			}
			H			= h;
			row			= Math.floor(H/140);
		};
		self.clear=function(){
            while (self.hasChildNodes()) {
                self.removeChild(self.lastChild);
            }
			picsAll		= [];
			picsLeft	= [];
			eleList		= [];
			accumulateY	= pad;
		}
		self.setData=function(data){
			var pics=self.addPic(data);				          //新图片对象
			picsAll=picsAll.concat(pics);					//储存
			pics=picsLeft.concat(pics);						//新图片对象与未处理的图片对象合并
			picsLeft=[];
			self.manage(pics);
			loading=false;
		}
		self.addPic=function(data){
			var pics=[];
			for(var d in data){
				var pic=Pic(data[d]);
				pics.push(pic);
			};
			return pics;
		};
		self.manage=function(pics){
			var doingRow=Math.floor(pics.length/num);

			picsDo=pics.slice(0,doingRow*num);						//生成将处理的图片对象
			picsLeft=pics.slice(doingRow*num);						//储存未处理的图片对象

			for(var i=0;i<doingRow;i++){
				var curPics=picsDo.slice(i*num,(i+1)*num);

				self.arrage(curPics);
			};
			for(var i in eleList){
				if(!eleList[i].isInDom){
					self.append(eleList[i]);
					eleList[i].isInDom=true;
				};
			};
			self.css({height:accumulateY});
			eleList=[];
            if(self.scrollHeight<body.clientHeight){
                getData();
            };
		};
        function getData(){
            if(!loading){
                if(self.scrollHeight<body.scrollHeight){
                    loading=true;
                    searchBox.gett();
                }
            }
        }
		self.arrage=function(pics){
			var ratioAll=0;											//横向信息
			var ratioArr=[];										//长宽比
			var mgn=picMgnX;
			
			for(var i in pics){										//获取长宽	
				var pic=pics[i];
				ratioArr.push(pic.radio);
				ratioAll+=(pic.radio);
			};

			var rowH=Math.floor((W-num*mgn*2)/ratioAll);			//计算高度
			var imgsW=0;											//计算宽度
			for(var i in pics){
				var imgW=Math.floor(rowH*ratioArr[i]);
				imgsW+=imgW;
				pics[i].setWH(imgW,rowH);
				eleList.push(pics[i]);
			};

			mgn=Math.floor((W-imgsW)/num/2);						//计算间隔

			accumulateX=pad;										//累计横向位置
			for(var i in pics){
				pics[i].setXY(accumulateX+mgn,accumulateY+picMgnY);
				accumulateX+=mgn*2+pics[i].W;
			};
			accumulateY+=picMgnY*2+rowH;							//累计纵向位置
		};
		return self;
	};
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
			var windowW=document.documentElement.clientWidth;
			var windowH=document.documentElement.clientHeight;
			var threshold=20;
			
			if((x+offsetX)<threshold){offsetX=-threshold}
			else if((x+self.W-offsetX)>(windowW-threshold)){offsetX=-self.W+threshold};
			
			if((y+offsetY)<threshold){offsetY=-threshold}
			//else if((y+self.H-offsetY)>(windowH-threshold)){offsetY=-self.H+threshold};
			
			self.css({width:self.W*2-pad*2,margin:[offsetY,0,0,offsetX],zIndex:3});
			img.css({width:self.W*2-pad*2,height:self.H*2-pad*2});
			self.addClass("magnify");
			title.show();
			info.show();
			imgB.show();
			
		};
		self.restore=function(){
			self.css({width:self.W-pad*2,margin:0,zIndex:1});
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
	function Filters(setting){
		var self=$("div");
		var data={};
		for(var i in setting){
			data[i]="All";
		}
		var UI={};
		self.getValue=function(){
			var value="";
			for(var i in UI){
				if(UI[i].getValue()!="All"){
					value+=i+":"+UI[i].getValue()+"+";
				}
			}
			value=value.substring(0,value.length-1);
			return value;
		}
		self.init=function(){
			var search=$("div",{id:"filterSearchBtn",text:"Search"});
			var reset=$("div",{id:"filterResetBtn",text:"Reset"});
	        for(var i in setting){
	            var item=Item(i,setting[i].name,setting[i].type,data[i],setting[i].format);
	            UI[i]=item;
	            self.append(item);
	        }
	        search.onclick=function(){
	            searchBox.get(searchBox.queryword);
	        };
	        reset.onclick=function(){
	        	for(var i in UI){
	        		UI[i].setValue("All");
	        	}
	        }
	        self.append(search,reset);
	    };
		return self;
	};
};