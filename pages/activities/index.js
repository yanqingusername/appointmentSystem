const app = getApp()
var request = require('../../utils/requestForHD.js')
var box = require('../../utils/box.js')
const updateApp = require('../../utils/updateApp.js')
const canvas = require('../../utils/canvas.js')
const utils = require('../../utils/utils.js')
//const wxbarcode = require('../../utils/wxbarcode.js');

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const fillTextLineBreak = (ctx, text, x, y, lw, lh) => {
  let i = 0
  let n = 0
  let r = -1
  while (i < text.length) {
    while (ctx.measureText(text.substring(n, i)).width < lw && i < text.length) {
      i++
    }
    r++
    ctx.fillText(text.substring(n, i), x, y + lh * r)
    n = i
  }
  return lh * r
}
Page({
  data: {
    get_pat_p_num: 0,
    pat_num: 0,
    type: '',
    pid: '',
    get_pat_p_num: 0,
    pat_num: 0,
    dl_num: 0,
    // mz_status: 1,
    // mz_icon: '../../images/2022ny/gx1_3x.png',
    hb1_status: 0,
    hb2_status: 0,
    qrcode: '',
    mb_data: [],
    m_bk: 'https://cloud.coyotebio-lab.com/a/sel_3x.png',
    m_index: 0,
    nowTime: new Date().getTime(), //获取当前日期
    end_time: '',
    remainTime: null,
    countDownTxt: null,
    hdgz: {
      'title': '活动规则',
      'content': ''
    },
    bnt_tpsc: '下载到相册里吧',
    xc_text: {
      'logo': '',
      'content': ''
    },
    title_word: '',
    tz_url: '../../images/2022ny/qkk_3x.png',
    startPageX: 0,
    zfy: [],
    value: '',
    valueid: '',
    value_text: '',
    hideFlag: true, //true-隐藏 false-显示
    animationData: {},
    modalName: '',
    modalName2: '',
    canvasFlag: 'hidden',
    canvasFlag1: 'hidden',
    openSettingBtnHidden: true, //是否授权
    imgUrl: '',
    animation: '',
    hidden: true,
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },
  onLoad(options) {
    var that = this;
    console.log("进入activities index页面")

    //二维码在load的时候就获取
    //TODO
    // 自动检查小程序版本并更新
    updateApp.updateApp("卡尤迪新冠检测预约小程序");
    // 获取设备信息
    // wx.getSystemInfo({
    //   success: res => {
    //     app.globalData.systeminfo = res
    //   }
    // })
    //右上角的转发，目前用发福帖方式
    // wx.showShareMenu({
    //   withShareTicket: true,
    //   menus: ['shareAppMessage', 'shareTimeline']
    // })
    //获取进入页面的参数
    let params = decodeURIComponent(options.scene) //https://store.coyotebio-lab.com:8443/lis_appointment/channel_id=146

    console.log('params');
    console.log(params);
    console.log('扫码进入页面携带的参数是');
    if(params.indexOf('id')!=-1){
      var pid = params.substr((params.indexOf('=')+1));
      console.log('pid:' + pid);
      that.setData({
        pid: pid
      })
    }
    var t = options.type
    console.log('跳转链接进入页面携带的参数是');
    console.log(t);
    if(typeof(t)!='undefined'){
      that.setData({
        type: t
      })
    }
console.log(that.data.type);
console.log(that.data.pid);
    // if (q.indexOf('channel_id') != -1) {
    //   var fix_channel_id = q.substr((q.indexOf('=') + 1));
    //   that.setData({
    //     fix_channel_id: fix_channel_id
    //   })
    // }
    // wx.downloadFile({
    //   url: 'https://res.wx.qq.com/wxdoc/dist/assets/img/demo.ef5c5bef.jpg',
    //   success: (res) => {
    //     wx.showShareImageMenu({
    //       path: res.tempFilePath
    //     })
    //   }
    // })

    // 登录小程序
    that.loginApp();

  },
  onShareAppMessage() {
    //获取当前使用的模板
    let that = this;
    let text = that.data.value_text;
    if (text == '' || text == '不写文案') {
      text = '福福帖帖过大年';
    }
    const promise = new Promise(resolve => {
      resolve({
        title: text
      })
    })
    return {
      promise
    }
  },
  onShow() {
    //判断是否有openid，如果没有，去后台获取
    console.log('onshow');

    let that = this
    let openid = app.globalData.openid;
    console.log(openid);
    if (openid == '' || typeof (openid) == 'undefined') {
      wx.login({
        success: (res) => {
          var code = res.code;
          console.log("获取code成功" + code);
          let data = {
            code: code
          }
          that.getData(data);
        },
        fail: (res) => {
          box.showToast("请求超时，请检查网络是否连接")
        }
      })
    } else {
      let data = {
        openid: openid
      }
      this.getData(data);
    }
    //that.renderpage()

  },
  loginApp: function () {
    var that = this;
    wx.login({
      success: (res) => {
        var code = res.code;
        console.log("获取code成功" + code);
        request.request_get('/activity/getIndexBasicInfo.hn', {
          code: code,
          type: that.data.type,
          pid: that.data.pid,
          openid: app.globalData.openid
        }, function (res) {
          console.info('回调', res);
          //判断为空时的逻辑
          if (!res) {
            box.showToast("网络不稳定，请重新进入小程序");
            return;
          }
          if (!res.success) {
            box.showToast(res.msg);
            return;
          }
          //1.此人平安福被打开的次数
          //3.

          res = res.msg;
          app.globalData.openid = res.openid;
          console.log("获取的用户openid" + app.globalData.openid);
          //获取了一堆信息 TODO
          //模板信息，按钮文案，活动时间，免责声明内容，活动规则内容
          //增加祝福语
          that.setData({
            mb_data: res.mb_data,
            bnt_szf: res.bnt_szf,
            mz_text: res.mz_text,
            end_time: res.end_time,
            hdgz: res.hdgz,
            bnt_tpsc: res.bnt_tpsc
          })
          console.log(res.end_time)
          that.setData({
            remainTime: Date.parse(that.data.end_time.replace(/-/g, '/')) - that.data.nowTime
          })
          that.countDown(that);
          //渲染页面（福卡点亮展示，倒计时展示）
          //that.renderpage();
        })
      },
      fail: (res) => {
        box.showToast("请求超时，请检查网络是否连接")
      }
    })
  },
  getData(data) {
    var that = this;
    request.request_get('/activity/getIndexSumInfo.hn', data, function (res) {
      console.info('回调', res);
      //判断为空时的逻辑
      if (!res) {
        box.showToast("网络不稳定，请重新进入小程序");
        return;
      }
      if (!res.success) {
        box.showToast(res.msg);
        return;
      }
      //TODO
      that.setData({
        get_pat_p_num: res.get_pat_p_num,
        pat_num: res.pat_num,
        dl_num: res.dl_num,
        mz_status: res.mz_status,
        hb1_status: res.hb1_status,
        hb2_status: res.hb2_status
      })
      app.globalData.openid = res.openid;
      that.renderpage()
    })
  },
  renderpage() {
    //首先渲染
    let that = this;
    let dl_num = that.data.dl_num;
    let hb1_status = that.data.hb1_status;
    let hb2_status = that.data.hb2_status;
    let title_word = '';
    console.log('==========================')
    console.log(dl_num)
    console.log(hb1_status)
    console.log(hb2_status)

    console.log('==========================')
    if (dl_num <= 0) {
      title_word = '送出平安帖并点亮字卡，即可获得平安礼'
    } else if (dl_num > 0 && dl_num < 4) {
      title_word = '再点亮' + (4 - dl_num) + '个字卡，可获得第1份平安礼'
    } else if (dl_num == 4) {
      title_word = '已点亮4个字卡，获得第1份平安礼'
    } else if (dl_num > 4 && dl_num < 7) {
      title_word = '再点亮' + (7 - dl_num) + '个字卡，可获得第2份平安礼'
    } else if (dl_num >= 7&&(hb1_status==0||hb2_status==0)) {
      title_word = '已点亮7个字卡，获得第2份平安礼';
    }else if(dl_num >= 7&&hb1_status==1&&hb2_status==1){
      title_word = '已领取全部平安礼，祝您福星高照，平安随行！'
    }
    console.log('----------------------------');
    console.log(dl_num);
    console.log(hb1_status);
    console.log(hb2_status);
    console.log('----------------------------');
    if ((dl_num >= 4 && dl_num < 7 && hb1_status == 0) || (dl_num >= 7 && (hb1_status == 0 || hb2_status == 0))) {
      //任意一个未领取，则显示红包按钮
      that.setData({
        tz_url: '../../images/2022ny/hb_3x.png'
      })

    } else {
      that.setData({
        tz_url: '../../images/2022ny/qkk_3x.png'
      })

    }

    if (dl_num >= 7 && hb1_status == 1 && hb2_status == 1) {
      title_word = '已领取全部平安礼，祝您福星高照，平安随行！'
    }
    that.setData({
      title_word: title_word
    })
  },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  // 滑动手势开始事件
  startEvent(event) {
    if (event.changedTouches[0].pageX) {
      this.data.startPageX = event.changedTouches[0].pageX
    } else {
      this.data.startPageX = event.changedTouches[0].x
    }
  },
  // 滑动手势结束事件
  endEvent(event) {
    let endPageX = 0
    if (event.changedTouches[0].pageX) {
      endPageX = event.changedTouches[0].pageX
    } else {
      endPageX = event.changedTouches[0].x
    }
    const moveX = endPageX - this.data.startPageX
    if (Math.abs(moveX) < 30) return
    if (moveX > 0) {
      // 右滑
      this.next()

    } else {
      // 左滑
      this.prev()
    }
  },
  prev() {
    //右滑
    let that = this;
    let m_index = that.data.m_index
    let m_len = that.data.mb_data.length
    let data = that.data.mb_data;
    let m_bk = that.data.m_bk;

    if (m_index == m_len - 1) {
      for (var i = 0; i < m_len; i++) {
        if (i == 0) {
          data[i].m_bk = m_bk;
        } else {
          data[i].m_bk = '';
        }
      }
      that.setData({
        mb_data: data,
        m_index: 0,
        value: '',
        valueid: '',
        value_text: ''
      })
    } else {
      let x = m_index + 1;
      for (var i = 0; i < data.length; i++) {
        if (x == i) {
          data[i].m_bk = m_bk;
        } else {
          data[i].m_bk = '';
        }
      }
      that.setData({
        mb_data: data,
        m_index: x,
        value: '',
        valueid: '',
        value_text: ''
      })
    }
  },
  next() {
    //左滑
    let that = this;
    let m_index = that.data.m_index
    let m_len = that.data.mb_data.length
    let data = that.data.mb_data;
    let m_bk = that.data.m_bk;

    if (m_index == 0) {
      let x = m_len - 1;
      for (var i = 0; i < data.length; i++) {
        if (x == i) {
          data[i].m_bk = m_bk;
        } else {
          data[i].m_bk = '';
        }
      }

      that.setData({
        mb_data: data,
        m_index: x,
        value: '',
        valueid: '',
        value_text: ''
      })
    } else {
      let x = m_index - 1;

      for (var i = 0; i < data.length; i++) {
        if (x == i) {
          data[i].m_bk = m_bk;
        } else {
          data[i].m_bk = '';
        }
      }

      that.setData({
        mb_data: data,
        m_index: x,
        value: '',
        valueid: '',
        value_text: ''
      })
    }
  },
  changeImage(e) {
    let that = this;
    console.log(e.currentTarget.dataset.index);
    let index = e.currentTarget.dataset.index;
    let data = that.data.mb_data;
    let m_bk = that.data.m_bk;
    for (var i = 0; i < data.length; i++) {
      if (index == i) {
        data[i].m_bk = m_bk;
      } else {
        data[i].m_bk = '';
      }
    }

    that.setData({
      mb_data: data,
      m_index: index,
      value: '',
      valueid: '',
      value_text: ''
    })
  },
  getZFY() {
    let that = this;
    let m_index = that.data.m_index;
    let id = that.data.mb_data[m_index].id;
    // console.log(id)
    // let data = {
    //   mould_id: id
    // }
    // request.request_get('/activity/getblessInfo.hn', data, function (res) {
    //   console.info('回调', res)
    //   if (res) {
    //     if (res.success) {
    //       //不管如何，都要返回openid
    //       //共发出的平安贴数，多少人获得了奖品，已经有几个人点亮了，是否勾选了免责声明，两个红包的领取状态
    //     }
    //   }
    // })

    let zfy_x = that.data.mb_data[m_index].zfy;


    let zfy = that.data.zfy
    zfy = [];
    zfy.push({
      'id': 0,
      'text': '不写文案',
      'heat': 1,
      'mould_id': 0,
      'p_url': ''
    });

    for (var i = 0; i < zfy_x.length; i++) {
      zfy.push(zfy_x[i])
    }

    that.setData({
      zfy: zfy,
      hideFlag: false
    })

    console.log(zfy);

    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间
      timingFunction: 'ease', //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    that.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn(); //调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)




  },
  hideZFY: function () {
    //隐藏祝福语
    var that = this;
    that.setData({
      hideFlag: true
    })
  },

  getOption: function (e) {
    var that = this;
    let value = e.currentTarget.dataset.value
    let id = e.currentTarget.dataset.id
    let text = e.currentTarget.dataset.text
    if (value == '不写文案') {
      that.setData({
        hideFlag: true,
        value: '',
        valueid: '',
        value_text: ''
      })

      return;
    }

    that.setData({
      valueid: id,
      value: value,
      value_text: text,
      hideFlag: true
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
    if (mz_icon == '../../images/2022ny/gx1_3x.png') {
      that.setData({
        mz_icon: '../../images/2022ny/gx2_3x.png'
      });
    } else if (mz_icon == '../../images/2022ny/gx2_3x.png') {
      that.setData({
        mz_icon: '../../images/2022ny/gx1_3x.png'
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
  showPre: function () {
    let that = this
    // that.setData({
    //   canvasFlag: '',
    //   canvasFlag1: ''
    // })
    // wx.requestSubscribeMessage({
    //   tmplIds: ['P01rYbqz6L_sbj3JyVz2SfUtU4SWhZ01PQ13j3AoSkE'],
    //   success (res) {
    //     console.log('success:'+res);
    //   },
    //   fail (res) {
    //     console.log('fail:'+res);
    //   },
    //   complete(res) {
    //     console.log('complete:'+res);
    //   }
    // })
    let data = {
      bj_url: that.data.mb_data[that.data.m_index].local_url,
      ewm_url: that.data.xc_text.logo,
      wz_url: that.data.value,
      xc_text: that.data.xc_text.content
    }
    app.globalData.fx_data = data;
    wx.navigateTo({
      url: '/pages/activities/preview?data=' + data,
    })

  },
  sq_tips: utils.throttle(function (e) {
    let that = this
    let data = {
      mould_id: that.data.mb_data[that.data.m_index].id,
      bless_id: that.data.valueid,
      open_id: app.globalData.openid
    }

    request.request_get('/activity/sendBlessing.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {

          that.setData({
            pid: res.result.id,
            xc_text: res.result.xc_text
          })
          console.log('-----------------------------------11111111111111111----------------')
          //------------------------------------------
          //进入新页面
          let data = {
            bj_url: that.data.mb_data[that.data.m_index].local_url,
            ewm_url: that.data.xc_text.logo,
            wz_url: that.data.value,
            xc_text: that.data.xc_text.content,
            value: that.data.value,
            preview_url: that.data.mb_data[that.data.m_index].preview_url,
            value_text: that.data.value_text,
            pid: that.data.pid,
            hb_url: that.data.mb_data[that.data.m_index].hb_url
          }
          app.globalData.fx_data = data;
          //---------------------------------------------

          // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
          // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
          console.log('getUserProfile')
          wx.getUserProfile({
            desc: '平安帖将展示你的身份', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
              console.log('getUserProfile success res')
              console.log(res)
              app.globalData.myuserInfo = res.userInfo;
              app.globalData.hasUserInfo = true;
              // that.setData({
              //   userInfo: res.userInfo,
              //   hasUserInfo: true
              // })
            },
            fail: (res) => {
              console.log('getUserProfile fail res')
              console.log(res)
              app.globalData.myuserInfo = {};
              app.globalData.hasUserInfo = false;
            },
            complete: (res) => {
              console.log('getUserProfile complete res')
              console.log(res.errMsg)

              // if(res.errMsg=='getUserProfile:fail auth cancel'){
              //   return;
              // }
              console.log('我是res.errMsg',res.errMsg);
              console.log(res.errMsg.indexOf('cancel')!=-1);
              if(res.errMsg.indexOf('cancel')!=-1){
                return;
              }

              wx.navigateTo({
                url: '/pages/activities/preview',
              })
            },
          })
        }
      }
    })
  }, 3000),
  goNext: utils.throttle(function (e) {
    let that = this;
    //判断活动是否结束
    if(that.data.remainTime<=0){
      box.showToast("该活动已结束")
      return;
    }
    let hb1_status = that.data.hb1_status;
    if (hb1_status == 0) {
      wx.requestSubscribeMessage({
        tmplIds: ['__nvcVTA7Vx4pD9eVrd-CisiYJ7Wx-X8_wbv8nQQjyc'],
        success(res) {
          console.log('success:' + res);
        },
        fail(res) {
          console.log('fail:' + res);
          console.log(res);
        },
        complete(res) {
          console.log('complete:' + res);
          console.log(res);
          wx.navigateTo({
            url: '/pages/activities/record',
          })
        }
      })

    } else {
      wx.navigateTo({
        url: '/pages/activities/record',
      })
    }
    //埋点
    that.buriedPoint('progress');
  }, 3000),
  buriedPoint:function(type){
    request.request_get('/activity/sendbutn.hn', {
      type: type,
      openid: app.globalData.openid
    }, function (res) {
      console.log('埋点',res)
    })

  },
  closeCanvas: function () {
    this.setData({
      canvasFlag1: 'hidden',
      canvasFlag: 'hidden'
    })
  },
  changeHidden: function () {
    console.log('=============改状态了=====================');
    this.setData({
      hidden: !this.data.hidden
    });
  },
  onTouchMove: function () {

  },

})