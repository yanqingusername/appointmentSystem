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
    openid: '',
    unionid: '',
    isLogin: false,
    dialogData: {},
    userId: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;

    this.getOpenID(() => {});

    this.getbaseData();
    // console.log(app.globalData.userInfo)

  },
  /**
   * 获取openid
   */
   getOpenID(success) {
    let that = this;
    wx.login({
      success: (res) => {
        var code = res.code;
        request.request_get('/a/getOpenid.hn', {
          code: code
        }, function (res) {
          //判断为空时的逻辑
          if (res) {
            if (res.success) {
              console.log("获取的用户openid" + res.msg);
              // that.setData({
              //   openid : res.data.data.openid,
              //   unionid: res.data.data.unionid
              // });
              success();
            } else {
              box.showToast(res.msg);
            }
          } else {
            box.showToast("网络不稳定，请重试");
          }
        })
      },
      fail: (res) => {
        box.showToast("请求超时，请检查网络是否连接")
      }
    })
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.bindGetUserInfo(res);
      },
      fail:(res)=>{
          console.log('fail12121212')
          //用户按了拒绝按钮
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
            showCancel: false,
            confirmText: '返回授权',
            success: function (res) {
              // 用户没有授权成功，不需要改变 isHide 的值
              if (res.confirm) {
                console.log('用户点击了“返回授权”');
              }
            }
          });
      }
    })
  },
  // 授权用户信息
  bindGetUserInfo(e) {
    const OK = "getUserProfile:ok"
    if (e.errMsg == OK) {
      console.log('---->:', e)
      // wx.showLoading({
      //     title: '加载中...',
      //     mask: true
      // })
      // 判断 session_key 有无到期
      this.setData({
        isLogin: true
      });
      // wx.checkSession({
      //     success: res => {
      this.USRE(e)
      //     },
      //     fail: res => {
      //         this.getOpenID(() => {
      //             this.USRE(e)
      //         })
      //     }
      // })
    } else {
      console.log('12121212')
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  USRE(e){
    // let that = this;
    // let DATA = {
    //     openid: this.data.openid,
    //     encrypted_data: e.encryptedData,
    //     iv: e.iv,
    //     unionid: this.data.unionid
    // }
    // request.request_get('/a/getUserInfo.hn', DATA, function (res) {
    //   //判断为空时的逻辑
    //   if (res) {
    //     if (res.success) {

    //       // 本地存储
    //       // wx.setStorageSync('data',_RES['data']['data']);
    //     } else {
    //       box.showToast(res.msg);
    //     }
    //   } else {
    //     box.showToast("网络不稳定，请重试");
    //   }
    // })
    this.setData({
      userInfo : e.userInfo
    });
  },
  bindPhoneNumber(e){
    e = e.detail;
    // 用户同意授权
    const OK = 'getPhoneNumber:ok'
    if (e.detail.errMsg == OK) {
      console.log('--222-->:',e)
        // wx.showLoading({
        //     title: '加载中...',
        //     mask: true
        // })
        // 判断 session_key 有无到期
        // wx.checkSession({
        //     success : res => {
        //         this.TEL(e)
        //     },
        //     fail: res => {
        //         this.getOpenID(() => {
        //             this.TEL(e)
        //         })
            
        //     }
        // })
        this.setData({
          userId: '1'
        });
    }else{
      this.setData({
        userId: '1'
      });
    }
  },
  bindShowDialog(){
    this.setData({
      userId: '1'
    });
  },
  onShow: function () {

  },
  // 退出登录
  toExit: function () {
    var data = {
      openid: app.globalData.openid,
    }
    request.request_get('/support/appLogOut.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          wx.reLaunch({
            url: '/pages/index/login',
          })
        } else {
          box.showToast("请检查网络后重试");
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindCoupon: function () {
    if (this.data.userId == 1){
      wx.navigateTo({
        url: '/pages/coupon/coupon',
      })
    } else {
      this.getUserProfile();
    }
  },
  bingManageSubject: function () {
    if (this.data.userId == 1){
      wx.navigateTo({
        url: '/pages/selectSubject/index?isMine=1'
      });
    } else {
      this.getUserProfile();
    }
  },
  hidePicker(){
    this.setData({
      isShow: false
    });
  },
  hidePickerCall(){
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
  bindUpdatePhone: function () {
    wx.navigateTo({
      url: "/pages/updatePhone/index"
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
  getbaseData: function () {
    let that = this;
    //获取用户服务协议
    //获取隐私政策
    let data = {};
    request.request_get('/a/getbaseInfo.hn', data, function (res) {
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
})