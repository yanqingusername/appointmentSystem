const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "选择地址",
    dataList: [],
    isMine: 0,
  },
  onShow: function () {
    this.getAllAddress();
  },
  onLoad: function (options) {
    this.setData({
      isMine: options.isMine
    });
  },
  getAllAddress(){
    let that = this;
    var openid = app.globalData.openid;
    let data = {
      open_id: openid
    }
    request.request_get('/avip/getAppointmentAddress.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            dataList: res.result
          })
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  /**
   * 添加地址
   */
  bindAddAddress(){
    wx.navigateTo({
      url:`/healthyshop/pages/addressAdd/index?isAddAddress=1&isMine=${this.data.isMine}`
    });
  },
  /**
   * 选择地址
   */
  bindSelectAddress(e){
    if(this.data.isMine == 1){

    }else{
      let item = e.currentTarget.dataset.item;
      console.log('--item-->:',item)
      if(item){
        let pages = getCurrentPages(); 
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
          isAddAddress: 1,
          address_id: item.id,
          address_person: item.address_person,
          address_phone: item.address_phone,
          province: item.province,
          city: item.city,
          area: item.area,
          address: item.address,
        })
        wx.navigateBack({
          delta: 1, 
        })
      }
    }
  },
  /**
   * 编辑地址
   */
  bindEditAddress(e){
    let item = e.currentTarget.dataset.item;
    let jsonItem = JSON.stringify(item);
    console.log('--item-->:',item)
    if(item){
      wx.navigateTo({
        url:`/healthyshop/pages/addressAdd/index?isAddAddress=2&title=编辑地址&jsonItem=${jsonItem}&isMine=${this.data.isMine}`
      });
    }
  }
})