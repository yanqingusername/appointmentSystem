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
    // shopimage:[‘’,’’,’’],  // 商品顶部头图
		shopid:'', // 商品id
        		subtitle:"【满100减20】", // 商品副标题
        		title: "卡尤迪肠道菌群检测试剂盒 顺培怡 益生菌固体饮料 美国进口菌种 12袋/盒", // 商品标题
        		price: "299", // 商品价格
        		oldprice: "399", // 商品原价格
		freeshipping: "包邮", // 商品标签
		// shopdetailimg:[‘’,’’,’’],  // 商品详情图
		isGrounding: true, // 商品是否上架

    bottomLift: 15
  },
  onShow: function () {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    });
  },
  onLoad(options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      shopid: options.shopid
    });
    this.getbaseData();

    this.getBottomLift();
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
        //用户按了拒绝按钮
        // wx.showModal({
        //   title: '警告',
        //   content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        //   showCancel: false,
        //   confirmText: '返回授权',
        //   success: function (res) {
        //     // 用户没有授权成功，不需要改变 isHide 的值
        //     if (res.confirm) {
        //       console.log('用户点击了“返回授权”');
        //     }
        //   }
        // });
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
      //用户按了拒绝按钮
      // wx.showModal({
      //   title: '警告',
      //   content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
      //   showCancel: false,
      //   confirmText: '返回授权',
      //   success: function (res) {
      //     // 用户没有授权成功，不需要改变 isHide 的值
      //     if (res.confirm) {
      //       console.log('用户点击了“返回授权”');
      //     }
      //   }
      // });
    }
  },
  USRE(e) {
    let that = this;
    // wx.login({
    //   success: (res) => {
    //     var code = res.code;
    //     console.log('---->:',code)
    request.request_get('/Newacid/getUseridAndUserInfo.hn', {
      code: this.data.rs_code,
      encryptedData: e.encryptedData,
      iv: e.iv,
    }, function (res) {
      //判断为空时的逻辑
      if (res) {
        if (res.success) {
          console.log("获取的用户信息---->:" + res);
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
    //   },
    //   fail: (res) => {
    //     box.showToast("请求超时，请检查网络是否连接")
    //   }
    // })


    // let that = this;
    // let DATA = {
    //     // openid: this.data.openid,
    //     encrypted_data: e.encryptedData,
    //     iv: e.iv,
    //     // unionid: this.data.unionid
    // }
    // request.request_get('/Newacid/getUserinfo.hn', DATA, function (res) {
    //   //判断为空时的逻辑
    //   if (res) {
    //     if (res.success) {
    //       console.log('--USRE-->:',res);
    //       that.setData({
    //         isLogin: true
    //       });
    //       // 本地存储
    //       // wx.setStorageSync('data',_RES['data']['data']);
    //     } else {
    //       box.showToast(res.msg);
    //     }
    //   } else {
    //     box.showToast("网络不稳定，请重试");
    //   }
    // })
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

    e = e.detail;
    // 用户同意授权
    const OK = 'getPhoneNumber:ok'
    if (e.detail.errMsg == OK) {
      // 判断 session_key 有无到期
      // wx.checkSession({
      //     success : res => {
      //         this.TEL(e);
      //     },
      //     fail: res => {
      this.TEL(e)
      //     }
      // })
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
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingsuborder/index?shopid=${this.data.shopid}`
    });
  },
  BackPage() {
    wx.navigateBack({
      delta: 1
    });
  },
  clickShoppingService() {
    wx.navigateTo({
      url: "/healthyshop/pages/shoppingservice/index"
    });
  },
  clickShoppingSubOrder() {
    let that = this;
    if (that.data.user_id) {
      wx.navigateTo({
        url: `/healthyshop/pages/shoppingsuborder/index?shopid=${this.data.shopid}`
      });
    } else {
      that.getUserProfile();
    }
  },
  handleRouter(e){
    let id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
    });
  },
  //轮播图的切换事件
  swiperChange: function(e) {
    //console.log(e)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  clickReceiveCoupon(e){

  },
  clickMoreCoupon(){

  }
})