const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    isLogin: false,
    dialogData: {},
    user_id: '',
    phone_number: '',
    userInfo: {},
  },
  onLoad: function (options) {

    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    });

    this.getbaseData();

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
   * 
   */
  bindNow: function (options) {
    var that = this;

    if (that.data.user_id) {
      wx.navigateTo({
        url: '/pages/NewH5FreeTwo/index'
      });
    } else {
      that.getUserProfile();
    }

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
    wx.navigateTo({
      url: '/pages/NewH5FreeTwo/index'
    })
  },
})