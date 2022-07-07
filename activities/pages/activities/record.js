const app = getApp()
var request = require('../../../utils/requestForHD.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

Page({
  data: {
    dl_num: 0,
    hb1_status: 0,
    hb2_status: 0,
    bnt_szf: '我要送祝福',
    nowTime: new Date().getTime(), //获取当前日期
    end_time: '',
    remainTime: null,
    countDownTxt: null,
    hdgz: {
      'title': '活动规则',
      'content': ''
    },
    hideFlag: true, //true-隐藏 false-显示
    animationData: {},
    modalName: '',
    modalName2: '',
    canvasFlag: 'hidden',
    openSettingBtnHidden: true, //是否授权
    imgUrl: '',
    hjdata: [],
    coupon: [],
    hb1_flag3: 0, //0表示已打开红包，未点开下一个；1表示已点下一个
    hb2_flag3: 0,
    continuity_flag:false
  },
  onLoad() {
    var that = this;
    console.log("进入activities 进程页面")

    that.loginApp();

  },
  onShow() {
    //判断是否有openid，如果没有，去后台获取
    console.log('onshow');

  },
  loginApp: function () {
    var that = this;
    request.request_get('/activity/getsubsidiarySum.hn', {
      openid: app.globalData.openid
    }, function (res) {
      console.info('回调', res);
      //判断为空时的逻辑
      if (!res) {
        box.showToast("网络不稳定，请重新进入小程序");
        return;
      }
      let msg = res.msg
      if (!res.success) {
        box.showToast(msg);
        return;
      }
      let flag = false;
      if(msg.dl_num>=7&&msg.hb1_status==0&&msg.hb2_status==0){
        flag = true;
      }
      that.setData({
        dl_num: msg.dl_num,
        end_time: msg.end_time,
        hb1_status: msg.hb1_status,
        hb2_status: msg.hb2_status,
        hb1_flag3: msg.hb1_flag3,
        hb2_flag3: msg.hb2_flag3,
        hb1_data: msg.hb1_data,
        hb2_data: msg.hb2_data,
        hjdata: msg.text,
        hdgz: msg.hdgz,
        coupon: msg.coupon,
        continuity_flag:flag
      })
      that.setData({
        remainTime: Date.parse(that.data.end_time.replace(/-/g, '/')) - that.data.nowTime
      })
      that.countDown(that);
    })
  },

  // ----------------------------------------------------------------------modal


  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间 默认400ms
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown(); //调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220) //先执行下滑动画，再隐藏模块

  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  countDown: function (that) { //倒计时函数
    let newTime = new Date().getTime();
    let endTime = that.data.end_time;

    var end_time = Date.parse(endTime.replace(/-/g, '/'));



    //console.log('+++++++++++++++++++++')
    //console.log(end_time)
    // console.log(newTime)
    let remainTime = end_time - newTime;
    let obj = null;
    let t = '';
    //console.log('-------------------')
    //console.log(remainTime)
    // 如果活动未结束，对时间进行处理
    if (remainTime > 0) {
      let time = remainTime / 1000;
      // 获取天、时、分、秒
      let day = parseInt(time / (60 * 60 * 24));
      let hou = parseInt(time % (60 * 60 * 24) / 3600);
      let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      obj = {
        day: day,
        hou: formatNumber(hou),
        min: formatNumber(min),
        sec: formatNumber(sec)
      }
      //console.log(obj)
    }
    t = setTimeout(function () {
      that.setData({
        countDownTxt: obj
      });
      that.countDown(that)
    }, 1000)
    if (remainTime <= 0) {
      clearTimeout(t);
    }
  },
  changemzicon: function () {
    //修改免责协议icon
    let that = this
    let mz_icon = that.data.mz_icon;
    if (mz_icon == '../images/2022ny/gx1_3x.png') {
      that.setData({
        mz_icon: '../images/2022ny/gx2_3x.png'
      });
    } else if (mz_icon == '../images/2022ny/gx2_3x.png') {
      that.setData({
        mz_icon: '../images/2022ny/gx1_3x.png'
      });

    }

  },
  showmztk: function () {
    let that = this
    that.setData({
      modalName: 'Modal'
    });
  },
  hideModal: function () {
    let that = this
    that.setData({
      modalName: ''
    });
  },
  showhdgz: function () {
    let that = this
    that.setData({
      modalName2: 'Modal'
    });
    that.buriedPoint('rule');
  },
  hideModal2: function () {
    let that = this
    that.setData({
      modalName2: ''
    });
  },

  goNext: function () {
    // wx.navigateTo({
    //   url: '/activities/pages/activities/index',
    // })
    let that = this;
    wx.navigateBack();
    that.buriedPoint('send');
  },
  tips: function () {
    let that = this;
    let dl_num = that.data.dl_num;
    if (dl_num >= 4) {
      return
    }
    wx.showModal({
      title: '你还没有达成成就哦！',
      content: '只要亲人朋友收到7个平安帖，大奖等你来拿',
      showCancel: false
    })

    that.buriedPoint('award_area');

  },
  tips2: function () {
    let that = this;
    let dl_num = that.data.dl_num;
    if (dl_num >= 4) {
      return
    }
    wx.showModal({
      title: '你还没有达成成就哦！',
      content: '只要亲人朋友收到7个平安帖，大奖等你来拿',
      showCancel: false
    })
  },
  tips3: function () {
    let that = this;
    let dl_num = that.data.dl_num;
    if (dl_num >= 4) {
      return
    }
    wx.showModal({
      title: '你还没有达成成就哦！',
      content: '只要亲人朋友收到7个平安帖，大奖等你来拿',
      showCancel: false
    })
  },
  buriedPoint:function(type){
    request.request_get('/activity/sendbutn.hn', {
      type: type,
      openid: app.globalData.openid
    }, function (res) {
      console.log('埋点',res)
    })

  },
  khb1: function () {
    let that = this;
    //开第一个红包
    let data = {
      openid: app.globalData.openid,
      type: '1',
      status: '1'
    }
    request.request_get('/activity/openpacket.hn', data, function (res) {
      console.info('回调', res);
      //判断为空时的逻辑
      if (!res) {
        box.showToast("网络不稳定，请重新进入小程序");
        return;
      }
      let msg = res.msg
      if (!res.success) {
        box.showToast(msg);
        return;
      }

      that.setData({
        hb1_data: res.msg,
        hjdata: res.text,
        hb1_status: 1,
        hb1_flag3: 1
      })
      //获取授权
      if(that.data.dl_num<7){
        //授权
        wx.requestSubscribeMessage({
          tmplIds: ['__nvcVTA7Vx4pD9eVrd-CisiYJ7Wx-X8_wbv8nQQjyc'],
          success (res) {
            console.log('success:'+res);
            let data = {
              openid:app.globalData.openid
            }
            request.request_get('/a/sendmsg.hn', data, function (res) {
              console.info('回调', res)
            })
          },
          fail (res) {
            console.log('fail:'+res);
            console.log(res);
          },
          complete(res) {
            console.log('complete:'+res);
            console.log(res);
            //that.scpaf();
          }
        })

      }

    })

  },
  update1_status: utils.throttle(function (e) {
    //查看，更新过程状态是2，然后跳转到我的优惠券
    let that = this;
    let data = {
      openid: app.globalData.openid,
      type: '1',
      status: '2'
    }
    request.request_get('/activity/openpacket.hn', data, function (res) {
      console.info('回调', res);
      //判断为空时的逻辑
      if (!res) {
        box.showToast("网络不稳定，请重新进入小程序");
        return;
      }
      let msg = res.msg
      if (!res.success) {
        box.showToast(msg);
        return;
      }

      wx.navigateTo({
        url: '/pages/coupon/coupon',
      })
      // that.setData({
      //   hb1_flag3: 2,
      //   hjdata: res.text
      // })

    })

  }, 3000),
  update2_status: utils.throttle(function (e) {

    let that = this;
    let data = {
      openid: app.globalData.openid,
      type: '2',
      status: '2'
    }
    request.request_get('/activity/openpacket.hn', data, function (res) {
      console.info('回调', res);
      //判断为空时的逻辑
      if (!res) {
        box.showToast("网络不稳定，请重新进入小程序");
        return;
      }
      let msg = res.msg
      if (!res.success) {
        box.showToast(msg);
        return;
      }

      wx.navigateTo({
        url: '/pages/coupon/coupon',
      })

    })

  },3000),
  khb_next: function () {
    let that = this;
    that.setData({
      hb2_flag3: 1
    })

  },
  goyhq: utils.throttle(function (e) {

    wx.navigateTo({
      url: '/pages/coupon/coupon',
    })
    //wx.navigateBack();
  },3000),
  khb2: function () {
    //这里要在后台随机优惠券
    let that = this;

    //开红包
    let data = {
      openid: app.globalData.openid,
      type: '2',
      status: '1'
    }
    
    request.request_get('/activity/openpacket.hn', data, function (res) {
      console.info('回调', res);
      //判断为空时的逻辑
      if (!res) {
        box.showToast("网络不稳定，请重新进入小程序");
        return;
      }
      let msg = res.msg
      if (!res.success) {
        box.showToast(msg);
        return;
      }

      that.setData({
        hb2_data: res.msg,
        hb2_status: 1,
        hb2_flag3: 1,
        hjdata: res.text
      })


    })

  },
  lyhq2: function () {
    //这里要在后台随机优惠券
    // TODO
    let that = this;


    that.setData({
      hb2_flag3: 1
    })

  },

})