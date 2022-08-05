const app = getApp()
var box = require('../../../utils/box.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //是否显示modal弹窗
    show: {
      type: Boolean,
      value: false
    },
    //控制底部是一个按钮还是两个按钮，默认两个
    noCancel: {
      type: Boolean,
      value: false 
    },
    //标题的文字
    title: {
      type: String,
      value: ''
    },
    //取消按钮的文字
    cancelText: {
      type: String,
      value: '取消'
    },
    //确定按钮的文字
    confirmText: {
      type: String,
      value: '提交'
    },
    types: {
      type: String,
      value: "0"
    },
    datas: { //----展示参数
      type: Object
    },
  },
 
  /**
   * 组件的初始数据
   */
  data: {
    policyChecked: false,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击modal的回调函数
    // clickMask() {
    //   // 点击modal背景关闭遮罩层，如果不需要注释掉即可
    //   this.setData({show: false})
    // },
   // 点击取消按钮的回调函数
    cancel() {
      this.setData({ show: false })
      this.triggerEvent('cancel')  //triggerEvent触发事件
    },
    // 点击确定按钮的回调函数
    confirm() {
      // this.setData({ show: false })
      this.triggerEvent('confirm')
    },
    changePolicy(e) {
      console.log(e)
      this.setData({
        policyChecked: !this.data.policyChecked
      })
      console.log(this.data.policyChecked)
    },
    bindUserProtocol(e) {
      let report_temp = e.currentTarget.dataset.fwxyurl;
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
    },
    bindPrivacyPolicy(e) {
      let report_temp = e.currentTarget.dataset.yszzurl;
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
    },
    // 授权手机号
    bindPhoneNumber(e) {
      console.log('---->:',e)
      this.setData({ show: false,policyChecked: false })
      this.triggerEvent('bindPhoneNumber',e)  //triggerEvent触发事件
    },
    getPhoneNumbers(){
      box.showToast("请阅读并勾选协议")
    },
    bindShowDialog(){
      this.setData({ show: false,policyChecked: false })
      this.triggerEvent('bindShowDialog','')
    }
  }
})
