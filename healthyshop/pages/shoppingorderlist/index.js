const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    user_id: '',
    userInfo: {},
    typeid: "0",
    showDialog: false,
    dialogData: {
      title: "已经确认收到货品了吗？",
      titles:  "",
      cancel: "取消",
      sure: "确认"
    },

    page: 1,
    limit: 20,
    orderList:[],
    ordernum: ''
    
  },
  onShow: function () {

  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      typeid: options.typeid
    });

    this.getOrderList();
  },
  onReachBottom: function () {
    // this.setData({
    //   page: 1
    // });
    this.getOrderList();
  },
  /**
   * 订单列表
   */
   getOrderList: function () {
    var that = this;
    var data = {
      user_id: this.data.user_id,
      type: this.data.typeid,
      page: this.data.page,
      limit: this.data.limit
    }
    request.request_get('/Newacid/getOrderList.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if (that.data.page == 1) {
            that.setData({
              orderList: res.msg,
              page: (res.msg && res.msg.length > 0) ? that.data.page + 1 : that.data.page
            });
          } else {
            that.setData({
              orderList: that.data.orderList.concat(res.msg || []),
              page: (res.msg && res.msg.length > 0) ? that.data.page + 1 : that.data.page,
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
  clickTab(e){
    let typeid = e.currentTarget.dataset.typeid;
    this.setData({
      typeid: typeid,
      page: 1
    });
    this.getOrderList();
  },
  clickSubmit(e){
    let ordernum = e.currentTarget.dataset.ordernum;
    if(ordernum){
      this.setData({
        showDialog: true
      });
    }
  },
  dialogCancel(){
    this.setData({
     showDialog: false
    });
  },
  dialogSure(){
    this.setData({
     showDialog: false
    });
    this.confirmReceipt();
  },
  confirmReceipt(){
    let that = this;
    let params = {
      user_id: this.data.user_id,
      order_sn: this.data.ordernum
    }
    request.request_get('/Newacid/confirmReceipt.hn', params, function (res) { 
      if (res) {
        if (res.success) {
          box.showToast('确认收货成功','',1000);
          
          setTimeout(()=>{
          //  wx.navigateBack({
          //    delta: 1
          //  });
            that.setData({
              page: 1
            });
            that.getOrderList();
          },1200);
        } else {
          box.showToast(res.msg)
        }
      }else{
        wx.showToast({
          title: '网络不稳定，请重试',
        });
      }
    });
   },
   handleRouter(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
    });
  },
  /**
   * 预约记录
   */
   bindAppointment: function () {
    wx.navigateTo({
      url: '/pages/appointmentRecord/appointmentRecord'
    })
  },
  bindShoppingorderdetail(e) {
    let ordernum = e.currentTarget.dataset.ordernum;
    if(ordernum){
      wx.navigateTo({
        url: `/healthyshop/pages/shoppingorderdetail/index?ordernum=${ordernum}`
      });
    }
  },
})