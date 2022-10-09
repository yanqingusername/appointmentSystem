const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies: [],
    swiperCurrent: 0,

    isLogin: false,
    user_id: '',
    userInfo: {},

  },
  onShow: function () {

  },
  onLoad: function () {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || ''
    });
    this.getBannerList()
  },
  handlerSearchClick() {
    wx.navigateTo({
      url: '/healthyshop/pages/healthysearch/index'
    });
  },
  handlerClassClick(e) {
    let id = e.currentTarget.dataset.id;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: `/healthyshop/pages/healthysearch/index?id=${id}&title=${title}`
    });

  },
  handlerCouponClick() {

  },
  handleRouter(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
    });
  },
  onReachBottom: function () {
    console.log('1111')
  },
  /**
   * 获取banner
   */
  getBannerList: function () {
    var that = this;
    var data = {
      type: 1
    }
    request.request_get('/activity/getBannerInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          console.log(res.msg);
          that.setData({
            movies: res.msg
          })
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  //轮播图的切换事件
  swiperChange: function (e) {
    //console.log(e)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  //点击图片触发事件 
  swipclick: function (e) {
    console.log(this.data.swiperCurrent);
    console.log(this.data.links);
    let open_way = this.data.movies[this.data.swiperCurrent].open_way
    let icon = this.data.movies[this.data.swiperCurrent].icon
    if (open_way == 0) {
      wx.navigateTo({
        url: icon
      })
    } else if (open_way == 1) {
      app.globalData.article = icon
      wx.navigateTo({
        url: '/pages/index/article?url=' + icon
      })
    } else {
      app.globalData.article = icon
      wx.navigateTo({
        url: '/pages/index/article'
      })
    }
  },
})