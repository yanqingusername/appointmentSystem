const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    user_id: '',
    userInfo: {},
    typeid: 1,
  },
  onShow: function () {

  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      typeid: options.typeid
    });
  },
  onReachBottom: function () {
    console.log('1111')
  },
  clickTab(e){
    let typeid = e.currentTarget.dataset.typeid;
    this.setData({
      typeid: typeid
    });
  }
})