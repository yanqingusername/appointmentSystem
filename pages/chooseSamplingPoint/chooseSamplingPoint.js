// pages/myOrder/myOrder.js
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')
var a_channel_id_plus;
var a_channel_id;
var a_channel_id_plus_old;
var a_channel_id_old;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    circulationList: [],
    setInter: '', 
    support_id:"",
    overflowFlag:false,
    TabCur: 0,
    status: 0,
    channelListPlusOld:[],//采样点列表（最开始数据）
    channelListOld:[],//采样点列表（最开始数据）
    channelList: [],       //采样点列表（未模糊查询）
    channelListPlus:[], 
    statusList: [ '调拨出库','领用出库'],
    circulationListTemp:[],
		page:1, //当前页数
		pageSize:6, //每页六条
    hasMoreData:true,
    alreadyChecked:false,
    tip:"",
    tip_temp:'暂无数据',
    flag1:true,
    flag2:false,
    sampling_place:'全城区',
    hiddenFlag:false,
    isFirst: 1,
    isFirstPlus: 1,
    longitude: 116.39772, // 默认天安门广场
    latitude: 39.90323, // 默认天安门广场
    lableList:[],
    lableIndex: 0,
    lableid: '',
    lableidList: [],
    isbigscreen: '',
    yingye: '',
  },
  getLocationAuth(){
    wx.getSetting({//获取用户已授权的信息
      success(res) {      
        console.log(res)  
        if (res.authSetting['scope.userLocation']==false){//如果没有授权地理位置  
          console.log("用户没授权地理位置")
          wx.showModal({
            title:'获取地理位置',
            content:'为您推荐附近采样点',
            confirmText:'确认授权',
            showCancel:true,
            success (res) {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    res.authSetting = {//打开授权位置页面，让用户自己开启
                      "scope.userLocation": true
                    }             
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }else{//
          wx.getSystemInfo({
            success(res) {
            var isopendingwei = res.locationEnabled;
              if(isopendingwei==false){
                wx.showModal({
                  title: '无法获取地理位置，请检查是否开启系统权限',
                  showCancel:false,
                  success(res){
                  }
                })
              }  
            }
          })
        }       
      }
    })
  },
  onShow:function(){
   var that = this;
  that.clearSearchHandle();
  that.getChannelList();
  that.getLocationAuth();
  console.log('成功onshow+++++++++++') 
},
onLoad:function(){
  var that = this;
  const res = wx.getSystemInfoSync()
  console.log(res)
  console.log(res.pixelRatio)
  console.log(res.windowWidth)
  console.log(res.windowHeight)
  console.log(res.language)
  console.log(res.version)
  console.log(res.platform)
  // that.getChannelList();

  that.gettagList();
},
gettagList: function (e) {
  var that = this
  var data = {
    isbig: 0
  }
  request.request_get('/Newacid/gettagList.hn', data, function (res) {
    console.info('回调', res)
    if (res) {
      if (res.success) {
        let list = res.msg;
        for(let i = 0; i< list.length; i++){
          list[i].isSelect = false;
        }
        // let reagentHead = {
        //   "id": "0",
        //   "is_allow_show": "0",
        //   "label_name": "全部",
        //   "status": "0",
        //   "isSelect": false
        // }
        // list.unshift(reagentHead)
        that.setData({
          lableList: list
        });
      } else {
        box.showToast(res.msg);
      }
    }
  })
},
getChannelList:function(){
  var that = this;
  var sampling_place = that.data.sampling_place;
  console.log('sampling_place= '+sampling_place)
  if(sampling_place=='全城区'){
    sampling_place = ''
  }
  wx.getLocation({
    type:'gcj02',
    success(res){
      console.log("我获取到了经纬度")
      wx.setStorageSync('longitude', res.longitude)
      wx.setStorageSync('latitude', res.latitude)

      that.setData({
        longitude:res.longitude, //经度
        latitude:res.latitude //纬度
      })
      var data = {
        longitude : res.longitude,
        latitude : res.latitude,
        sampling_place:sampling_place,
        tag: that.data.lableid,
        channelname: that.data.searchText,
        isbigscreen: that.data.isbigscreen,
        yingye: that.data.yingye,
      }
      request.request_get('/Newacid/getFixedSamplingPoint.hn',data,function(res){
        console.log('getFixedSamplingPoint',res);
        if(res){
          if(res.success){
            console.log(res.msg);
            var channelList = res.msg;
            channelList.sort(function(a, b) {
						return b.distance < a.distance ? 1 : -1 //正序
          })
          for(var i = 0;i<channelList.length;i++){
            channelList[i].distance = utils.setMorKm(channelList[i].distance)
            channelList[i].workingTimeArr = channelList[i].working_time.split(',');
            for(var y=0;y<channelList[i].workingTimeArr.length;y++){
              if(channelList[i].workingTimeArr[y].indexOf('：') == -1){
                channelList[i].workingTimeArr[y] += '：全天24h'
              }
              var reg = new RegExp(":00-","g");
              channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].replace(reg,"-");
              channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].substring(0,channelList[i].workingTimeArr[y].length-3);
             
              if(channelList[i].workingTimeArr[y].substr(channelList[i].workingTimeArr[y].indexOf('：')+1,2) > channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2)){
                console.log(channelList[i].workingTimeArr[y].substr(channelList[i].workingTimeArr[y].indexOf('：')+1,2))
                console.log(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2))
                channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].replace(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2),'次日'+ channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2))
              }


              // if(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2)>24){ //若时间为25:00显示为次日01:00
              //   channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].replace(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2),'次日'+ utils.formatNumber((channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2)-24)))
              // }

            }
            // channelList[i].title = channelList[i].channel_name;
            channelList[i].id = parseInt(channelList[i].channel_id);
            
            if(channelList[i].yingye == 0){
              channelList[i].iconPath = '../../images/icon_position_02.png';
            }else{
              channelList[i].iconPath = '../../images/icon_position_04.png';
            }
            channelList[i].width = 30;
            channelList[i].height = 30;
            channelList[i].zIndex = 0;

            // channelList[i].callout = {
            //   content: channelList[i].channel_name,
            //   color: '#ff0000',
            //   fontSize: 14,
            //   borderWidth: 2,
            //   borderRadius: 10,
            //   borderColor: '#fff',
            //   bgColor: '#fff',
            //   padding: 5,
            //   display: 'ALWAYS',
            //   textAlign: 'center'
            // }
          } 
            that.setData({
              channelList: channelList,
              // channelListOld: channelList,
              hiddenFlag:false,
              overflowFlag:false
            })

            if(that.data.searchText || that.data.lableid || that.data.isbigscreen){
              if(that.data.channelList.length == 0){
                that.setData({
                  tip: '没有搜索到该采样点',
                  overflowFlag:true //禁止y轴搜索
                //  flagCheck: true
                });
              }else{
                that.setData({
                  longitude:that.data.channelList[0].longitude, //经度
                  latitude:that.data.channelList[0].latitude //纬度
                })
              }
            }
          }else{
          // box.showToast(res.msg);
          }
        }else{
          //box.showToast("网络不稳定，请重试");
        }
      })
    },
    fail(res){
      that.setData({
        longitude: wx.getStorageSync('longitude') || that.data.longitude,
        latitude: wx.getStorageSync('latitude') || that.data.latitude
      });
      console.log(res)
      console.log('---->:',that.data.longitude,that.data.latitude);
      var data = {
        longitude : that.data.longitude,
        latitude : that.data.latitude,
        sampling_place:sampling_place,
        tag: that.data.lableid,
        channelname: that.data.searchText,
        isbigscreen: that.data.isbigscreen,
        yingye: that.data.yingye,
      }
      request.request_get('/Newacid/getFixedSamplingPoint.hn',data,function(res){
        console.log('getFixedSamplingPoint',res);
        if(res){
          if(res.success){
            console.log(res.msg);
            var channelList = res.msg;
            channelList.sort(function(a, b) {
              return b.distance < a.distance ? 1 : -1 //正序
            })
            for(var i = 0;i<channelList.length;i++){
              channelList[i].distance = utils.setMorKm(channelList[i].distance)
              channelList[i].workingTimeArr = channelList[i].working_time.split(',');
              for(var y=0;y<channelList[i].workingTimeArr.length;y++){
                if(channelList[i].workingTimeArr[y].indexOf('：') == -1){
                  channelList[i].workingTimeArr[y] += '：全天24h'
                }
                var reg = new RegExp(":00-","g");
              channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].replace(reg,"-");
              channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].substring(0,channelList[i].workingTimeArr[y].length-3);

              if(channelList[i].workingTimeArr[y].substr(channelList[i].workingTimeArr[y].indexOf('：')+1,2) > channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2)){
                console.log(channelList[i].workingTimeArr[y].substr(channelList[i].workingTimeArr[y].indexOf('：')+1,2))
                console.log(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2))
                channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].replace(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2),'次日'+ channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2))
              }

              // if(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2)>24){ //若时间为25:00显示为次日01:00
              //   channelList[i].workingTimeArr[y] = channelList[i].workingTimeArr[y].replace(channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2),'次日'+ utils.formatNumber((channelList[i].workingTimeArr[y].substr((channelList[i].workingTimeArr[y].indexOf('-')+1),2)-24)))
              // }
              }
              // channelList[i].title = channelList[i].channel_name;
              channelList[i].id = parseInt(channelList[i].channel_id);

              if(channelList[i].yingye == 0){
                channelList[i].iconPath = '../../images/icon_position_02.png';
              }else{
                channelList[i].iconPath = '../../images/icon_position_04.png';
              }
              channelList[i].width = 30;
              channelList[i].height = 30;
              channelList[i].zIndex = 0;

              // channelList[i].callout = {
              //   content: channelList[i].channel_name,
              //   color: '#ff0000',
              //   fontSize: 14,
              //   borderWidth: 2,
              //   borderRadius: 10,
              //   borderColor: '#fff',
              //   bgColor: '#fff',
              //   padding: 5,
              //   display: 'ALWAYS',
              //   textAlign: 'center'
              // }
            }
            that.setData({
              channelList: channelList,
              channelListOld: channelList,
              hiddenFlag:false,
              overflowFlag:false
            })

            if(that.data.searchText || that.data.lableid || that.data.isbigscreen){
              if(that.data.channelList.length == 0){
                that.setData({
                  tip: '没有搜索到该采样点',
                  overflowFlag:true //禁止y轴搜索
                //  flagCheck: true
                });
              }else{
                that.setData({
                  longitude:that.data.channelList[0].longitude, //经度
                  latitude:that.data.channelList[0].latitude //纬度
                })
              }
            }
          }else{
          // box.showToast(res.msg);
          }
        }else{
          //box.showToast("网络不稳定，请重试");
        }
      })
    }
  })
  
},
bindDetail:function(e){
  var circulation_num = e.currentTarget.dataset.id;
  console.log("circulation_num="+circulation_num)
  wx.navigateTo({
    url: 'goodsDetail?circulation_num='+circulation_num,
  })
},

  tabSelect(e) {
    var status = e.currentTarget.dataset.id;
    console.log("tabSelect "+status)
    var that = this;
   
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      status: status,
      page:1,
      circulationList:[],
      tip:'',
      alreadyChecked:false
    })
    //  that.getCirculationList();
  },

  // getCirculationList: function () {
  //   var that = this;
  //   console.log('当前页数='+that.data.page)
	// 	console.log('circulationList='+that.data.circulationList)
	// 	console.log('hasMoreData='+that.data.hasMoreData)
  //   console.log('status='+that.data.status)
  //   var status = that.data.status;
  //   var create_person_id = app.globalData.userInfo.id;
  //   var data = {
  //     create_person_id: create_person_id,
  //     status: status, //流转类型
  //     pageNum: that.data.page, //页数
	// 		pageCount: that.data.pageSize //每页数据
  //   }
  //   request.request_get('/stockout/getCirculation.hn', data, function (res) {
  //     console.info('回调', res)
  //     if (res) {
  //       if (res.success) {
	// 				var circulationListTemp = that.data.circulationList;
  //         var circulationList = res.msg;
          
  //         if(circulationList.length == 0 && that.data.page == 1 ){
  //           that.setData({
  //             tip:"暂无数据",
  //             alreadyChecked:true,
	// 						alreadyChecked_temp:true
	// 					})
  //         }else if(circulationList.length < that.data.pageSize){
	// 					that.setData({
	// 						hasMoreData:false,
  //             page: that.data.page + 1,
  //             tip:"没有更多数据了",
  //             alreadyChecked:true,
	// 						alreadyChecked_temp:false
	// 					})
	// 				}else{
	// 					that.setData({
	// 						hasMoreData:true,
  //             page: that.data.page + 1,
  //             tip:"加载中",
  //             alreadyChecked:true,
	// 						alreadyChecked_temp:false
	// 					})
  //         }
         
	// 				circulationList = circulationListTemp.concat(circulationList);
  //         // circulationList.sort(function(a, b) {
	// 				// 	return b.time < a.time ? 1 : -1 //正序
  //         // })
  //         that.setData({
  //           circulationList: circulationList
  //         });
  //         console.log(that.data.circulationList)
  //         console.log(circulationList)
  //         console.log(circulationList.length)
  //         console.log(that.data.existData)
  //       } else {
  //         box.showToast(res.msg);
  //       }
  //     }
  //   })
  // },
  
  bindCancel:function(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认撤销？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var data = {
            circulation_num: e.currentTarget.dataset.id,
          }
          request.request_get('/stockout/cancelCirculation.hn', data, function (res) {
            console.info('cancelCirculation回调', res)
            if (res) {
              if (res.success) {
                wx.showToast({
                  title: '撤销成功',
                })
                that.getCirculationList();
              } else {
                box.showToast(res.msg);
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  phoneCall: function (e) {
    var that = this;
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
  //利用js进行模糊查询
  searchChangeHandle: function(e) {
    this.setListData();
    this.setData({
      searchText: e.detail.value
    })
    console.log("input-----"+e.detail.value)
    this.getChannelList();

    // var value = e.detail.value;
    // var that = this;
    // var channelList = that.data.channelListOld;
    // var channelListPlus = that.data.channelListPlus
    // if (value == '' || value == null) {
    //   that.setData({
    //     flag1: true,
    //     flag2: false,
    //     tip: '',
    //     overflowFlag:false,
    //     channelList: channelList
    //   })
    // } else {
    //    //  if (e.detail.cursor) { //e.detail.cursor表示input值当前焦点所在的位置
    //     var that = this;
    //     that.setData({
    //       flag1: false,
    //       flag2: true,
    //       tip:'',
    //       overflowFlag:false
    //     })
    //     var arr = [];
    //     for (var i = 0; i < channelList.length; i++) {
    //       if (channelList[i].channel_name.indexOf(value) >= 0 || channelList[i].site_description.indexOf(value) >= 0) {
    //         channelList[i].checked = false;
    //         arr.push(channelList[i]);
    //       }
    //     }
    //     console.log(arr);
    //     that.setData({
    //       channelListPlus: arr,
    //       channelListPlusOld: arr
    //     });
    //     if(that.data.channelListPlus.length == 0){
    //       console.log(arr);
    //       that.setData({
    //         tip: '没有搜索到该采样点',
    //         overflowFlag:true //禁止y轴搜索
    //       //  flagCheck: true
    //       });
    //     }else{
    //       that.setData({
    //         longitude:that.data.channelListPlus[0].longitude, //经度
    //         latitude:that.data.channelListPlus[0].latitude //纬度
    //       })
    //     }
    //   //}
    // }
    }, 
    //选中采样点并返回
    bindCheckSamplingPoint:function(e){
      console.log(e)
      let pages = getCurrentPages(); 
      let prevPage = pages[pages.length - 2];
      var channel_name1 = e.currentTarget.dataset.name;
       var distance1 = e.currentTarget.dataset.distance;
       var id1 = e.currentTarget.dataset.id;
       let paytypetexts = e.currentTarget.dataset.paytypetexts || [];
       let typeid = -1;
       if(paytypetexts.length > 0){
        typeid = paytypetexts[0].id;
       }
       var channel ={channel_name:channel_name1,distance:distance1,channel_id:id1}; 
       console.log(channel)             
      prevPage.setData({  
        channel: channel,
        typeid: typeid,
        bindBackFlag:true
      })
      wx.navigateBack({
        delta: 1, 
      })
    },
    // 输入框有文字时，点击X清除
    clearSearchHandle() {
      this.setListData();
     console.log('hereeeeee')
      this.setData({
          searchText: '',
          tip: '',
          overflowFlag:false
      })
      // var that = this;
      // that.setData({
      //   flag1: true,   //显示原始列表
      //   flag2: false,   //关闭查询列表
      //   channelList: this.data.channelListOld
      // })
      this.getChannelList();
     // that.getCompanyList();
    },
    chooseDistrict:function(){
      wx.navigateTo({
        url: '/pages/chooseSamplingPoint/chooseDistrict',
      })
    },
    openMap:function(e){
      console.log(e)
      wx.openLocation({
        latitude:parseFloat(e.currentTarget.dataset.latitude), //纬度
        longitude:parseFloat(e.currentTarget.dataset.longitude), //经度
        scale: 18,
        name:e.currentTarget.dataset.channelname
      })
    },
    //显示对话框
    showModal1: function(event) {
      console.log(event.markerId);
      let channel_id = event.markerId;
      if(channel_id){
        a_channel_id_plus = channel_id;
        let channelListPlusOld = this.data.channelListPlusOld;
        let channelData = [];
        let index = -1;
        if(channelListPlusOld && channelListPlusOld.length > 0){
          for(let i = 0; i < channelListPlusOld.length; i++){
            if(channelListPlusOld[i].channel_id == channel_id){
              channelData.push(channelListPlusOld[i]);
              index = i;
            }
          }
          // channelData = channelListPlusOld.filter((item)=>{
          //   return item.channel_id == channel_id;
          // })
        }
        if(a_channel_id_plus == a_channel_id_plus_old){
          // if(this.data.isFirstPlus == 1){
          //   this.setData({
          //     channelListPlus: channelData,
          //     isFirstPlus: 2
          //   });
          //   a_channel_id_plus_old = channel_id;
          // }else{

            for(let i = 0; i < channelListPlusOld.length; i++){
              if(this.data.channelListPlusOld[i].yingye == 0){
                this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_02.png';
              }else{
                this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_04.png';
              }
              this.data.channelListPlusOld[i].width = 30;
              this.data.channelListPlusOld[i].height = 30;
              this.data.channelListPlusOld[i].zIndex = 0;
            }
            this.setData({
              channelListPlus: this.data.channelListPlusOld,
              isFirstPlus: 1,
              channelListPlusOld: this.data.channelListPlusOld
            });
            a_channel_id_plus_old = -1;
          // }
        }else{
          for(let i = 0; i < channelListPlusOld.length; i++){
            if(channelListPlusOld[i].channel_id == a_channel_id_plus_old){
              if(this.data.channelListPlusOld[i].yingye == 0){
                this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_02.png';
              }else{
                this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_04.png';
              }
              this.data.channelListPlusOld[i].width = 30;
              this.data.channelListPlusOld[i].height = 30;
              this.data.channelListPlusOld[i].zIndex = 0;
            }
          }
          
          if(this.data.channelListPlusOld[index].yingye == 0){
            this.data.channelListPlusOld[index].iconPath = '../../images/icon_position_03.png';
          }else{
            this.data.channelListPlusOld[index].iconPath = '../../images/icon_position_01.png';
          }
          this.data.channelListPlusOld[index].width = 45;
          this.data.channelListPlusOld[index].height = 45;
          this.data.channelListPlusOld[index].zIndex = 9999;

          this.setData({
            channelListPlus: channelData,
            isFirstPlus: 2,
            channelListPlusOld: this.data.channelListPlusOld
          });
          a_channel_id_plus_old = channel_id;
        }
      }
    },
  showModal: function(event) {
    // if(this.data.flag1){
      let channel_id = event.markerId;
      if(channel_id){
        a_channel_id = channel_id;
        let channelList = this.data.channelList;
        let channelData = [];
        let index = -1;
        if(channelList && channelList.length > 0){
          for(let i = 0; i < channelList.length; i++){
            if(channelList[i].channel_id == channel_id){
              channelData.push(channelList[i]);
              index = i;
            }
          }
          // channelData = channelListOld.filter((item)=>{
          //   return item.channel_id == channel_id;
          // })
        }

        if(a_channel_id == a_channel_id_old){
          // if(this.data.isFirst == 1){
          //   this.setData({
          //     channelList: channelData,
          //     isFirst: 2,
          //   });
          //   a_channel_id_old = channel_id;
          // }else{

            // for(let i = 0; i < channelListOld.length; i++){
            //   if(this.data.channelListOld[i].yingye == 0){
            //     this.data.channelListOld[i].iconPath = '../../images/icon_position_02.png';
            //   }else{
            //     this.data.channelListOld[i].iconPath = '../../images/icon_position_04.png';
            //   }
            //   this.data.channelListOld[i].width = 30;
            //   this.data.channelListOld[i].height = 30;
            //   this.data.channelListOld[i].zIndex = 0;
            // }

            // this.setData({
            //   channelList: this.data.channelListOld,
            //   isFirst: 1,
            //   channelListOld: this.data.channelListOld
            // })
            a_channel_id_old = -1;

            this.getChannelList();
          // }
        }else{
          for(let i = 0; i < channelList.length; i++){
            if(channelList[i].channel_id == a_channel_id_old){
              if(this.data.channelList[i].yingye == 0){
                this.data.channelList[i].iconPath = '../../images/icon_position_02.png';
              }else{
                this.data.channelList[i].iconPath = '../../images/icon_position_04.png';
              }
              this.data.channelList[i].width = 30;
              this.data.channelList[i].height = 30;
              this.data.channelList[i].zIndex = 0;
            }
          }

          if(this.data.channelList[index].yingye == 0){
            this.data.channelList[index].iconPath = '../../images/icon_position_03.png';
          }else{
            this.data.channelList[index].iconPath = '../../images/icon_position_01.png';
          }
          this.data.channelList[index].width = 45;
          this.data.channelList[index].height = 45;
          this.data.channelList[index].zIndex = 9999;

          // 新增
          if(channelData && channelData.length > 0){
            channelData[0].callout = {
              content: channelData[0].channel_name,
              color: '#0F66F7',
              fontSize: 14,
              borderWidth: 2,
              borderRadius: 10,
              borderColor: '#fff',
              bgColor: '#fff',
              padding: 5,
              display: 'ALWAYS',
              textAlign: 'center'
            }
          }

          this.setData({
            channelList: channelData,
            isFirst: 2,
            // channelListOld: this.data.channelListOld
          })
          a_channel_id_old = channel_id;
        }
      }
    // }else{
    //   let channel_id = event.markerId;
    //   if(channel_id){
    //     a_channel_id_plus = channel_id;
    //     let channelListPlusOld = this.data.channelListPlusOld;
    //     let channelData = [];
    //     let index = -1;
    //     if(channelListPlusOld && channelListPlusOld.length > 0){
    //       for(let i = 0; i < channelListPlusOld.length; i++){
    //         if(channelListPlusOld[i].channel_id == channel_id){
    //           channelData.push(channelListPlusOld[i]);
    //           index = i;
    //         }
    //       }
    //       // channelData = channelListPlusOld.filter((item)=>{
    //       //   return item.channel_id == channel_id;
    //       // })
    //     }
    //     if(a_channel_id_plus == a_channel_id_plus_old){
    //       // if(this.data.isFirstPlus == 1){
    //       //   this.setData({
    //       //     channelListPlus: channelData,
    //       //     isFirstPlus: 2
    //       //   });
    //       //   a_channel_id_plus_old = channel_id;
    //       // }else{

    //         for(let i = 0; i < channelListPlusOld.length; i++){
    //           if(this.data.channelListPlusOld[i].yingye == 0){
    //             this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_02.png';
    //           }else{
    //             this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_04.png';
    //           }
    //           this.data.channelListPlusOld[i].width = 30;
    //           this.data.channelListPlusOld[i].height = 30;
    //           this.data.channelListPlusOld[i].zIndex = 0;
    //         }
    //         this.setData({
    //           channelListPlus: this.data.channelListPlusOld,
    //           isFirstPlus: 1,
    //           channelListPlusOld: this.data.channelListPlusOld
    //         });
    //         a_channel_id_plus_old = -1;
    //       // }
    //     }else{
    //       for(let i = 0; i < channelListPlusOld.length; i++){
    //         if(channelListPlusOld[i].channel_id == a_channel_id_plus_old){
    //           if(this.data.channelListPlusOld[i].yingye == 0){
    //             this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_02.png';
    //           }else{
    //             this.data.channelListPlusOld[i].iconPath = '../../images/icon_position_04.png';
    //           }
    //           this.data.channelListPlusOld[i].width = 30;
    //           this.data.channelListPlusOld[i].height = 30;
    //           this.data.channelListPlusOld[i].zIndex = 0;
    //         }
    //       }

    //       if(this.data.channelListPlusOld[index].yingye == 0){
    //         this.data.channelListPlusOld[index].iconPath = '../../images/icon_position_03.png';
    //       }else{
    //         this.data.channelListPlusOld[index].iconPath = '../../images/icon_position_01.png';
    //       }
    //       this.data.channelListPlusOld[index].width = 45;
    //       this.data.channelListPlusOld[index].height = 45;
    //       this.data.channelListPlusOld[index].zIndex = 9999;

    //       this.setData({
    //         channelListPlus: channelData,
    //         isFirstPlus: 2,
    //         channelListPlusOld: this.data.channelListPlusOld
    //       });
    //       a_channel_id_plus_old = channel_id;
    //     }
    //   }
    // }

    
    // if(channelData && channelData.length > 0){
    //   this.setData({
    //     myall: channelData[0]
    //   });

    //   // 显示遮罩层
    //   var animation = wx.createAnimation({
    //     duration: 200,
    //     timingFunction: "linear",
    //     delay: 0
    //   })
    //   this.animation = animation
    //   animation.translateY(300).step()
    //   this.setData({
    //     animationData: animation.export(),
    //     showModalStatus: true
    //   })
    //   setTimeout(function() {
    //     animation.translateY(0).step()
    //     this.setData({
    //       animationData: animation.export()
    //     })
    //   }.bind(this), 200)
    // }
  },
  //隐藏对话框
  hideModal: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  setListData(){
    // let channelListOld = this.data.channelListOld;
    //   if(channelListOld){
    //     for(let i = 0; i < channelListOld.length; i++){
    //         if(this.data.channelListOld[i].yingye == 0){
    //           this.data.channelListOld[i].iconPath = '../../images/icon_position_02.png';
    //         }else{
    //           this.data.channelListOld[i].iconPath = '../../images/icon_position_04.png';
    //         }
    //         this.data.channelListOld[i].width = 30;
    //         this.data.channelListOld[i].height = 30;
    //         this.data.channelListOld[i].zIndex = 0;
    //     }
    //     this.setData({
    //       channelListOld: this.data.channelListOld
    //     });
    //   }
    
      // this.setData({
      //   channelListPlusOld: []
      // });

      a_channel_id_plus = -1;
      a_channel_id = -1;
      a_channel_id_plus_old = -1;
      a_channel_id_old = -1;
  },
  bindLable(e){
    let lableIndex = e.currentTarget.dataset.lableindex;
    let lableid = e.currentTarget.dataset.lableid;
    let lableidList = this.data.lableidList;
    if(lableid){
      for(let i = 0; i < this.data.lableList.length; i++){
        if(lableid == this.data.lableList[i].id){
          if(this.data.lableList[i].isSelect){
            this.data.lableidList.splice(this.data.lableidList.findIndex( index => index == lableid), 1)
            this.data.lableList[i].isSelect = false;
          }else{
            lableidList.push(lableid);
            this.data.lableList[i].isSelect = true;
          }
        }
      }
    }
    this.setData({
      lableList: this.data.lableList,
      lableidList: lableidList,
      // lableid: this.data.lableidList.join(',')
    });
    
    let yingyeParams = 1;
    let isbigscreenParams = 2;
    if(this.data.lableidList.indexOf(yingyeParams) != -1 || this.data.lableidList.indexOf(isbigscreenParams) != -1){
      let arrSp = [];
      let yingye = '';
      let isbigscreen = '';
      for(let i = 0; i < this.data.lableidList.length; i++){
        if(this.data.lableidList[i] == yingyeParams){
          yingye = 1;
        }else if(this.data.lableidList[i] == isbigscreenParams){
          isbigscreen = 1;
        }else{
          arrSp.push(this.data.lableidList[i]);
        }
      }

      this.setData({
        isbigscreen: isbigscreen,
        yingye: yingye,
        lableid: arrSp.join(',')
      });
    }else{
      this.setData({
        isbigscreen: '',
        yingye: '',
        lableid: this.data.lableidList.join(',')
      });
      
    }
    this.getChannelList();
  }
})