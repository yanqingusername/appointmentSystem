// pages/myOrder/myOrder.js
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
const wxbarcode = require('../../utils/wxbarcode.js');


 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    dynamicTimeFlag:0,
    code_informationList:[12345678900012,12345678900013,12345678900014],
    setInter: '', 
    imgSrc:'',//图片
    onlineFlag:false,
    support_id:"",
    TabCur: 0,
    status: 1,
    payment_channel:'wechat',
    statusList: [ '已接单','已完成', '用户评价'],
    back_color:'#418BE4',
    hasMoreData:true,
    alreadyChecked:false,
    isIphoneX:false,
    tip:"暂无数据",
    tip_temp:'暂无数据',
    appointment_num:0,
    continueFlag:false,
    swiperCurrent:0,
    movies:[],
    yysj1:'',
    yysj2:''
  },

  onShow:function(){
   var that = this;
   console.log('成功onshow+++++++++++')
   wx.getStorage({//获取本地缓存
    key:"jumpStatus",
    success:function(res){
      console.log(res.data);
      if(res.data == 1){
        that.jumpTabSelect(1);
      } else if (res.data == 2){
        that.jumpTabSelect(2);
      }
    }})	
  
},
onLoad:function(options){
  var that = this;
  that.getBannerList();
  var appointment_num = options.appointment_num;
  var onlineFlagNum = options.onlineFlagNum;
  var continueFlag = options.continueFlag;
  var dynamicTimeFlag = options.dynamicTimeFlag;
  console.log(appointment_num)
  console.log(onlineFlagNum)
  console.log(continueFlag)
  // var support_id = app.globalData.userInfo.id;
  
  wxbarcode.barcode('barcode', appointment_num, 490, 160); //注意在wxml中设置一个如代码id为barcode的wxml容器
  if(onlineFlagNum==0){
    that.setData({
      hint_font_1:'线上已绑定信息',
      hint_font_2:'请到约定采样点进行采样'
    })
  }else{
    that.setData({
      hint_font_1:'刷卡身份证',
      hint_font_2:'请向工作人员出示二代身份证证件'
    })
  }
  that.setData({
    appointment_num:appointment_num,
    continueFlag:continueFlag,
    onlineFlagNum:onlineFlagNum,
    dynamicTimeFlag:dynamicTimeFlag,
    "isIphoneX": this.isIphoneX()
  })
  console.log(that.data.continueFlag)
  console.log(that.data.isIphoneX)
  that.getAppointmentInfo();
  // that.canvasToTempImage();
},
isIphoneX() {
  let info = wx.getSystemInfoSync();
  if (/iPhone X/i.test(info.model)) {
    return true;
  } else {
    return false;
  }
},
getAppointmentInfo: function () {
  var that = this;
  var appointment_num = that.data.appointment_num;
  var open_id = app.globalData.openid
  console.info(appointment_num,open_id)
  request.request_get('/a/getPersonTestDetails.hn', {
    appointment_num: appointment_num,
    open_id:open_id
  }, function (res) {
    console.info('回调', res)
    if (res) {
      if (res.success) {
        var info = res.msg;
        if(info.payment_type==0){
          that.setData({
            payment_way:'线上支付（公众号）'
          })
        }else if(info.payment_type==5){
          that.setData({
            payment_way:'核销码（美团）'
          })
        }else if(info.payment_type==2){
          that.setData({
            payment_way:'免费'
          })
        }else if(info.payment_type==3){
          that.setData({
            payment_way:'微信支付'
          })
        }
    
        if(info.card_type==0){
          that.setData({
            card_type:'二代身份证'
          })
        }else if(info.card_type==1){
          that.setData({
            card_type:'护照'
          })
        }else if(info.card_type==2){
          that.setData({
            card_type:'港澳台通行证'
          })
        }
        var workingTimeArr = info.working_time.split(',');
              for(var i=0;i<workingTimeArr.length;i++){
                var reg = new RegExp(":00:00","g");
               workingTimeArr[i] = workingTimeArr[i].replace(reg,":00");
              }
        that.setData({
          name:info.name,
          id_card:info.id_card,
          phone:info.phone,
          channel_name:info.channel_name,
          payment_amount:info.payment_amount,
          create_time:info.create_time,
          test_type:info.test_type,
          type: info.type,
          info: info,
          workingTimeArr:workingTimeArr,
          latitude:info.latitude,
          longitude:info.longitude,
          yysj1:info.yysj1,
          yysj2:info.yysj2,
          verification_code: info.verification_code,
          payment_type: info.payment_type
        })
        console.log('creator_id' + that.data.creator_id)
        console.log('app.globalData.userInfo.id' + app.globalData.userInfo.id)

      } else {
        box.showToast(res.msg);
      }
    }else{
      box.showToast("网络不稳定，请重试");
    }
  })
},

bindBack:function(){
  var that =this
  if(that.data.payment_way=='微信支付'){
    console.log('微信支付')
    wx.redirectTo({
      url: '/pages/onsiteAppointment/onsiteAppointment?choose_type='+0+'&fromContinueFlag=true'+'&dynamicTimeFlag='+that.data.dynamicTimeFlag,
    })
  }else{
    wx.redirectTo({
      url: '/pages/onsiteAppointment/onsiteAppointment?choose_type='+1+'&fromContinueFlag=true',
    })
  }
  },
  bindBackIndex:function(){
    var that =this
   
      wx.redirectTo({
        url: '/pages/index/index'
      })
   
    },
  toInfo:function(e){
		// var id = e.currentTarget.dataset.id;
		// 	wx.navigateTo({
		// 		url: '/pages/orderDetail/orderDetail?id=' + id,
		// 	})
		
  },
  phoneCall: function (e) {
    var that = this;
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: '4008693888',
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },

  // 删除物资条码
  del_code(e) { //删除物资条码
    let that = this;
    console.log('点击删除物资条码===>', e);
    let index = e.currentTarget.dataset.index;
    let codeList = that.data.code_informationList;
    wx.showModal({
      title: '提示',
      content: '确认删除该物资？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          codeList.splice(index, 1);
          that.setData({
            code_informationList: codeList
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          console.log(that.data.code_informationList)
        }
      }
    })
  },
  // // 生成图片方法
  // canvasToTempImage: function () {
  //   var that = this
  //   var destWidth = Math.round(wx.getSystemInfoSync().windowWidth * 490 / 750);
    
  //   var destHeight = Math.round(wx.getSystemInfoSync().windowWidth * 160 / 750)
  //   console.log(destWidth,destHeight)
  //   wx.showToast({
  //     title: '条形码绘制中',
  //     icon:'none'
  //   })
  //   setTimeout(function() {     ///    定时器
  //     wx.canvasToTempFilePath({
  //       canvasId: "barcode",
      
  //       destWidth:destWidth,
  //       destHeight:destHeight,
  //       success: (res) => {
  //         console.log(res)
  //          let tempFilePath = res.tempFilePath;
  //          that.setData({
  //             imgSrc: tempFilePath,
  //          });
  //          wx.hideToast({
  //            success: (res) => {},
  //          })
  //       }
  //    }, this);
  //  }, 500);
  // },
 
  openMap:function(e){
    console.log(e)
        wx.openLocation({
          latitude:parseFloat(e.currentTarget.dataset.latitude), //纬度
          longitude:parseFloat(e.currentTarget.dataset.longitude), //经度
          scale: 18,
          name:e.currentTarget.dataset.channelname
        })
  },
  getBannerList: function () {
    var that = this;
    console.log('open_id='+app.globalData.openid)
    var open_id = app.globalData.openid;
    var data = {
      type:4
    }
    request.request_get('/activity/getBannerInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          console.log(res.msg);
            that.setData({
              movies:res.msg
            })
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  goYYJL:function(){
    wx.navigateTo({
      url: '/pages/appointmentRecord/appointmentRecord'
    })

  },
  //轮播图的切换事件
  swiperChange: function(e) {
    console.log(e)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  //点击图片触发事件 
  swipclick: function(e) {
    console.log(this.data.swiperCurrent);
    console.log(this.data.links);
    let open_way= this.data.movies[this.data.swiperCurrent].open_way
    let icon= this.data.movies[this.data.swiperCurrent].icon
    if(open_way==0){
      wx.navigateTo({
        url: icon
      })
    }else if(open_way==1){
      wx.navigateTo({
        url: '/pages/index/article?url='+icon
      })
    }else{
      app.globalData.article = icon
      wx.navigateTo({
        url: '/pages/index/article'
      })
    }
  }
})