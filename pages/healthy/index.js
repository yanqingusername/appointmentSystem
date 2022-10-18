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
    isIndicatorDots: false,
    swiperCurrent: 0,

    isLogin: false,
    user_id: '',
    userInfo: {},
    coupon_code: "",
    coupon_discount_amount: '', //（优惠金额）
    coupon_limit_amount: '', //(如果传了就是有门槛的优惠券 没传就是无门槛)
    coupon_name:'', // "新人优惠券无门槛",
    coupon_time:'', //"有效期为领取后3天内",

    isReceiveCoupon: false,
    shopList:[
      {
        id:'1',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'2',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'3',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'4',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'5',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      }
    ]
  },
  onShow: function () {

  },
  onLoad: function () {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || ''
    });
    this.getBannerList();

    this.getCoupon();
  },
  handlerSearchClick() {
    wx.navigateTo({
      url: '/healthyshop/pages/healthysearch/index'
    });
  },
  //轮播图的切换事件
  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  //点击图片触发事件 
  swipclick: function (e) {
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
  handlerClassClick(e) {
    let id = e.currentTarget.dataset.id;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: `/healthyshop/pages/healthysearch/index?id=${id}&title=${title}`
    });
  },
  /**
   * 优惠券点击事件
   */
  handlerCouponClick() {
    let id = e.currentTarget.dataset.id;

  },
  handleRouter(e) {
    let shopid = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${shopid}`
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
      type: 2
    }
    request.request_get('/Newacid/getBannerInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            movies: res.msg
          });
          if (that.data.movies.length > 1) {
            that.setData({
              isIndicatorDots: true
            });
          }
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 获取优惠券
   */
   getCoupon: function () {
    let that = this;
    let data = {}

    request.request_get('/Newacid/getCouponMainInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            coupon_code: res.coupon_code,
            coupon_discount_amount: res.discount_amount,
            coupon_limit_amount: res.limit_amount,
            coupon_name: res.name,
            coupon_time: res.time,
          });
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 领取优惠券
   */
   getReceiveCoupon: function (id) {
    let that = this;
    let data = {
      coupon_id: id
    }
    request.request_get('/activity/getReceiveCoupon.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            isReceiveCoupon: true
          });
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 获取商品列表
   */
   getShopList: function () {
    var that = this;
    var data = {
      type: 1
    }
    request.request_get('/activity/getShopList.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if (that.data.page == 1) {
            that.setData({
              shopList: res.msg,
              page: (res.data.data && res.data.data.length > 0) ? that.data.page + 1 : that.data.page
            })
          } else {
            that.setData({
              shopList: that.data.goodList.concat(res.data.data || []),
              page: (res.data.data && res.data.data.length > 0) ? that.data.page + 1 : that.data.page,
            })
          }
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
})