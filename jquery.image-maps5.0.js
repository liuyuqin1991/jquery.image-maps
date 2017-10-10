/**
 * @name jQuery imageMaps plugin 5.0
 * @author liuyuqin
 * @data 2016年11月25日09:54:51
 * ===========热区插件图片dom结构如下(显示的属性为必须)：=================
 * <div class="hot_area">
 * 	1.图片展示部分：
 * 	<div class="" name="imageMap" id="image_map">
 *       	<img src=""  ref="imageMap" id="photo"/>
 * 	</div>
 * 	2.添加热区渲染部分(表格样式选1，行样式选2)：
 * 	1)table body样式：																	2)ul样式：
 * 	<table><tbody id="areaItems"> </tbody></table>				<ul id="areaItems"></ul>
 * 	3.添加热区按钮部分：
 * 	<p><a id="add_hot_area" href="javascript:;" class="">添加热区</a></p>
 * 	4.热区数据存储（隐藏）：
 * 	<input type="hidden" class="" id="hotAreas" name="hotAreas" value="">
 * 	5.可添加热区数量与还可添加热区数量实时显示：
 * 	<p><span class="">已添加已添加<b class="added_amount">0</b>个热区，还可添加<b class="remain_amount">X</b>个热区</span></p>
 * 	6.图片url：
 * 	<input type="text" id="picUrl" name="" class=""/>
 *  </div>    
 * 
 * ======================setting 属性设置 ：==========================
 * 属性：
 * 1.（必须）maxAmount                  最大值设定
 * 2.（必须）tag                                   行dom标签，目前仅可使用tr,li 
 * 3.（必须）params                           特殊热区参数名称对象，对象形式：setting.params = {'areaLink':'添加热区时的默认值','areaType':'添加热区时的默认值'};
 * 
 * 回调函数：
 * 4.（必须）domCallBack(params)                   特殊dom创建回调函数（必须）， 返回特殊热区dom结构函数,必须是<tr></tr>或<li></li>；params：特殊对象params并包含当前行数params.index；
 * 5.（可选）initCallBack(params)                     初始化行回调函数（可选），初始化特殊热区函数；params：特殊对象params并包含当前行数params.index；
 * 6.（可选）deleteCallBack(_this,index)          删除行操作回调函数（可选），删除特殊热区函数：_this：删除行tr或li对象，index：删除行数；
 * 7.（必须）readjustCallBack(_this,index)      重新调整剩余行回调函数（必须），删除热区后重新调整剩余列表行数据函数：_this：重新调整每次遍历的行tr或li对象，index：当前行数
 * 
 * =======================热区通用dom获取 ：===========================
 * 
 * 1.areaSort   热区排序号class
 * 2.areaTitle  热区名称class
 * 3.areaMapInfo  热区坐标class
 * 4.area_item 热区行class
 * 
 *  =============================说明 ：===============================
 *  
 * 1.<div class="" name="imageMap" id="image_map"> 图片dom，热区根据此dom来初始化
 * 2.渲染部分为每个热区对应的名称链接等信息，以表格或ul li格式展示
 * 3.hotAreas装载热区信息json，包括热区名称，坐标，链接等信息，需要用户根据dom获取值然后拼接成json保存热区信息
 * 	而在加载渲染时，也是根据此参数的值来加载热区信息，例如：
 * "hotAreas" : "[{'areaTitle':'热区 1','areaLink':'','areaMapInfo':'0,0,90,30'},
 * 						   {'areaTitle':'热区 2','areaLink':'','areaMapInfo':'260,13,353,112'}]"
 * 4.通用插件依赖了storeBaseUtils.js，该js为弹窗通用js，可删除，并同时修改baseUtils.showNormalDialog方法
 * 5.删除热区后， 会重新调整热区数量及显示数字，也会遍历剩余tr或li，调整名称及热区序号，readjustCallBack用于遍历循环中对当前行的特殊dom的处理
 */

	
			
			var imageMaps = {};
			var proportionDefaultWidth = 1;
			var proportionDefaultHeight = 1;
			
			$.fn.imageMaps = function(setting){
				var initFlag = false;
				var deleteFlag = false;
				
				if(setting.initCallBack != null){
					initFlag = true;
				}
				if(setting.deleteCallBack != null){
					deleteFlag = true;
				}

				function initAddClickEvent(){
					// 初始化添加热区功能按钮
					$("#add_hot_area").unbind("click").click(function () {
						var index;
						var imageMap = $("#image_map");
						var areaContainer = imageMap.parent();
						positionContainer = areaContainer.find('.position_container');
						index = areaContainer.find(setting.tag+ '[name="areaItem"]').length + 1;
						if ($("#image_map").find('img').attr('src') == '') {
							/*dialogUtil.showNormalDialog({
								"title" : "温馨提示",
								"content" : '请先上传图片',
								"showCancelBtn" : false
							});*/
							alert('请先上传图片');
							return;
						}
						var rowCount = $(".area_item");
						if (rowCount != null) {
							var c = rowCount.length;
							if (c == setting.maxAmount) {
								/*dialogUtil.showNormalDialog({
									"title" : "温馨提示",
									"content" : '只能添加'+ setting.maxAmount+ '个热区',
									"showCancelBtn" : false
								});*/
								alert( '只能添加'+ setting.maxAmount+ '个热区');
								return;
							}
						}
						//清除setting中的特殊dom参数
						for(var attr in setting.params){
							setting.params[attr] =  '';
						}
						setting.params.index = index;
						$('#areaItems').append(createAreaItem(index,index,'0,0,90,30',setting.tag,setting.domCallBack(setting.params)));
						if(initFlag){
							setting.initCallBack(setting.params);
						}
						selectPosition();
						positionContainer.append('<div ref="'+ index+ '" class="map_position map_selected_position" style="left:0px;top:0px;width:90px;height:30px;"><div class="map_position_bg"></div><span class="link_number_text"> '+ index+ '</span><span class="delete"></span><span class="resize"></span></div>');
						bindMapEvent();
						updateAreaCount();
						initDeleteClickEvent();
						return false;
					});
				}
				
				
				function initDeleteClickEvent(){
					//初始化删除热区功能按钮 
					$('.hot_area .delete').unbind('click').click(function () {
						//点击热区内的删除按钮和点击table中的删除按钮dom层级不一致
						var ref = $(this).parents('[ref]').eq(0).attr('ref');
						var areaContainer = $(".hot_area");
						var positionContainer = areaContainer.find('.position_container');
						areaContainer.find(setting.tag +'[name="areaItem"][ref='+ ref + ']').remove();
						positionContainer.find('.map_position[ref=' + ref+ ']').remove();
						var index = 1;
						areaContainer.find(setting.tag + '[name="areaItem"]').each(function() {
							$(this).attr('ref',index);
							$(this).find('.areaSort').html('热区'+ index+"：");
							if(deleteFlag){
								setting.deleteCallBack($(this),index);
							}
							index++;
						});
						index = 1;
						positionContainer.find('.map_position').each(function() {
								$(this).attr('ref',index).find('.link_number_text').html(index);
								index++;
						});
						updateAreaCount();
					});
				}
				
				//初始化热区
				this.each(function() {
					var imageMap = $(this);
					var hotImage = imageMap.find('img[ref=imageMap]');
					// 清空容器的原有内容，重新填充内容
					// 清除原有热区
					imageMap.empty();
					imageMap.append(hotImage);
					//删除所有热区条目
					$(setting.tag + '[name="areaItem"]').remove();
					updateAreaCount();
					//初始化热区dom结构和可移动范围
					if (hotImage != null) {
						hotImage.wrap('<div class="image_container" style="position:relative;"></div>').css('border', '1px solid #ccc');
						var imageContainer = hotImage.parent(), imgConrainerOffset = imageContainer.offset(), imgOffset = hotImage.offset();
						imageContainer.append(/msie/.test(navigator.userAgent.toLowerCase()) ? $('<div class="position_container"></div>').css({
							background : '#fff',
							opacity : 0
						}): '<div class="position_container"></div>');
						imageContainer.find('.position_container').css({
							top : imgOffset.top- imgConrainerOffset.top,
							left : imgOffset.left- imgConrainerOffset.left,
							width : hotImage.width(),// 这里按照1.0，将hotImage改为imageMap
							height : hotImage.height(),
							border : '1px solid transparent'
						});
					}
					initAreaInfo();
					bindMapEvent();
					updateAreaCount();
					initAddClickEvent();
					initDeleteClickEvent();
				});

				
				// 初始化热区信息
				function initAreaInfo(){
					// 根据dom做了名称改动
					var areaInfo = $('input[name="hotAreas"]').val(); 
					if ($('.hot_area img[ref=imageMap]').attr("src")
							&& areaInfo != null && areaInfo != '') {
						var index = 1;
						var areaContainer = $(".hot_area");
						var positionContainer = areaContainer
								.find('.position_container');
console.log(areaInfo);
						var areaInfoJson = eval('(' + areaInfo + ')');
						areaInfoJson = areaInfoJson;
						if (areaInfoJson != null && areaInfoJson.length > 0) {
							for (var j = 0; j < areaInfoJson.length; j++) {
								var areaTitle = areaInfoJson[j].areaTitle;
								var areaMapInfo = areaInfoJson[j].areaMapInfo;
								for(var attr in setting.params){
									setting.params[attr] =  areaInfoJson[j][attr];
								}
								//将行序号添加至特殊参数名称数组的开头
								setting.params.index = index;
								if (areaTitle == null) {
									areaTitle == '';
								}
								if (areaMapInfo == null) {
									areaMapInfo == '';
								}
								if(areaMapInfo) {
									//进行图片尺寸缩放
	    	                        var coordsTemp = areaMapInfo.split(',');
	    	                        coordsTemp[0] = coordsTemp[0]*proportionDefaultWidth;
	    	                        coordsTemp[1] = coordsTemp[1]*proportionDefaultHeight;
	    	                        coordsTemp[2] = coordsTemp[2]*proportionDefaultWidth;
	    	                        coordsTemp[3] = coordsTemp[3]*proportionDefaultHeight;
	    	                        areaMapInfo = coordsTemp[0]+','+coordsTemp[1]+','+coordsTemp[2]+','+coordsTemp[3];
	                            	$('#areaItems').append(createAreaItem(index, areaTitle, areaMapInfo,setting.tag,setting.domCallBack(setting.params)));
	            					if(initFlag){
	            						setting.initCallBack(setting.params);
	            					}
	            					var coords = areaMapInfo.split(',');
	                                positionContainer.append('<div ref="'+index+'" class="map_position" style="left:'+coords[0]+'px;top:'+coords[1]+'px;width:'+(coords[2]-coords[0])+'px;height:'+(coords[3]-coords[1])+'px;"><div class="map_position_bg"></div><span class="link_number_text"> '+index+'</span><span class="delete"></span><span class="resize"></span></div>');
	                                index++;
								}
							}
						}
					}
				}

				//done
				function createAreaItem(index, areaTitle,areaMapInfo,rowTagDom,specialHotItemDom) {
//console.log("specialHotItemDom:"+specialHotItemDom);
					var item = [];
					//目前仅可使用table和ul li 样式
					if (rowTagDom == "tr") {
						item.push('<tr name = "areaItem" class="mt area_item" ref="'+ index + '">');
						item.push('<td><span class="areaSort"><b>热区'+ index+ '</b></span></td>');
						item.push('<td><input type="hidden" class="ipt_border area_title" value="'+ areaTitle + '"/></td>');
						item.push(specialHotItemDom);
						item.push('<td>位置：<input type="text" class="areaMapInfo" value="'+ areaMapInfo + '" /></td>');
						item.push('<td><a href="javascript:;" class="second_btn ml delete">删除</a></td>');
						item.push('</tr>');
					} else {
						item.push('<li name="areaItem" class="mt area_item" ref="'+ index + '">');
						item.push('<span class="areaSort">热区' + index + '：</span>');
						item.push('<label for="">标题：</label><input type="text" value="'+ areaTitle+ '" class="w45 ipt_border area_title"/>');
						item.push(specialHotItemDom);
						item.push('<input type="hidden" name="areaMapInfo" class="areaMapInfo" value="'+ areaMapInfo + '" />');
						item.push('<a href="javascript:;" class="second_btn ml delete">删除</a>');
						item.push('</li>');
					}
					return item.join('');
				}

				//绑定map事件 done
		        function bindMapEvent(){
		            $(document).unbind("mousemove");
		            $(document).unbind("mouseup");
		            $('.position_container .map_position .map_position_bg').each(function(){
		                var mapPositionBg = $(this);
		                var container = $(this).parent().parent();
		                var mapPosition = $(this).parent();
		                var linkNumberText = mapPosition.find('.link_number_text');
		                
		                mapPositionBg.unbind('mousedown').mousedown(function(event){
		                    mapPositionBgMousedownFtn(event);
		                });
		                
		                linkNumberText.unbind('mousedown').mousedown(function(event){
		                    mapPositionBgMousedownFtn(event);
		                });
		                
		                function mapPositionBgMousedownFtn(event) {
		                    mapPositionBg.data('mousedown', true);
		                    mapPositionBg.data('pageX', event.pageX);
		                    mapPositionBg.data('pageY', event.pageY);
		                    mapPositionBg.css('cursor','move');
		                    selectPosition(mapPosition);
		                    return false;
		                }
		                
		                $(document).mousemove(function(event) {
		                    if (!mapPositionBg.data('mousedown')) return false;
		                        var dx = event.pageX - mapPositionBg.data('pageX');
		                        var dy = event.pageY - mapPositionBg.data('pageY');
		                        if ((dx == 0) && (dy == 0)){
		                            return false;
		                        }
		                        var mapPosition = mapPositionBg.parent();
		                        var p = mapPosition.position();
		                        
		                        var left = p.left+dx;
		                        
		                        if(left < 0) left = 0;
		                        var top = p.top+dy;
		                        if (top < 0) top = 0;
		                        var bottom = top + mapPosition.height();
		                        if(bottom > container.height()){
									top = top-(bottom-container.height());
								}
		                        var right = left + mapPosition.width();
		                        if(right > container.width()){
									left = left-(right-container.width());
								}
		                        
		                        mapPosition.css({
		                            left:left,
		                            top:top
		                        });
		                        mapPositionBg.data('pageX', event.pageX);
		                        mapPositionBg.data('pageY', event.pageY);
		                        
		                        bottom = top + mapPosition.height();
		                        right = left + mapPosition.width();
		                        $(setting.tag + '[name="areaItem"][ref='+ mapPosition.attr('ref') +'] .areaMapInfo').val(new Array(Math.round(left),Math.round(top),Math.round(right),Math.round(bottom)).join(','));
		                        return false;   
		                }).mouseup(function(event){
		                    mapPositionBg.data('mousedown', false);
		                    mapPositionBg.css('cursor','default');
		                    return false;
		                });
		            });
		        $('.position_container .map_position .resize').each(function(){
		            var mapPositionResize = $(this);
		            var container = $(this).parent().parent();
		            var mapPosition = $(this).parent();
		            
		            mapPositionResize.unbind('mousedown').mousedown(function(event){
		                mapPositionResize.data('mousedown', true);
		                mapPositionResize.data('pageX', event.pageX);
		                mapPositionResize.data('pageY', event.pageY);
		                return false;
		            }).unbind('mouseup').mouseup(function(event){
		                mapPositionResize.data('mousedown', false);
		                return false;
		            });
		            $(document).mousemove(function(event){
		                if (!mapPositionResize.data('mousedown')) return false;

		                var dx = event.pageX - mapPositionResize.data('pageX');
		                var dy = event.pageY - mapPositionResize.data('pageY');
		                if ((dx == 0) && (dy == 0)){
		                    return false;
		                }
		                var mapPosition = mapPositionResize.parent();
		                var p = mapPosition.position();
		                var left = p.left;
		                var top = p.top;
		                var height = mapPosition.height()+dy;
		                if((top+height) > container.height()){
		                    height = height-((top+height)-container.height());
		                }
		                if (height <20) height = 20;
		                var width = mapPosition.width()+dx;
		                if((left+width) > container.width()){
		                    width = width-((left+width)-container.width());
		                }
		                if(width <12) width = 12;
		                mapPosition.css({
		                    width:width,
		                    height:height
		                });
		                mapPositionResize.data('pageX', event.pageX);
		                mapPositionResize.data('pageY', event.pageY);
		                
		                bottom = top + mapPosition.height();
		                right = left + mapPosition.width();
		                $(setting.tag + '[name="areaItem"][ref='+ mapPosition.attr('ref') +'] .areaMapInfo').val(new Array(Math.round(left),Math.round(top),Math.round(right),Math.round(bottom)).join(','));
		                return false;
		            }).mouseup(function(event){
		                mapPositionResize.data('mousedown', false);
		                return false;
		            });
		        });
			}

			//选中某个热区map
			function selectPosition(selectedPosition) {
				$(".map_position").removeClass("map_selected_position");
				if (selectedPosition) {
					selectedPosition.addClass("map_selected_position");
				}
			}

			//更新热区数量
			function updateAreaCount() {
				var maxCount = setting.maxAmount;
				var rowCount = $(".area_item");
				if (rowCount != null) {
					var c = rowCount.length;
					$(".added_amount").html(c);
					$(".remain_amount").html(maxCount - c);
				}
			}
	};
	
	//获取相应行的标题
	imageMaps.getAreaTitle = function(item){
		return item.find('.area_title').val();
	}
	
	//获取相应行的排序号
	imageMaps.getAreaSort = function(item){
		return item.find('.areaSort').val();
	}
	
	//获取相应行的坐标（不带缩放）
	imageMaps.getAreaMapInfo = function(item){
		return item.find('.areaMapInfo').val();
	}
	
	//获取相应行的坐标（带等比缩放），并进行反缩放
	imageMaps.getProportionAreaMapInfo = function(item,proportion){
		var rate = proportionDefaultWidth;
		if(proportion){
			rate = proportion;
		}
    	var areaMapInfo = item.find('.areaMapInfo').val();
        var coordsTemp = areaMapInfo.split(',');
        coordsTemp[0] = parseInt(coordsTemp[0]/rate);
        coordsTemp[1] = parseInt(coordsTemp[1]/rate);
        coordsTemp[2] = parseInt(coordsTemp[2]/rate);
        coordsTemp[3] = parseInt(coordsTemp[3]/rate);
        areaMapInfo = coordsTemp[0]+','+coordsTemp[1]+','+coordsTemp[2]+','+coordsTemp[3];
        return areaMapInfo;
	};
	
	//获取相应行的坐标（带非等比缩放），并进行反缩放
	imageMaps.getProportionNoSameAreaMapInfo = function(item,proportionWidth,proportionHeight){
		if(!proportionWidth){
			proportionWidth = 1;
		}
		if(!proportionHeight){
			proportionHeight = 1;
		}
    	var areaMapInfo = item.find('.areaMapInfo').val();
        var coordsTemp = areaMapInfo.split(',');
        coordsTemp[0] = parseInt(coordsTemp[0]/proportionWidth);
        coordsTemp[1] = parseInt(coordsTemp[1]/proportionHeight);
        coordsTemp[2] = parseInt(coordsTemp[2]/proportionWidth);
        coordsTemp[3] = parseInt(coordsTemp[3]/proportionHeight);
        areaMapInfo = coordsTemp[0]+','+coordsTemp[1]+','+coordsTemp[2]+','+coordsTemp[3];
        return areaMapInfo;
	};
	
	/**
	 * 1.非等比缩放——定宽比，定高比
	 * pic：图片url
	 * setting：热区参数对象
	 * proportionWidth：缩放比例 0-1
	 * proportionHeight：缩放比例 0-1
	 * imageMapsSwitch ：热区插件开关：true或不填：开，false：关
	 */
	imageMaps.proportionNoSameManual = function(pic,setting,proportionWidth,proportionHeight,imageMapsSwitch){
		var imageMap = $("#image_map");
		if(!(imageMap.hasClass("none"))){
			imageMap.addClass("none");	
		}
    	var obj = $('#photo');
		obj.attr('src', pic);
	    obj.error(function() {
	    	obj.attr('src', pic);
	    }); 
	    var datas = { pic : pic, setting : setting , proportionWidth: proportionWidth, proportionHeight : proportionHeight, imageMapsSwitch : imageMapsSwitch};
	    obj.load(datas,function(event){
			//创建图片对象，设置src
		   	var img = new Image();
		   	img.src = event.data.pic;
		   	var imageWidth = img.width;
		   	var imageHeight = img.height;
	    	imageMap.removeClass("none");
		   	this.width = imageWidth * event.data.proportionWidth;
		   	this.height = imageHeight * event.data.proportionHeight;
		   	proportionDefaultWidth = proportionWidth;
		   	proportionDefaultHeight = proportionHeight;
		   	if(!imageMapsSwitch || imageMapsSwitch == true){
		   		//加载图片热区入口
	            $('#image_map').imageMaps(setting);
		   	}
        });
    };
    
	/**
	 * 2.非等比缩放——定宽，定高
	 * pic：图片url
	 * setting：热区参数对象
	 * scaleWidth： 宽度 
	 * scaleHeight：高度
	 * imageMapsSwitch ：热区插件开关：true或不填：开，false：关
	 */
	imageMaps.scaleNoSameManual = function(pic,setting,scaleWidth,scaleHeight,imageMapsSwitch){
		var imageMap = $("#image_map");
		if(!(imageMap.hasClass("none"))){
			imageMap.addClass("none");	
		}
    	var obj = $('#photo');
		obj.attr('src', pic);
	    obj.error(function() {
	    	obj.attr('src', pic);
	    }); 
	    var datas = { pic : pic, setting : setting , scaleWidth: scaleWidth, scaleHeight : scaleHeight, imageMapsSwitch : imageMapsSwitch};
	    obj.load(datas,function(event){
			//创建图片对象，设置src
		   	var img = new Image();
		   	img.src = event.data.pic;
		   	var imageWidth = img.width;
		   	var imageHeight = img.height;
	    	imageMap.removeClass("none");
		   	this.width = scaleWidth;
		   	this.height = scaleHeight;
		   	proportionDefaultWidth = scaleWidth/imageWidth;
		   	proportionDefaultHeight = scaleHeight/imageHeight;
		   	if(!imageMapsSwitch || imageMapsSwitch == true){
		   		//加载图片热区入口
	            $('#image_map').imageMaps(setting);
		   	}
        });
    };
    
	/**
	 * 3.等比缩放——定宽比
	 * pic：图片url
	 * setting：热区参数对象
	 * proportion：缩放比例 0-1
	 * imageMapsSwitch ：热区插件开关：true或不填：开，false：关
	 */
	imageMaps.proportionSameManual = function(pic,setting,proportion,imageMapsSwitch){
		var imageMap = $("#image_map");
		if(!(imageMap.hasClass("none"))){
			imageMap.addClass("none");	
		}
    	var obj = $('#photo');
		obj.attr('src', pic);
	    obj.error(function() {
	    	obj.attr('src', pic);
	    }); 
	    var datas = { pic : pic, setting : setting , proportion : proportion , imageMapsSwitch : imageMapsSwitch};
	    obj.load(datas,function(event){
	    	//创建图片对象，设置src
		   	var img = new Image();
		   	img.src = event.data.pic;
	    	imageMap.removeClass("none");
		   	var imageWidth = img.width;
		   	this.width = imageWidth * event.data.proportion;
		   	proportionDefaultWidth = proportion;
		   	proportionDefaultHeight = proportion;
		   	if(!imageMapsSwitch || imageMapsSwitch == true){
		   		//加载图片热区入口
	            $('#image_map').imageMaps(setting);
		   	}
        });
    };
    
	/**
	 * 4.等比缩放——定宽
	 * pic：图片url
	 * setting：热区参数对象
	 * scaleWidth：缩放后的宽度
	 * imageMapsSwitch ：热区插件开关：true或不填：开，false：关
	 */
	imageMaps.scaleWidthSameManual = function(pic,setting,scaleWidth,imageMapsSwitch){
		var imageMap = $("#image_map");
		if(!(imageMap.hasClass("none"))){
			imageMap.addClass("none");	
		}
    	var obj = $('#photo');
		obj.attr('src', pic);
	    obj.error(function() {
	    	obj.attr('src', pic);
	    }); 
	    var datas = { pic : pic, setting : setting , scaleWidth: scaleWidth, imageMapsSwitch : imageMapsSwitch};
	    obj.load(datas,function(event){
	    	//创建图片对象，设置src
		   	var img = new Image();
		   	img.src = event.data.pic;
	    	imageMap.removeClass("none");
		   	var imageWidth = img.width;
		   	this.width = scaleWidth;
		   	proportionDefaultWidth = scaleWidth/imageWidth;
		   	proportionDefaultHeight = proportionDefaultWidth;
		   	if(!imageMapsSwitch || imageMapsSwitch == true){
		   		//加载图片热区入口
	            $('#image_map').imageMaps(setting);
		   	}
        });
    };
    
	/**
	 *  5.非等比缩放——定宽，定高比
	 *  pic：图片url
	 *  setting：热区参数对象
	 *  scaleWidth：缩放后的宽度
	 *  proportionHeight：高度缩放比例 0-1
	 * imageMapsSwitch ：热区插件开关：true或不填：开，false：关
	 */
	imageMaps.scaleWidthproportionHeightManual = function(pic,setting,scaleWidth,proportionHeight,imageMapsSwitch){
		var imageMap = $("#image_map");
		if(!(imageMap.hasClass("none"))){
			imageMap.addClass("none");	
		}
    	var obj = $('#photo');
		obj.attr('src', pic);
	    obj.error(function() {
	    	obj.attr('src', pic);
	    }); 
	    var datas = { pic : pic, setting : setting , scaleWidth: scaleWidth,proportionHeight:proportionHeight, imageMapsSwitch : imageMapsSwitch};
	    obj.load(datas,function(event){
	    	//创建图片对象，设置src
		   	var img = new Image();
		   	img.src = event.data.pic;
	    	imageMap.removeClass("none");
		   	var imageWidth = img.width;
			var imageHeight = img.height;
		   	this.width = scaleWidth;
		   	this.height = imageHeight * proportionHeight;
		   	proportionDefaultWidth = scaleWidth/imageWidth;
		   	proportionDefaultHeight = proportionHeight;
		   	if(!imageMapsSwitch || imageMapsSwitch == true){
		   		//加载图片热区入口
	            $('#image_map').imageMaps(setting);
		   	}
        });
    };
    
		/**
		* 6.等比缩放——自动
		* pic：图片url
		* setting：热区参数对象
		* imageMapsSwitch ：热区插件开关：true或不填：开，false：关
		*/
		imageMaps.proportionAutoManual = function(pic,setting,imageMapsSwitch){
			//隐藏imageMap
			var imageMap = $("#image_map");
			if(!(imageMap.hasClass("none"))){
				imageMap.addClass("none");	
			}
	    	var obj = $('#photo');
	    	var proportion;
			obj.attr('src', pic);
		    obj.error(function() {
		    	obj.attr('src', pic);
		    }); 
		    var datas = { pic : pic, setting : setting , imageMapsSwitch : imageMapsSwitch};
		    obj.load(datas,function(event){
				//创建图片对象，设置src
			   	var img = new Image();
			   	img.src = event.data.pic;
			   	var imageWidth = img.width;
		    	imageMap.removeClass("none");
		    	var img_width = $('#image_map').width();
			   	if(imageWidth <= img_width){
			   		proportion = 1;
			   	}
			   	else{
			   		proportion = img_width/imageWidth;
			   	}
			   	this.width = imageWidth * proportion;
			   	proportionDefaultWidth = proportion;
			   	proportionDefaultHeight = proportion;
			   	if(!imageMapsSwitch || imageMapsSwitch == true){
			   		//加载图片热区入口
		            $('#image_map').imageMaps(setting);
			   	}
	        });
	   };
	   
	   
		/**
		* 6.不进行缩放
		* pic：图片url
		* setting：热区参数对象
		* imageMapsSwitch ：热区插件开关：true或不填：开，false：关
		*/
		imageMaps.originalManual = function(pic,setting,imageMapsSwitch){
			//隐藏imageMap
			var imageMap = $("#image_map");
			if(!(imageMap.hasClass("none"))){
				imageMap.addClass("none");	
			}
	    	var obj = $('#photo');
	    	var proportion;
			obj.attr('src', pic);
		    obj.error(function() {
		    	obj.attr('src', pic);
		    }); 
		    var datas = { pic : pic, setting : setting , imageMapsSwitch : imageMapsSwitch};
		    obj.load(datas,function(event){
				//创建图片对象，设置src
			   	var img = new Image();
			   	img.src = event.data.pic;
			   	var imageWidth = img.width;
		    	imageMap.removeClass("none");
			   	proportionDefaultWidth = 1;
			   	proportionDefaultHeight = 1;
			   	if(!imageMapsSwitch || imageMapsSwitch == true){
			   		//加载图片热区入口
		            $('#image_map').imageMaps(setting);
			   	}
	        });
	   };
        

