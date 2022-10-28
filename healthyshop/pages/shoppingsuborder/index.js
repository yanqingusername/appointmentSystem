const app = getApp()
const box = require('../../../utils/box.js')
const request = require('../../../utils/request.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
const utilMd5 = require('../../../utils/md5.js');
"use strict";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    isAddAddress: 0, // 0-默认添加地址   1-选择地址

    coupon_id: '',
    coupon_payment: '0',
    coupon_title: '无',
    // 新增
    address_id: '',
    address_person: "",
    address_phone: "",
    province: "",
    city: "",
    area: "",
    address: "",
    remarkText: '',

    shopid: '',
    shopimage: "",
    shopsubtitle: "",
    shoptitle: "",
    shopprice: 0,
    shopnumber: 1,
    oldprice: 0, // 商品原价格
    freeshipping: "", // 商品标签
    isGrounding: "", // 商品是否上架 0-上架  1-下架
    product_type: "", // 商品种类id

    total_payment: 0,
    shop_payment: 0,

    user_id: "",

    couponList: [],

    bottomLift: 15,

    policyChecked: false,
    shopxz_pdf: ''
  },
  onLoad: function (options) {
    let that = this;

    this.setData({
      shopid: options.shopid,
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    });

    this.getShopInfo();
    this.getUserInfoOrder();
    
    this.getBottomLift();
    
  },
  getBottomLift(){
    let that = this;
    //获取当前设备信息
    wx.getSystemInfo({
      success: res => {
        let bottomLift = res.screenHeight - res.safeArea.bottom;
        if(bottomLift>0){
          that.setData({
            bottomLift: bottomLift
          });
        }
      },
      fail(err) {
        console.log(err);
      }
    });
  },
  /**
   * 获取商品用户提交订单信息
   */
   getUserInfoOrder: function () {
    let that = this;
    let data = {
      product_code: this.data.shopid,
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/getUserInfoOrder.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res && res.msg){
            let address = res.msg.address;
            if(address && address.length > 0){
              that.setData({
                address_id: address.id,
                address_person: address.receive_name,
                address_phone: address.phone,
                province: address.province,
                city: address.city,
                area: address.region,
                address: address.detail_address,
              });
            }

            if(that.data.address_id){
              that.setData({
                isAllAddress: 1,
                isAddAddress: 1
              });
            }else{
              that.setData({
                isAllAddress: 0,
                isAddAddress: 0
              });
            }

            that.setData({
              couponList: res.msg.coupon,
              shopxz_pdf: res.msg.pdf
            });
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
            that.setData({
              shopid: res.msg.product_code, // 商品id
              shopimage: res.msg.headImg[0],  // 商品顶部头图
              shopsubtitle: res.msg.subtitle, // 商品副标题
              shoptitle: res.msg.title, // 商品标题
              shopprice: res.msg.price, // 商品价格
              oldprice: res.msg.oldprice, // 商品原价格
              freeshipping: res.msg.tips, // 商品标签
              shopdetailimg: res.msg.img,  // 商品详情图
              isGrounding: res.msg.is_use, // 商品是否上架 0-上架  1-下架
              product_type: res.msg.product_type // 商品种类id
            });

            that.setPrice();
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
    // this.getAllAddress();

    var that = this;

    // if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
    //   that.setData({
    //     new_payment_amount: that.data.payment_amount
    //   })
    // } else {
    //   let intPaymentAmount = that.data.payment_amount * 100
    //   let intCouponPayment = that.data.coupon_payment * 100;
    //   let payment_amount = (parseInt(intPaymentAmount) - parseInt(intCouponPayment))/100;
    //   if(payment_amount > 0){

    //   }else{
    //     payment_amount = 0.01;
    //   }
    //   that.setData({
    //     new_payment_amount: payment_amount
    //   })
    // }

  },
  onUnload() {},
  /**
   * 添加地址
   */
  bindAddAddress() {
    if (this.data.isAllAddress == 1) {
      wx.navigateTo({
        url: '/healthyshop/pages/addressSelect/index'
      });
    } else {
      wx.navigateTo({
        url: '/healthyshop/pages/addressAdd/index?isAddAddress=0'
      });
    }
  },
  bindSelectAddress() {
    wx.navigateTo({
      url: '/healthyshop/pages/addressSelect/index'
    });
  },
  handleRouter(e) {
    let id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
    });
  },
  clickCoupon(e) {
    this.setData({
      isShow: true
    });
  },
  hideModal(e) {
    this.setData({
      isShow: false
    });
    if (this.data.coupon_id) {
      this.setData({
        select_coupon_id: this.data.coupon_id,
        select_coupon_payment: this.data.coupon_payment,
        select_coupon_title: this.data.coupon_title
      });
    } else {
      this.setData({
        select_coupon_id: '',
        select_coupon_payment: 0,
        select_coupon_title: '无',
      });
    }
  },
  onConfirm(e) {
    // if(this.data.select_coupon_id){
    this.setData({
      isShow: false,
      coupon_id: this.data.select_coupon_id,
      coupon_payment: this.data.select_coupon_payment,
      coupon_title: this.data.select_coupon_title,
    });

    this.setPrice();
    // }else{
    //   box.showToast("请选择优惠券");
    // }
  },
  getAllAddress() {
    let that = this;
    var openid = app.globalData.openid;
    let data = {
      open_id: openid
    }
    request.request_get('/avip/getAppointmentAddress.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if (res && res.result && res.result.length > 0) {
            that.setData({
              isAllAddress: 1
            })

            let isAddAddressNew = 0;
            let address_id_new = '';
            for (let i = 0; i < res.result.length; i++) {
              if (res.result[i].id == that.data.address_id) {
                isAddAddressNew = 1;
                address_id_new = that.data.address_id;
              }
            }
            that.setData({
              isAddAddress: isAddAddressNew,
              address_id: address_id_new
            });
          } else {
            that.setData({
              isAllAddress: 0,
              isAddAddress: 0
            })
          }
        } else {
          // box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindReduce: function () {
    let str = this.data.shopnumber;
    if (str > 1) {
      str--;
      this.setData({
        shopnumber: str
      });
    }
    this.setPrice();
  },
  bindAdd: function () {
    let str = this.data.shopnumber;
    str++;
    this.setData({
      shopnumber: str
    });

    this.setPrice();
  },
  setPrice() {
    let that = this;

    let shopnumber = parseInt(that.data.shopnumber);
    let shopprice = parseInt(that.data.shopprice);
    let coupon_payment = parseInt(that.data.coupon_payment);
    let total_payment = shopnumber * shopprice;
    let shop_payment = (parseInt(total_payment) - coupon_payment);
    that.setData({
      total_payment: total_payment,
      shop_payment: shop_payment
    });
  },

  searchChangeHandle: function (e) {
    this.setData({
      remarkText: e.detail.value
    })
  },
  changePolicy(e) {
    this.setData({
      policyChecked: !this.data.policyChecked
    })
  },
  bindYYXZ: utils.throttle(function (e) {
    var report_temp = this.data.shopxz_pdf
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('产品知情同意书不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/产品知情同意书.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用
          wx.openDocument({
            filePath: Path,
            showMenu: false,
            success: function (res) {
              console.log('打开产品知情同意书成功');
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('产品知情同意书不存在，请联系客服')
        console.log(res); //失败
      }
    })
  }, 2000),
  clickOrderDetail: utils.throttle(function (e) {
    let that = this;
    // if (this.data.address_id == '') {
    //   box.showToast("请选择收货地址");
    //   return;
    // }

    //   if (that.data.policyChecked == false) {
    //     box.showToast("请阅读并勾选预约须知")
    //     return
    //   }

    let params = {
      address_id: this.data.address_id,
      address_person: this.data.address_person,
      address_phone: this.data.address_phone,
      province: this.data.province,
      city: this.data.city,
      area: this.data.area,
      address: this.data.address,
      coupon_id: this.data.coupon_id,
      shopid: this.data.shopid,
      shop_payment: this.data.shop_payment,
      shopnumber: this.data.shopnumber,
      remarkText: this.data.remarkText,
    }

    console.log('---->:',params)

    // wx.navigateTo({
    //   url: `/healthyshop/pages/shoppingorderdetail/index?ordernum=123`
    // });
  }, 3000),
  // 提交确认出库信息
  submit: utils.throttle(function (e) {

    let that = this;
    let openid = app.globalData.openid;
    let coupon_id = that.data.coupon_id;
    let address_id = that.data.address_id;
    let shopid = that.data.shopid;
    let shop_payment = that.data.shop_payment;
    let remarkText = that.data.remarkText;

    var data = {
      open_id: openid,
      coupon_id: coupon_id,
      shopid: shopid,
      address_id: address_id,
      shop_payment: shop_payment, //正式
      // payment_amount: "0.01", //测试
      remarkText: remarkText
    }

    console.log('--data1-->:', data)

    request.request_get('/avip/addVIPOnlinePaymentOrder.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            ordernum: res.ordernum
          })
          //------------------小程序前端签名start------------------
          let appId = "wx8d285cecdc37a3b5";
          let stringA = "appId=" + appId + "&nonceStr=" + res.nonceStr + "&package=" + res.package1 + "&signType=MD5&timeStamp=" + res.timeStamp;
          let stringSignTemp = stringA + "&key=CRNmzBCrbxGVZUoz3xtmvrGBIM5YH5hJ" //注：key为商户平台设置的密钥key
          let sign = utilMd5.hexMD5(stringSignTemp).toUpperCase(); //注：MD5签名方式

          //------------------小程序前端签名end------------------
          wx.requestPayment({
            appId: appId,
            nonceStr: res.nonceStr,
            package: res.package1,
            paySign: sign,
            timeStamp: res.timeStamp,
            signType: 'MD5',
            success: function (res) {
              wx.requestSubscribeMessage({
                tmplIds: ['P01rYbqz6L_sbj3JyVz2SfUtU4SWhZ01PQ13j3AoSkE', '-2SRPYWbtWO0xbRC2Rkdpm3j3oiTUbQ-O8HnqilmgOs', 'NNcHm-TIz2xzXQnpnsY-cVNRy2bgMirUg_hiOIJ6vKU'],
                success(res) {
                  let data = {
                    openid: app.globalData.openid
                  }
                  request.request_get('/a/sendmsg.hn', data, function (res) {
                    console.info('回调', res)
                  })
                },
                fail(res) {
                  console.log('fail:' + res);
                },
                complete(res) {
                  wx.navigateTo({
                    url: `/healthyshop/pages/shoppingorderdetail/index?ordernum=${that.data.ordernum}`
                  })
                }
              })
            },
            fail: function (res) {
              box.showToast('支付失败', 'none', 2000)
            },
          })
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
    wx.hideLoading({
      success: (res) => {},
    })
  }, 2000),
  clickSelectCoupon(e) {
    let couponid = e.currentTarget.dataset.couponid;
    let couponpayment = e.currentTarget.dataset.couponpayment;
    let coupontitle = e.currentTarget.dataset.coupontitle;

    if (couponid == this.data.select_coupon_id) {
      this.setData({
        select_coupon_id: '',
        select_coupon_payment: 0,
        select_coupon_title: '无',
      });
    } else {
      this.setData({
        select_coupon_id: couponid,
        select_coupon_payment: couponpayment,
        select_coupon_title: coupontitle,
      });
    }
  }
})