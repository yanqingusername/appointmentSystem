// index.js
// 获取应用实例
const app = getApp()
const box = require('../../utils/box.js')
const updateApp = require('../../utils/updateApp.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    // userInfo: {},
    // fix_channel_id:-1,
    
    StatusBar: app.globalData.StatusBar,
    fix_channel_id: -1,
    isLogin: false,
    dialogData: {},
    user_id: '',
    phone_number: '',
    userInfo: {},
    noticeList: [],
    isNew: 1,
    main_title: '卡尤迪新冠肺炎核酸检测',
    main_type_time: '12小时内出报告',
    main_type_text: '91个核酸检测采样点位，看地图'
  },
  onShow:function(){
    var that = this;
        console.log("进入index index页面")
        // 自动检查小程序版本并更新
        updateApp.updateApp("卡尤迪新冠检测预约小程序");
        // 获取设备信息
        wx.getSystemInfo({
            success: res => {
                app.globalData.systeminfo = res
            }
        })
        wx.showShareMenu({
          withShareTicket:true,
          menus:['shareAppMessage','shareTimeline']
        })

        this.setData({
          user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
          isIphoneX: this.isIphoneX()
        });
    
        this.getNoticeNew();
        this.getNoticeList();

        if(this.data.user_id){
          this.getNewUserinfo();
        }
  },
  onLoad(query) {
    var that =this
    
    var q = decodeURIComponent(query.q) //https://store.coyotebio-lab.com:8443/lis_appointment/channel_id=146
    console.log("--qqqq-->:",q)
    if(q.indexOf('channel_id') != -1){  //查到
      var fix_channel_id = q.substr((q.indexOf('=')+1));
      that.setData({
        fix_channel_id:fix_channel_id
      })
      console.log("sdko")
    }

    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      isIphoneX: this.isIphoneX()
    });

    this.getbaseData();
    this.getMainIndex();
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
  /**
   * 个人预约
   */
   bindOnsite: function (options) {
    var that = this;

    if (that.data.user_id) {
      wx.navigateTo({
        url: '/pages/onsiteAppointment/onsiteAppointment?choose_type=' + options.currentTarget.dataset.type + '&fix_channel_id=' + that.data.fix_channel_id,
      })
    } else {
      that.getUserProfile();
    }

  },
  /**
   * 预约记录
   */
   bindAppointment: function () {
    if (this.data.user_id) {
      wx.navigateTo({
        url: '/pages/appointmentRecord/appointmentRecord'
      })
    } else {
      this.getUserProfile();
    }
  },
  /**
   * 采样点地图
   */
  bindChooseMap: function () {
    wx.navigateTo({
      url: '/pages/chooseSamplingPointMap/index',
    })
  },
  /**
   * 查询报告
   */
  bindTestReport: function () {
    if (this.data.user_id) {
      let date = new Date().getTime();
      wx.setStorageSync('currtime',utils.now_time(date));
      wx.navigateTo({
        url: "/pages/mineTestReport/index"
      })
    } else {
      this.getUserProfile();
    }
  },
  /**
   * 防疫政策
   */
  bindEpidemicPreventionPolicy: function () {
    wx.navigateTo({
      url: "/pages/epidemicPreventionPolicy/index"
    })
  },
  /**
   * 新冠自检
   */
  bindXinguanSelfInspection: function () {
    wx.navigateTo({
      url: "/pages/xinguanSelfInspection/index"
    })
  },
  /**
   *  公告
   */
  bindNoticeClick(e) {
    let item = e.currentTarget.dataset.item;
    console.log('---->:', item)

    let open_way= item.open_way
    let icon= item.herf
    let typestring = item.type;

    // 待采样
    if(typestring == 0){
      let herf = item.herf;
      let appointment_num = item.appointment_num;
      if(herf && appointment_num) {
        wx.navigateTo({
          url: herf + '?appointment_num='+appointment_num+"&onlineFlagNum="
        });
      }
    } else if(typestring == 1){
      // 超时
      let herf = item.herf;
      if(herf) {
        wx.navigateTo({
          url: herf + '?choose_type=0&fix_channel_id=-1'
        });
      }
    } else {
      if(open_way==0){
        wx.navigateTo({
          url: icon
        })
      }else if(open_way==1){
        app.globalData.article = icon
        wx.navigateTo({
          url: '/pages/index/article?url='+icon
        })
      }else{
        app.globalData.article = icon
        wx.navigateTo({
          url: '/pages/index/article'
        })
      }
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
      fail:(res)=>{
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
        request.request_get('/a/getUseridAndUserInfo.hn', {
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

    
    // let that = this;
    // let DATA = {
    //     // openid: this.data.openid,
    //     encrypted_data: e.encryptedData,
    //     iv: e.iv,
    //     // unionid: this.data.unionid
    // }
    // request.request_get('/a/getUserinfo.hn', DATA, function (res) {
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
      let user_info = this.data.userInfo;
      user_info.phone_number = '';
      this.setData({
        userInfo: user_info,
        user_id: this.data.userInfo.user_id
      });
      wx.setStorageSync('coyote_userinfo',user_info);

      this.getNoticeList();
      this.getNewUserinfo();
    }
  },
  TEL(e){
    let that = this;
    let DATA = {
      user_id: this.data.userInfo.user_id,
      code: e.detail.code
    }
    request.request_get('/a/getPhoneNumber.hn', DATA, function (res) {
      //判断为空时的逻辑
      if (res) {
        if (res.success) {
          let user_info = that.data.userInfo;
          user_info.phone_number = res.phoneNumber;
          that.setData({
            phone_number: res.phoneNumber,
            userInfo: user_info,
            user_id: that.data.userInfo.user_id
          });
          // 本地存储
          wx.setStorageSync('coyote_userinfo',user_info);

          that.getNoticeList();
          that.getNewUserinfo();
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
  /**
   * 获取公告列表
   */
  getNoticeList() {
    let that = this;
    request.request_get('/a/getNoticeList.hn', {
      user_id: this.data.user_id
    }, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            noticeList: res.resList
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  /**
   * 获取最新公告
   */
   getNoticeNew() {
     let that = this;
    request.request_get('/a1/getNoticeNew.hn', {
      user_id: this.data.user_id,
      curr_time: wx.getStorageSync('currtime') || '2022-08-01 00:00:00'
    }, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            isNew: res.isNew
          });
        } else {
          // box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  /**
   * 获取用户服务协议
   * 获取隐私政策
   */
  getbaseData: function () {
    let that = this;
    let data = {};
    request.request_get('/a/getbaseInfo.hn', data, function (res) {
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
   * 获取首页文案
   */
   getMainIndex: function () {
    let that = this;
    let data = {};
    request.request_get('/a/getMainIndex.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            main_title: res.title,
            main_type_text: res.type_text,
            main_type_time: res.type_time
          });
        }
      }
    })
  },

  /**
   * 获取用户信息
   */
   getNewUserinfo() {
    let that = this;
    request.request_get('/a/getNewUserinfo.hn', {
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

            var coyote_userinfo = wx.getStorageSync('coyote_userinfo');
            coyote_userinfo.phone_number = newUserInfo.telephone;
            coyote_userinfo.nickName = newUserInfo.nickname;
            coyote_userinfo.avatarUrl = newUserInfo.avatarurl;

            that.setData({
              userInfo: user_info,
            });
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
})
