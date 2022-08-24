const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    fwxy_url: "",
    yszz_url: "",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    isLogin: false,
    dialogData: {},
    user_id: '',
    phone_number: '',
    user_name: '',
    userInfo: {},
    avatarUrl: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      userInfo: wx.getStorageSync('coyote_userinfo') || {},
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      phone_number: wx.getStorageSync('coyote_userinfo').phone_number || '',
      user_name: wx.getStorageSync('coyote_userinfo').nickName || '',
      avatarUrl: wx.getStorageSync('coyote_userinfo').avatarUrl || '',
      isIphoneX: this.isIphoneX()
    });
    this.getbaseData();
  },
  onShow: function () {
    this.setData({
      userInfo: wx.getStorageSync('coyote_userinfo') || {},
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      phone_number: wx.getStorageSync('coyote_userinfo').phone_number || '',
      user_name: wx.getStorageSync('coyote_userinfo').nickName || '',
      avatarUrl: wx.getStorageSync('coyote_userinfo').avatarUrl || '',
      isIphoneX: this.isIphoneX()
    });

    if(this.data.user_id){
      this.getNewUserinfo();
    }
  },
  isIphoneX() {
    let info = wx.getSystemInfoSync();
    console.log(info)
    if (info.model.indexOf("iPhone") >= 0 && (info.statusBarHeight > 20)) {
      return true;
    } else {
      return false;
    }
  },
  // 获取 code
  getCode(success){
    wx.login({
        success : _Code => {
          this.setData({
            rs_code : _Code.code
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
    //     console.log('---->:', code)
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
                  avatarUrl: res.userInfo.userInfo.avatarUrl,
                  nickName: res.userInfo.userInfo.nickName,
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
  },
  bindPhoneNumber(e) {
    e = e.detail;
    // 用户同意授权
    const OK = 'getPhoneNumber:ok'
    if (e.detail.errMsg == OK) {
      // 判断 session_key 有无到期
      // wx.checkSession({
      //     success : res => {
      this.TEL(e)
      //     },
      //     fail: res => {
      //             this.TEL(e)
      //     }
      // })
    } else {
      let user_info = this.data.userInfo;
      user_info.phone_number = '';
      this.setData({
        userInfo: user_info,
        user_id: this.data.userInfo.user_id,
        user_name: this.data.userInfo.nickName,
        avatarUrl: this.data.userInfo.avatarUrl
      });
      wx.setStorageSync('coyote_userinfo', user_info);

      if(this.data.user_id){
        this.getNewUserinfo();
      }
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
            user_id: that.data.userInfo.user_id,
            user_name: that.data.userInfo.nickName,
            avatarUrl: that.data.userInfo.avatarUrl
          });
          // 本地存储
          wx.setStorageSync('coyote_userinfo', user_info);

        } else {
          box.showToast(res.msg);
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
  // 退出登录
  toExit: function () {
    let that = this;
    wx.showModal({
      title: '温馨提示',
      content: "确定要退出登录吗？",
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync('coyote_userinfo');
          that.setData({
            user_id: '',
            phone_number: '',
            user_name: '',
            avatarUrl: '',
          });
        }
      }
    });
    
    // var data = {
    //   openid: app.globalData.openid,
    // }
    // request.request_get('/support/appLogOut.hn', data, function (res) {
    //   console.info('回调', res)
    //   if (res) {
    //     if (res.success) {
    //       wx.reLaunch({
    //         url: '/pages/index/login',
    //       })
    //     } else {
    //       box.showToast("请检查网络后重试");
    //     }
    //   } else {
    //     box.showToast("网络不稳定，请重试");
    //   }
    // })
  },
  bindCoupon: function () {
    if (this.data.user_id) {
      wx.navigateTo({
        url: '/pages/coupon/coupon',
      })
    } else {
      this.getUserProfile();
    }
  },
  bingManageSubject: function () {
    if (this.data.user_id) {
      wx.navigateTo({
        url: '/pages/selectSubject/index?isMine=1'
      });
    } else {
      this.getUserProfile();
    }
  },
  hidePicker() {
    this.setData({
      isShow: false
    });
  },
  hidePickerCall() {
    this.setData({
      isShow: false
    });
    wx.makePhoneCall({
      phoneNumber: '4008693888',
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
  phoneCall: function (e) {
    this.setData({
      isShow: true
    });
    // var that = this;
    // console.log(e)
    // wx.makePhoneCall({
    //   phoneNumber: '4008693888',
    //   success: function () {
    //     console.log("成功拨打电话")
    //   },
    // })
  },
  bindUpdatePhone: function (e) {
    let phonenumber = e.currentTarget.dataset.phonenumber;
      wx.navigateTo({
        url: `/pages/updatePhone/index?phonenumber=${phonenumber}`
      });
  },
  bindUserProtocol: utils.throttle(function (e) {
    var report_temp = this.data.fwxy_url;
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('用户服务协议不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/用户服务协议.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用
          console.log(Path);
          wx.openDocument({
            filePath: Path,
            showMenu: false,
            success: function (res) {
              console.log('打开用户服务协议成功');
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('用户服务协议不存在，请联系客服')
        console.log(res); //失败
      }
    })
  }, 2000),
  bindPrivacyPolicy: utils.throttle(function (e) {
    var report_temp = this.data.yszz_url;
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('隐私政策不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/隐私政策.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用

          wx.openDocument({
            filePath: Path,
            showMenu: false,
            success: function (res) {
              console.log('打开用户服务协议成功');
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('隐私政策不存在，请联系客服')
        console.log(res); //失败
      }
    })
  }, 2000),
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
            fwxy_url: msg.fwxy_url,
            yszz_url: msg.yszz_url,
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
   * 获取用户信息
   */
   getNewUserinfo() {
    let that = this;
    request.request_get('/Newacid/getNewUserinfo.hn', {
      user_id: this.data.user_id
    }, function (res) {
      if (res) {
        if (res.success) {
          if(res && res.res && res.res.length > 0){
            let newUserInfo = res.res[0];
            let user_info = that.data.userInfo;
            user_info.phone_number = newUserInfo.telephone;
            user_info.nickName = newUserInfo.nickname;
            user_info.avatarUrl = newUserInfo.avatarurl;

            that.setData({
              userInfo: user_info,
              phone_number: newUserInfo.telephone,
              user_name: newUserInfo.nickname,
              avatarUrl: newUserInfo.avatarurl
            });

            var coyote_userinfo = wx.getStorageSync('coyote_userinfo');
            coyote_userinfo.phone_number = newUserInfo.telephone;
            coyote_userinfo.nickName = newUserInfo.nickname;
            coyote_userinfo.avatarUrl = newUserInfo.avatarurl;

            // 本地存储
            wx.setStorageSync('coyote_userinfo',coyote_userinfo);
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  bindInvoice: function () {
      wx.navigateTo({
        url: "/pages/nowInvoice/index"
      });
  },
})