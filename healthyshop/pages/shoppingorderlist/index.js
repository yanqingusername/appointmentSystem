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
    typeid: 1,
    showDialog: false,
    dialogData: {
      title: "已经确认收到货品了吗？",
      titles:  "",
      cancel: "取消",
      sure: "确认"
    },
    
  },
  onShow: function () {

  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      typeid: options.typeid
    });
  },
  onReachBottom: function () {
    console.log('1111')
  },
  clickTab(e){
    let typeid = e.currentTarget.dataset.typeid;
    this.setData({
      typeid: typeid
    });
  },
  clickSubmit(e){
    // let ordernum = e.currentTarget.dataset.ordernum;
    // if(ordernum){
      this.setData({
        showDialog: true
      });
    // }
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
    // this.deleteCompanyContactInfo();
  },
   deleteCompanyContactInfo(){
    let params = {
     id: this.data.userinfo_id
    }
    request.request_get('/Newacid/deleteSubject.hn', params, function (res) { 
      if (res) {
        if (res.success) {
          box.showToast('删除成功','',1000);
          setTimeout(()=>{
           wx.navigateBack({
             delta: 1
           })
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
})