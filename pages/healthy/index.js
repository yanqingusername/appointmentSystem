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
    coupon_status: 3, //0未使用，1已使用，2已过期，3未领取
    use_status: 1, //0是领了  1是没领

    shopList:[],
    page: 1,
    limit: 20
  },
  onShow: function () {
    this.setData({
      page: 1
    });
    // this.getMainShopList();
    this.getCoupon();

    this.getBannerList();
  },
  onLoad: function () {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || ''
    });
    this.getBannerList();

    this.getCoupon();

    this.getMainShopList();
  },
  handlerSearchClick: function () {
    wx.navigateTo({
      url: '/healthyshop/pages/healthysearch/index'
    });
  },
  //轮播图的切换事件
  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    });
  },
  //点击图片触发事件 
  swipclick: function(e) {
    let open_way= this.data.movies[this.data.swiperCurrent].open_way
    if(open_way==0){
      let wx_href= this.data.movies[this.data.swiperCurrent].wx_href
      wx.navigateTo({
        url: wx_href
      })
    }else if(open_way==1){
      let h5_href= this.data.movies[this.data.swiperCurrent].h5_href
      wx.navigateTo({
        url: `/healthyshop/pages/mainH5/index?url=${h5_href}`
      })
    }else{
      
    }
  },
  /**
   * 分类icon 点击事件
   */
  handlerClassClick: function (e) {
    let id = e.currentTarget.dataset.id;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: `/healthyshop/pages/healthysearch/index?id=${id}&title=${title}`
    });
  },
  /**
   * 优惠券点击事件
   */
  handlerCouponClick: function (e) {
    let couponstatus = e.currentTarget.dataset.couponstatus;
    let couponname = e.currentTarget.dataset.couponname;
    let id = e.currentTarget.dataset.id;
    if(id && couponname){
      if(couponstatus == 1){
        this.getReceiveCoupon(id,couponname);
      }else{
        // box.showToast('您已领取过了~');
        box.showToast("请在本页选择商品使用");
      }
    }
  },
  /**
   * 商品详情页 跳转 点击事件
   */
  handleRouter: function (e) {
    let shopid = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${shopid}`
    });
  },
  onReachBottom: function () {
    this.getMainShopList();
  },
  /**
   * 获取banner
   */
  getBannerList: function () {
    let that = this;
    let data = {
      type: 1
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
    let data = {
      user_id: this.data.user_id
    }

    request.request_get('/Newacid/getCouponMainInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res.msg && res.msg.length > 0){
            let coupon_info = res.msg[0];
            that.setData({
              coupon_code: coupon_info.coupon_code,
              coupon_discount_amount: coupon_info.discount_amount,
              coupon_limit_amount: coupon_info.limit_amount,
              coupon_name: coupon_info.name,
              coupon_time: coupon_info.time,
              use_status: coupon_info.use_status,
            });
          }
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 领取优惠券
   */
   getReceiveCoupon: function (id,couponname) {
    let that = this;
    let data = {
      coupon_code: id,
      user_id: this.data.user_id,
      coupon_name: couponname
    }
    request.request_get('/Newacid/getReceiveCoupon.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            use_status: 0
          });
        } else {
          //box.showToast(res.msg);
        }
      }
    });
  },
  /**
   * 获取商品列表
   */
   getMainShopList: function () {
    let that = this;
    let data = {
      page: that.data.page,
      limit: that.data.limit
    }
    request.request_get('/Newacid/getMainShopList.hn', data, function (res) {
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