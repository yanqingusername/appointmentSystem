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
    user_id: "",
    oldaddid: ""
  },
  onShow: function () {
    this.getAllAddress();
  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      isMine: options.isMine,
      oldaddid: options.oldaddid || ""
    });
  },
  getAllAddress(){
    let that = this;
    let data = {
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/getShoppingAddress.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            dataList: res.msg
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
      if(item){
        let pages = getCurrentPages(); 
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
          isAddAddress: 1,
          address_id: item.id,
          address_person: item.receive_name,
          address_phone: item.phone,
          province: item.province,
          city: item.city,
          area: item.region,
          address: item.detail_address,
          isBindBackFlag: false
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
    if(item){
      wx.navigateTo({
        url:`/healthyshop/pages/addressAdd/index?isAddAddress=2&title=编辑地址&jsonItem=${jsonItem}&isMine=${this.data.isMine}&oldaddid=${this.data.oldaddid}`
      });
    }
  }
})