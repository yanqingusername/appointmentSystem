const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fix_channel_id: -1,
    openid: '',
    unionid: '',
    isLogin: false,
    dialogData: {},
    userId: '',
    noticeList: [{
        activity_id: 1,
        href: "https://cloud.coyotebio-lab.com/beijingnanzhan.jpg",
        icon: "https://mp.weixin.qq.com/s/qpDb8gRv0jQpkjfYRfCG2Q",
        open_way: 1,
        id: '1',
        title: "您的预约已进入",
        title1: '待采样',
        title2: '状态，点击查看详情'
      },
      {
        activity_id: 1,
        href: "https://tj.coyotebio-lab.com/a/jjtz.png",
        icon: "https://tj.coyotebio-lab.com/a/jjtz.png",
        open_way: 1,
        id: '2',
        title: "您距上次检测已超过",
        title1: '14',
        title2: '天，点击立即预约'
      },
      {
        activity_id: 1,
        href: "https://tj.coyotebio-lab.com/a/jjtz.png",
        icon: "https://tj.coyotebio-lab.com/a/jjtz.png",
        open_way: 1,
        id: '3',
        title: "您距上次检测已超过",
        title1: '48',
        title2: '小时，点击立即预约'
      }
    ],
    isNewNotice: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    this.getOpenID(() => {});
  },
  onShow: function () {

  },
  /**
   * 个人预约
   */
  bindOnsite: function (options) {
    var that = this;

    if (that.data.userId == 1) {
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
    if (this.data.userId == 1) {
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
    if (this.data.userId == 1) {
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
    let icon= item.icon
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
  },
  /**
   * 获取openid
   */
  getOpenID(success) {
    let that = this;
    wx.login({
      success: (res) => {
        var code = res.code;
        console.log('---->:',code)
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
      }
    })
  },
  // 授权用户信息
  bindGetUserInfo(e) {
    const OK = "getUserProfile:ok"
    if (e.errMsg == OK) {
      console.log('---->:', e.encryptedData, e.iv)
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
  USRE(e) {
    // let that = this;
    // let DATA = {
    //     openid: this.data.openid,
    //     encrypted_data: e.encryptedData,
    //     iv: e.iv,
    //     unionid: this.data.unionid
    // }
    // request.request_get('/a/getUserinfo.hn', DATA, function (res) {
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
      userInfo: e.userInfo
    });
  },
  bindPhoneNumber(e) {
    e = e.detail;
    // 用户同意授权
    const OK = 'getPhoneNumber:ok'
    if (e.detail.errMsg == OK) {
      console.log('--222-->:', e)
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
    } else {
      this.setData({
        userId: '1'
      });
    }
  },
  bindShowDialog() {
    this.setData({
      userId: '1'
    });
  },
  /**
   * 获取公告列表
   */
  getNoticeList() {
    request.request_get('/a/getnNoticeList.hn', {
      userid: this.data.userId
    }, function (res) {
      if (res) {
        if (res.success) {
          
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
    request.request_get('/a/getNoticeNew.hn', {
      userid: this.data.userId
    }, function (res) {
      if (res) {
        if (res.success) {
          this.setData({
            isNewNotice: true
          });
        } else {
          this.setData({
            isNewNotice: false
          });
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
})