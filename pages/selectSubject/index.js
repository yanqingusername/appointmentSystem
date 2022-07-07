// pages/myOrder/myOrder.js
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "选择受检人",
    dataList: [],
    isMine: 0
  },
  onShow: function () {
    let that = this;
    //获取全局openid，如果获取不到，则重新授权一次
    let openid = app.globalData.openid;
    console.log(openid);
    if (openid == '' || typeof (openid) == 'undefined' || openid == undefined) {
      wx.login({
        success: (resp) => {
          var code = resp.code;
          console.log("获取code成功" + code);
          request.request_get('/a/getOpenid.hn', {
            code: code
          }, function (res) {
            console.info('回调', res);
            //判断为空时的逻辑
            if (!res) {
              box.showToast("网络不稳定，请重试");
              return;
            }
            if (!res.success) {
              box.showToast(res.msg);
              return;
            }
            app.globalData.openid = res.msg;
            console.log("获取的用户openid" + app.globalData.openid);
            if(res.msg && res.msg != undefined && typeof (res.msg) != 'undefined'){
              that.getAllSubject();
            }
          });
        },
        fail: () => {
          box.showToast("请求超时，请检查网络是否连接")
        }
      })
    } else {
      that.getAllSubject();
    }
  },
  onLoad: function (options) {
    this.setData({
      isMine: options.isMine
    });
  },
  getAllSubject(){
    let that = this;
    var openid = app.globalData.openid;
    let data = {
      open_id: openid
    }
    request.request_get('/a/getAllSubject.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            dataList: res.msg
          })
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  /**
   * 添加受检人
   */
  bindAddSubject(){
    wx.navigateTo({
      url:`/pages/addSubject/index?isAddSub=1&isMine=${this.data.isMine}`
    });
  },
  /**
   * 选择受检人
   */
  bindSelectSubject(e){
    if(this.data.isMine == 1){

    }else{
      let item = e.currentTarget.dataset.item;
      console.log('--item-->:',item)
      if(item){
        let pages = getCurrentPages(); 
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
          isAddSubject: 1,
          userinfo_id: item.id,
          name: item.name,
          gender: item.gender,
          age: item.age,
          cardIndex: item.card_type,
          idcard: item.id_card,
          phone: item.phone,
          onlineFlagNum: item.onlineFlag,
          onlineFlag: item.onlineFlag == 1 ? false : true,
          card_name: item.card_type == 1 ? '护照' : item.card_type == 2 ? '港澳台通行证' : '身份证'
        })
        wx.navigateBack({
          delta: 1, 
        })
      }
    }
  },
  /**
   * 编辑受检人
   */
  bindEditSubject(e){
    let online = e.currentTarget.dataset.online; // 0-线上  1-线下
    let item = e.currentTarget.dataset.item;
    let jsonItem = JSON.stringify(item);
    console.log('--item-->:',item)
    if(online&&item){
      wx.navigateTo({
        url:`/pages/addSubject/index?isAddSub=2&title=编辑受检人&online=${online}&jsonItem=${jsonItem}&isMine=${this.data.isMine}`
      });
    }
  }
})