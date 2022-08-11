const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    policyTitle: "",
    policyType: '',
    policyContent: '',
    policyText: '',
    policyList: [],
    policyCity: '',
    policyPhone: '',

    // {
    //   content: '1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字。'
    // },
    // {
    //   content: '1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字。'
    // },
    // {
    //   content: '1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字。'
    // }
  
  },

  onShow: function () {
    
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    });
    this.getPreventionPolicyDetail();
  },
  phoneCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: this.data.policyPhone,
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
  getPreventionPolicyDetail: function () {
    var that = this;
    var data = {
      id: this.data.id
    }
    request.request_get('/a/getPreventionPolicyDetail.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            policyTitle: res.policyTitle,
            policyType: res.policyType,
            policyContent: res.policyContent,
            // policyText: res.policyText,
            // policyList: res.policyList,
            policyCity: res.policycity,
            policyPhone: res.policyphone,
          });
          let policyText = res.policyText;
          let policyList = [];
          if(policyText){
            policyList = policyText.split('<br/>');
            that.setData({
              policyList: policyList
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
})