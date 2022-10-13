const app = getApp()
const box = require('../../../utils/box.js')
const request = require('../../../utils/request.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
const utilMd5 = require('../../../utils/md5.js');
const util = require('../../../utils/util.js')
"use strict";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    ordernum: "",
    orderstatus: '1',
    shopid: '',
    shopsubtitle: "【满100减20】",
    shoptitle: "培怡 益生菌固体饮料 美国进口菌种 12袋/盒",
    shopprice: 299,
    shopnumber: 1,
    address_person: "某某某",
    address_phone: "13781234717",
    province: "北京",
    city: "朝阳区",
    area: "呼家楼花苑小区",
    address: "甲28号",
    remarkText: "无",
    ordernumber: "3901221123314489",
    coupon_payment: "0",
    order_payment: "299",
    order_time: "2022-09-16 23:44:09",
    return_time: "2022-09-16 23:44:09",
    courier_name: "申通快递",
    courier_number: "ST882761729",

    showDialog: false,
    dialogData: {
      title: "已经确认收到货品了吗？",
      titles:  "",
      cancel: "取消",
      sure: "确认"
    },

    time:""
  },
  onLoad: function (options) {
    this.setData({
      ordernum: options.ordernum
    });

    // let timestamp = Date.parse(new Date());
    // timestamp=timestamp/1000;
    // console.log(timestamp)

    this.countDown(23445, 2);
  },
  getYHQ:function(){
    //获取优惠券
    //通过openid
    let that = this;
    let data = {
      openid:app.globalData.openid
    }
    request.request_get('/activity/getCouponBest.hn', data, function (res) {
      if (!res) {
        return;
      }
      if (!res.success) {
        return;
      }
      // TODO
      that.setData({
        coupon_id:res.msg.coupon_id,
        coupon_payment:res.msg.coupon_payment,
        best_coupon:1
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  onUnload() {
  },
  phoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: '4008693888',
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
  handleRouter(e){
    let shopid = e.currentTarget.dataset.id;
    if(shopid){
      wx.navigateTo({
        url: `/healthyshop/pages/shoppingdetail/index?shopid=${shopid}`
      });
    }
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
  clickOther: utils.throttle(function (e) {
    var report_temp = this.data.yszz_url;
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
  }, 2000),
  bindCopy: function(e){
    let number = e.currentTarget.dataset.number;
    if(number){
      wx.setClipboardData({
        data: number,
        success (res) {
          wx.getClipboardData({
            success (res) {
              wx.showToast({
                title: '内容已复制',
              })
              console.log(res.data) // data
            }
          })
        }
      })
    }
  },
  countDown(val, val1) { //---倒计时
    setTimeout(() => {
      val--;
      let down = util.down(val);

      if (val < 0) {
        this.setData({
          time: ""
        });
      } else {
        if (val1 == 1) {
          this.setData({
            time: "剩余" + down.minStr + ":" + down.secStr + "自动关闭"
          });
        } else if (val1 == 2) {
          this.setData({
            time: "剩余" + down.dayStr + "天" + down.hrStr + "小时自动确认收货"
          });
          // 剩余12天19小时
        }

        this.countDown(val, val1);
      }
    }, 1000)
  },
})