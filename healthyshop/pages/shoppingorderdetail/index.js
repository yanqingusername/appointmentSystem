const app = getApp()
const box = require('../../../utils/box.js')
const request = require('../../../utils/request.js')
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
    shopimage: "",
    shopsubtitle: "",
    shoptitle: "",
    shopprice: 0,
    shopnumber: 1,
    address_person: "",
    address_phone: "",
    province: "",
    city: "",
    area: "",
    address: "",
    remarkText: "无",
    coupon_payment: "0",
    order_payment: "0",
    order_time: "",
    return_time: "",
    courier_name: "",
    courier_number: "",
    remainingTime: "", // 剩余时间
    // total_amount
    delivery_time: "",

    showDialog: false,
    dialogData: {
      title: "已经确认收到货品了吗？",
      titles:  "",
      cancel: "取消",
      sure: "确认"
    },

    time:"",
    user_id: "",
    openid: "",

    productDescriptionList: []
  },
  onLoad: function (options) {
    this.setData({
      ordernum: options.ordernum,
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      openid: wx.getStorageSync('coyote_userinfo').openid || '',
    });

    this.getOrderInfo();
    this.getProductDescription();
  },
  /**
   * 获取订单详情接口
   */
  getOrderInfo:function(){
    let that = this;
    let data = {
      user_id: this.data.user_id,
      order_sn: this.data.ordernum
    }
    request.request_get('/Newacid/getOrderInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res && res.msg && res.msg.length > 0){
            let orderItem = res.msg[0];

            that.setData({
              orderstatus: orderItem.status || '1',
              shopid: orderItem.product_code,
              address_person: orderItem.receiver_name,
              address_phone: orderItem.receiver_phone,
              province: orderItem.receiver_province,
              city: orderItem.receiver_city,
              area: orderItem.receiver_region,
              address: orderItem.receiver_detail_address,
              remarkText: orderItem.note || '无',
              coupon_payment: orderItem.coupon_amount || "0",
              order_payment: orderItem.pay_amount || "0",
              order_time: orderItem.payment_time,
              return_time: orderItem.refund_time,
              courier_name: orderItem.delivery_company,
              courier_number: orderItem.delivery_sn,
              shopnumber: orderItem.product_num || 1,
              remainingTime: orderItem.remainingTime, // 剩余时间
              // total_amount
              delivery_time: orderItem.delivery_time,
            });

            that.getShopInfo();

            if(that.data.delivery_time){
              that.countDown(that.data.remainingTime, 2);
            }
          }
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
  /**
   * 获取商品详情
   */
   getShopInfo: function () {
    let that = this;
    let data = {
      product_code: this.data.shopid,
    }
    request.request_get('/Newacid/getShopInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res && res.msg){
            let headImg = res.msg.headImg || [];
            if(headImg.length > 0){
              that.setData({
                shopimage: headImg[0].imgurl,  // 商品顶部头图
              });
            }
            that.setData({
              shopid: res.msg.product_code, // 商品id
              // shopimage: res.msg.headImg[0],  // 商品顶部头图
              shopsubtitle: res.msg.subtitle, // 商品副标题
              shoptitle: res.msg.title, // 商品标题
              shopprice: res.msg.price || 0, // 商品价格
              oldprice: res.msg.oldprice, // 商品原价格
              freeshipping: res.msg.tips, // 商品标签
              shopdetailimg: res.msg.img,  // 商品详情图
              isGrounding: res.msg.is_use, // 商品是否上架 0-上架  1-下架
              product_type: res.msg.product_type // 商品种类id
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
  /**
   * 获取产品使用说明
   */
   getProductDescription: function () {
    let that = this;
    let data = {
    }
    request.request_get('/Newacid/productDescription.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res && res.msg){
            that.setData({
              productDescriptionList: res.msg
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    });
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
  clickSubmit(){
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
    this.confirmReceipt();
  },
  confirmReceipt(){
    let params = {
      user_id: this.data.user_id,
      order_sn: this.data.ordernum
    }
    request.request_get('/Newacid/confirmReceipt.hn', params, function (res) { 
      if (res) {
        if (res.success) {
          box.showToast('确认收货成功','',1000);
          setTimeout(()=>{
           wx.navigateBack({
             delta: 1
           });
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
  clickOther(e){
    let itemobj = e.currentTarget.dataset.itemobj;
    let description = itemobj.description;
    let report_temp = itemobj.href;

    if(description && report_temp){
      wx.downloadFile({
        url: report_temp, //要预览的PDF的地址
        filePath: wx.env.USER_DATA_PATH + '/' + description + '.pdf',
        success: function (res) {
          console.log(res);
          if (res.statusCode === 200) { //成功
            var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用

            wx.openDocument({
              filePath: Path,
              showMenu: false,
              success: function (res) {
                console.log('打开'+description+'成功');
              }
            })
          }
        },
        fail: function (res) {
          box.showToast('产品使用说明不存在，请联系客服')
          console.log(res); //失败
        }
      })
    } else {
      box.showToast(description+'产品使用说明不存在，请联系客服')
    }
  },
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