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
    dialogCancel() {
      this.setData({ show: false })
      this.triggerEvent('dialogCancel', '')
    },
    dialogSure() {
      this.setData({ show: false })
      this.triggerEvent('dialogSure', '')
    },
    dialogCancel2() {
      this.setData({ show: false })
      this.triggerEvent('dialogCancel2', '')
    },
    dialogSure2() {
      this.setData({ show: false })
      this.triggerEvent('dialogSure2', '')
    },
  }
})
