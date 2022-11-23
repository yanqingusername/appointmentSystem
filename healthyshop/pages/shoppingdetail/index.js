// index.js
// 获取应用实例
const app = getApp()
const box = require('../../../utils/box.js')
const updateApp = require('../../../utils/updateApp.js')
const request = require('../../../utils/request.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
"use strict";

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    StatusBar: app.globalData.StatusBar,
    isLogin: false,
    user_id: '',
    phone_number: '',
    userInfo: {},
    dialogData: {},
    swiperCurrent:0,
    
		shopid:'', // 商品id
    shopimage:[],  // 商品顶部头图
    subtitle:"", // 商品副标题
    title: "", // 商品标题
    price: "", // 商品价格
    oldprice: "", // 商品原价格
		freeshipping: "", // 商品标签
		shopdetailimg:[],  // 商品详情图
		isGrounding: 0, //商品是否上架 0-上架  1-下架
    product_type: "", //商品种类id

    couponList: [],
    couponListOld: [],
    isMoreCoupon: true,

    moreShopList: [],

    bottomLift: 15,
    numberType: '1',
  },
  onShow: function () {
    // this.setData({
    //   user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    // });

    // this.getShopInfo();
    // this.getCouponShopInfo();
  },
  onLoad(options) {
    let that = this;
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      // if (scene) {
      //   let _id = scene.split("&")[0];
      // }
      if(scene.indexOf('shopid') != -1){  //查到
        var shopid = scene.substr((scene.indexOf('=')+1));
        that.setData({
          shopid:shopid
        });
      }
    } else {
      this.setData({
        shopid: options.shopid
      });
    }

    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      // shopid: options.shopid
    });
    this.getbaseData();

    this.getBottomLift();

    this.getShopInfo();
    this.getCouponShopInfo();
  },
  getBottomLift(){
    let that = this;
    //获取当前设备信息
    wx.getSystemInfo({
      success: res => {
        let bottomLift = res.screenHeight - res.safeArea.bottom;
        if(bottomLift>0){
          that.setData({
            bottomLift: bottomLift
          });
        }
      },
      fail(err) {
        console.log(err);
      }
    });
  },
  isIphoneX() {
    let info = wx.getSystemInfoSync();
    let modelmes = info.model;

    if (modelmes.search('iPhone XR') != -1 || modelmes.search('iPhone XS') != -1 || modelmes.search('iPhone 11') != -1 || modelmes.search('iPhone 11 Pro Max') != -1 || modelmes.search('iPhone 12 Pro Max') != -1 || modelmes.search('iPhone 13 Pro Max') != -1 || modelmes.search('iPhone 12/13 Pro Max') != -1) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * 获取用户服务协议
   * 获取隐私政策
   */
   getbaseData: function () {
    let that = this;
    let data = {};
    request.request_get('/Newacid/getbaseInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          let msg = res.msg;
          that.setData({
            dialogData: {
              fwxy_url: msg.fwxy_url,
              yszz_url: msg.yszz_url,
            }
          })
        }
      }
    })
  },
  /**
   * 获取商品详情
   */
   getShopInfo: function () {
    let that = this;
    let data = {
      product_code: this.data.shopid,
    }
    request.request_get('/Newacid/getShopInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res && res.msg){
            that.setData({
              shopid: res.msg.product_code, // 商品id
              shopimage: res.msg.headImg,  // 商品顶部头图
              subtitle: res.msg.subtitle, // 商品副标题
              title: res.msg.title, // 商品标题
              price: res.msg.price, // 商品价格
              oldprice: res.msg.oldprice, // 商品原价格
              freeshipping: res.msg.tips, // 商品标签
              shopdetailimg: res.msg.img,  // 商品详情图
              isGrounding: res.msg.is_use, // 商品是否上架 0-上架  1-下架
              product_type: res.msg.product_type // 商品种类id
            });

            that.getMoreShopList();
          }
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
  /**
   * 获取商品详情优惠卷
   */
   getCouponShopInfo: function () {
    let that = this;
    let data = {
      product_code: this.data.shopid,
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/getCouponShopInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res.msg && res.msg.length > 2){
            let arr = [];
            for (let i = 0; i < 2; i++) {
              arr.push(res.msg[i]);
            }
            that.setData({
              isMoreCoupon: true,
              couponList: arr,
              couponListOld: res.msg
            });
          }else{
            that.setData({
              isMoreCoupon: true,
              couponList: res.msg,
              couponListOld: res.msg
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
  // 获取 code
  getCode(success) {
    wx.login({
      success: _Code => {
        this.setData({
          rs_code: _Code.code
        });
        success();
      }
    })
  },
  getUserProfile() {
    this.getCode(() => {});
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.bindGetUserInfo(res);
      },
      fail: (res) => {
      }
    })
  },
  // 授权用户信息
  bindGetUserInfo(e) {
    let that = this;
    const OK = "getUserProfile:ok"
    if (e.errMsg == OK) {
      // 判断 session_key 有无到期
      wx.checkSession({
        success: res => {
          that.USRE(e)
        },
        fail: res => {
          that.getCode(() => {
            that.USRE(e)
          })
        }
      })
    } else {
      
    }
  },
  USRE(e) {
    let that = this;
    request.request_get('/Newacid/getUseridAndUserInfo.hn', {
      code: this.data.rs_code,
      encryptedData: e.encryptedData,
      iv: e.iv,
    }, function (res) {
      //判断为空时的逻辑
      if (res) {
        if (res.success) {
          that.setData({
            isLogin: true,
            userInfo: {
              openid: res.openid,
              unionid: res.unionid,
              user_id: res.userid,
              avatarUrl: res.userInfo12.avatarurl,
              nickName: res.userInfo12.nickname,
            }
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindPhoneNumber(e) {
    let user_info = this.data.userInfo;
    user_info.phone_number = '';
    this.setData({
      userInfo: user_info,
      user_id: this.data.userInfo.user_id
    });
    wx.setStorageSync('coyote_userinfo', user_info);

    this.getNewUserinfo();

    this.getShopInfo();
    this.getCouponShopInfo();

    e = e.detail;
    // 用户同意授权
    const OK = 'getPhoneNumber:ok'
    if (e.detail.errMsg == OK) {
      this.TEL(e)
    } else {
      this.setUrl();
    }
  },
  TEL(e) {
    let that = this;
    let DATA = {
      user_id: this.data.userInfo.user_id,
      code: e.detail.code
    }
    request.request_get('/Newacid/getPhoneNumber.hn', DATA, function (res) {
      //判断为空时的逻辑
      if (res) {
        if (res.success) {
          let user_info = that.data.userInfo;
          user_info.phone_number = res.phoneNumber;
          that.setData({
            phone_number: res.phoneNumber,
            userInfo: user_info,
          });
          // 本地存储
          wx.setStorageSync('coyote_userinfo', user_info);

          that.setUrl();

        } else {
          box.showToast(res.msg, '', 1000);

          setTimeout(() => {
            that.setUrl();
          }, 1200);

        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindShowDialog() {
    this.setData({
      isLogin: false
    });
  },
  /**
   * 获取用户信息
   */
  getNewUserinfo() {
    let that = this;
    request.request_get('/Newacid/getNewUserinfo.hn', {
      user_id: this.data.user_id
    }, function (res) {
      if (res) {
        if (res.success) {
          if (res && res.res && res.res.length > 0) {
            let newUserInfo = res.res[0];
            let user_info = that.data.userInfo;
            user_info.phone_number = newUserInfo.telephone;
            user_info.nickName = newUserInfo.nickname;
            user_info.avatarUrl = newUserInfo.avatarurl;

            var coyote_userinfo = wx.getStorageSync('coyote_userinfo');
            coyote_userinfo.phone_number = newUserInfo.telephone;
            coyote_userinfo.nickName = newUserInfo.nickname;
            coyote_userinfo.avatarUrl = newUserInfo.avatarurl;

            that.setData({
              userInfo: user_info,
            });
            // 本地存储
            wx.setStorageSync('coyote_userinfo', coyote_userinfo);
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  catchTouchMove: function (res) {
    return false
  },
  setUrl() {
    if(this.data.numberType == 2){
      wx.navigateTo({
        url: `/healthyshop/pages/shoppingsuborder/index?shopid=${this.data.shopid}`
      });
    }
  },
  BackPage() {
    wx.navigateBack({
      delta: 1
    });
  },
  /**
   * 客服
   */
  clickShoppingService() {
    wx.navigateTo({
      url: "/healthyshop/pages/shoppingservice/index"
    });
  },
  /**
   * 立即购买
   */
  clickShoppingSubOrder: utils.throttle(function (e) {
    let that = this;
    if (that.data.user_id) {
      wx.navigateTo({
        url: `/healthyshop/pages/shoppingsuborder/index?shopid=${this.data.shopid}`
      });
    } else {
      that.setData({
        numberType: 2
      });
      that.getUserProfile();
    }
  },3000),
  handleRouter(e){
    let id = e.currentTarget.dataset.shopid;
    if(id){
      wx.redirectTo({
        url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
      });
    }
  },
  //轮播图的切换事件
  swiperChange: function(e) {
    //console.log(e)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  /**
   * 优惠券点击事件
   */
   handlerCouponClick: function (e) {
    let that = this;
    if (that.data.user_id) {
      let couponname = e.currentTarget.dataset.couponname;
      let id = e.currentTarget.dataset.id;
      let cpindex = e.currentTarget.dataset.cpindex;
      if(id && couponname){
        this.getReceiveCoupon(id,couponname,cpindex);
      }
    } else {
      that.setData({
        numberType: 3
      });
      that.getUserProfile();
    }
  },
  /**
   * 领取优惠券
   */
   getReceiveCoupon: function (id,couponname,cpindex) {
    let that = this;
    let data = {
      coupon_code: id,
      user_id: this.data.user_id,
      coupon_name: couponname
    }
    request.request_get('/Newacid/getReceiveCoupon.hn', data, function (res) {
      if (res) {
        if (res.success) {
          // that.getCouponShopInfo();
          let couponList = that.data.couponList || [];
          couponList.splice(cpindex, 1);

          let couponListOld = that.data.couponListOld || [];
          couponListOld.splice(cpindex, 1);

          that.setData({
            couponList: couponList,
            couponListOld: couponListOld
          });
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
  handlerClickMore(){
    if(this.data.isMoreCoupon){
      this.setData({
        isMoreCoupon: false,
        couponList: this.data.couponListOld,
      });
    }else{
      if(this.data.couponListOld && this.data.couponListOld.length > 2){
        let arr = [];
        for (let i = 0; i < 2; i++) {
          arr.push(this.data.couponListOld[i]);
        }
        this.setData({
          isMoreCoupon: true,
          couponList: arr,
        });
      }
    }
  },
  /**
   * 获取更多好物推荐
   */
   getMoreShopList: function () {
    let that = this;
    let data = {
      product_type: this.data.product_type,
    }
    request.request_get('/Newacid/getMoreShopList.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res && res.msg){
            that.setData({
              moreShopList: res.msg
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
})