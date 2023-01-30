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
    title: "受检人管理",
    dataList: [],
    isMine: 0,
    user_id: '',
    openid: '',
  },
  onShow: function () {
    let that = this;
    
      that.getAllSubject();
  },
  onLoad: function (options) {
    this.setData({
        user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
        openid: wx.getStorageSync('coyote_userinfo').openid || '',
      isMine: options.isMine
    });
  },
  getAllSubject(){
    let that = this;
    let data = {
      open_id: this.data.openid,
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/getAllSubject.hn', data, function (res) {
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
          card_name: item.card_type == 1 ? '护照' : item.card_type == 2 ? '港澳台通行证' : '身份证',
          birth: item.birth
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