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
    let policyPhone = e.currentTarget.dataset.policyphone;
    wx.makePhoneCall({
      phoneNumber: policyPhone,
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
    request.request_get('/Newacid/getPreventionPolicyDetail.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            policyTitle: res.policyTitle,
            policyType: res.policyType,
            policyContent: res.policyContent,
            // policyText: res.policyText,
            // policyList: res.policyList,
            policyCity: res.policycity,
            policyPhone: res.policyphone || '010-12345',
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