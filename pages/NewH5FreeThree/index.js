const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
const wxbarcode = require('../../utils/wxbarcode.js');


 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    free_num: '',
    name: '',
    gender: '',
    age: '',
    card_type: '',
    id_card: '',
    phone: '',
    time: '',

    user_id: '',
    isShowPages: false,
  },

  onShow:function(){
   
  
},
onLoad:function(options){

  this.setData({
    user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
  });

  var that = this;
  var free_num = options.free_num;
  
  
  wxbarcode.barcode('barcode', free_num, 490, 160); //注意在wxml中设置一个如代码id为barcode的wxml容器
  
  that.setData({
    free_num:free_num,
  })
 
  that.getAppointmentInfo();
},
getAppointmentInfo: function () {

  var that = this;
  var free_num = that.data.free_num;
  request.request_get('/Newacid/getsamplingbycode.hn', {
    information_code: free_num
  }, function (res) {
    console.info('回调', res)
    if (res) {
      if (res.success) {
        that.setData({
          isShowPages: true
        });
        var info = res.msg;
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
        
        that.setData({
          name: info.name,
          gender: info.gender,
          age: info.age,
          id_card: info.id_card,
          phone: info.phone,
          time: info.time,
        })

      } else {
        box.showToast(res.msg);
      }
    }else{
      box.showToast("网络不稳定，请重试");
    }
  })
},
})