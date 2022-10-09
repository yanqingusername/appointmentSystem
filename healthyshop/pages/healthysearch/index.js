const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    class_id: "",
    class_title:"搜索",
    searchText: ''
  },
  onShow: function () {

  },
  onLoad: function (options) {
    this.setData({
      class_id: options.id,
      class_title: options.title,
    });
  },
  onReachBottom: function () {
    console.log('1111')
  },
  //利用js进行模糊查询
  searchChangeHandle: function (e) {
    this.setData({
      searchText: e.detail.value
    })
  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
    this.setData({
      searchText: '',
    });
    // this.getChannelList();
  },
  handleRouter(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
    });
  }
})