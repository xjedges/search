function Gallery(Pic,set){
	var self		= $("ul",{id:"gallery"});
	var setting={
		pad			: 10,
		mgn			: 50,
		picMgnX		: 10,
		picMgnY		: 10,
	}
	for(var i in set)
		if(setting[i]!=null)
			setting[i]=set[i];
	//-------------------------------------------------------------- 变量
	var accumulateX	= setting.pad;
	var accumulateY	= 0;
	var W			= document.documentElement.clientWidth-setting.pad*2-setting.mgn;
	var H			= document.documentElement.clientHeight-setting.pad*2-setting.mgn;
	var num			= Math.floor(W/180);
	var row			= Math.floor(H/140);
	var loading		= false;
	var picsAll		= [];//全部图片对象
	var picsDo		= [];//正处理图片对象
	var picsLeft	= [];//剩余图片对象
	var eleList		= [];//DOM对象队列
	self.curPic		= null;
	//-------------------------------------------------------------- 方法
	self.resize=function(){
		var w=document.documentElement.clientWidth-setting.pad*2-setting.mgn;
		var h=document.documentElement.clientHeight-setting.pad*2-setting.mgn;
		if(w!=W){
			W		= w;
			num		= Math.floor(W/180);
			eleList		= [];
			accumulateY	= setting.pad;
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
		accumulateY	= 0;
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
		self.css({height:accumulateY+setting.pad*2});
		eleList=[];
	    if(!loading && self.scrollHeight<body.height()){
	        loading=true;
	        searchBox.gett();
	    };
	};
	self.arrage=function(pics){
		var ratioAll=0;											//横向信息
		var ratioArr=[];										//长宽比
		var mgn=setting.picMgnX;
		
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

		accumulateX=setting.pad;										//累计横向位置
		for(var i in pics){
			pics[i].setXY(accumulateX+mgn,accumulateY);
			accumulateX+=mgn*2+pics[i].W;
		};
		accumulateY+=setting.picMgnY*2+rowH;							//累计纵向位置
	};
	return self;
};