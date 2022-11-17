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
    searchText: '',
    page: 1,
    limit: 20,
    shopList:[]
  },
  onShow: function () {

  },
  onLoad: function (options) {
    this.setData({
      class_id: options.id || '',
      class_title: options.title,
    });
    if(this.data.class_id){
      this.getSearchShopList();
    }
  },
  onReachBottom: function () {
    // this.setData({
    //   page: 1
    // });
    this.getSearchShopList();
  },
  //利用js进行模糊查询
  searchChangeHandle: function (e) {
    this.setData({
      searchText: e.detail.value,
      page: 1
    });
    this.getSearchShopList();
  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
    this.setData({
      searchText: '',
      page: 1
    });
    this.getSearchShopList();
  },
  handleRouter(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
    });
  },
  /**
   * 获取搜索商品列表
   */
   getSearchShopList: function () {
    var that = this;
    var data = {
      product_type: this.data.class_id,
      product_name: this.data.searchText,
      page: this.data.page,
      limit: this.data.limit
    }
    request.request_get('/Newacid/getSearchShopList.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if (that.data.page == 1) {
            that.setData({
              shopList: res.msg,
              page: (res.msg && res.msg.length > 0) ? that.data.page + 1 : that.data.page
            });
          } else {
            that.setData({
              shopList: that.data.shopList.concat(res.msg || []),
              page: (res.msg && res.msg.length > 0) ? that.data.page + 1 : that.data.page,
            });
          }
        } else {
          //box.showToast(res.msg);
        }
      }
    });
  },
});