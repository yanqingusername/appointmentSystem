const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
const utilMd5 = require('../../utils/md5.js');
"use strict";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    isAddAddress: 0,  // 0-默认添加地址   1-选择地址
    urgentBoolean: true,
    detectionTypeArrList:[],
    showModal: false, // 显示modal弹窗
    payment_amount: 0,
    list: [],
    MultiArray: [],
    objectMultiArray: [],
    multiIndex: [0, 0],
    new_payment_amount: 0,
    coupon_id: '',
    coupon_payment: '无',
    best_coupon:0,
    policyChecked: false,
    // 新增
    showModal_4: false,
    address_id: '',
    vip_person: "",
    vip_phone: "",
    province: "",
    city: "",
    area: "",
    address: "",
    service_type: 0,
    service_new_price:'',
            service_price: "",
            price_info_img: "",
            disclaimer_img: "",
            service_title: "",
            service_text: "",
            peoplenumber: 1,
            area_img: "",
            single_price: 0,
            channel:'',
            test_type:'',
            people_amount: 0,
      
  },
  onLoad: function (options) {
    var that = this;
    //获取优惠券
    that.getYHQ();

      that.getDetectionType()
      console.log('小程序进入')
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
 
  getDetectionType: function () {
    var that = this
    var data = {
    }
    request.request_get('/avip/getVIPServiceType.hn', data, function (res) {
      console.log('getDetectionType', res);
      if (res) {
        if (res.success) {
          console.log(res.service_type_info);
          
          that.setData({
            detectionTypeArrList: res.service_type_info,
            service_type: res.service_type_info[0].service_type,
            service_price: res.service_type_info[0].service_price,
            service_new_price: res.service_type_info[0].service_price,
            price_info_img: res.service_type_info[0].price_info_img,
            disclaimer_img: res.service_type_info[0].disclaimer_img,
            service_title: res.service_type_info[0].service_title,
            service_text: res.service_type_info[0].service_text,
            peoplenumber: res.service_type_info[0].appointment_person_num,
            area_img: res.service_type_info[0].area_img,
            single_price: res.service_type_info[0].single_price,
            channel: res.service_type_info[0].channel,
            test_type: res.service_type_info[0].test_type,
            objectMultiArray:res.service_type_info[0].objectMultiArray,
            MultiArray:res.service_type_info[0].MultiArray,
            should_know:res.service_type_info[0].should_know,
            multiIndex: [0, 0],
          })

          if(that.data.objectMultiArray.length > 0 && that.data.objectMultiArray[0].time.length > 0){
            let dataMultiArray=that.data.MultiArray;
            let sec_data = [];
            let timelist = that.data.objectMultiArray[0].time;
            for (var i = 0; i < timelist.length; i++) {
              let timeTitle = '';
              if(timelist[i].can_use == 1){
                timeTitle = ' (已约满)';
              }
              sec_data.push(timelist[i].time_section+""+timeTitle);
            }
            dataMultiArray[1] = sec_data;

            that.setData({
              MultiArray: dataMultiArray
            })
          }

          let service_price = that.data.service_price * 100;
          let single_price = that.data.single_price * 100;
          let peoplenumber = parseInt(that.data.peoplenumber);
          let people_amount = single_price * peoplenumber;
          let payment_amount = (parseInt(service_price) + parseInt(people_amount))/100;
          that.setData({
            payment_amount: payment_amount,
            people_amount: (parseInt(people_amount)/100)
          });


          if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
            that.setData({
              new_payment_amount: that.data.payment_amount
            })
          } else {

            let intPaymentAmount = that.data.payment_amount * 100;
            let intCouponPayment = that.data.coupon_payment * 100;
            let payment_amount = (parseInt(intPaymentAmount) - parseInt(intCouponPayment))/100;
            if(payment_amount > 0){

            }else{
              payment_amount = 0.01;
            }
            that.setData({
              new_payment_amount: payment_amount
            })
          }
          
        } else {
          // box.showToast(res.msg);
        }
      } else {
        //box.showToast("网络不稳定，请重试");
      }
    })
  },
  submitBuffer: utils.throttle(function (e) {

    var that = this;
    
    if (this.data.address_id == '') {
      box.showToast("请选择上门地址");
      return
    }

      if (that.data.policyChecked == false) {
        box.showToast("请阅读并勾选预约须知")
        return
      }

    if (that.data.service_type == 1) {
     
    } else {
      //  新增检测是否在营业时间接口判断
      that.getCheckTime();
      
    }
  }, 3000),

  // 提交确认出库信息
  submit: utils.throttle(function (e) {

    var that = this
    var openid = app.globalData.openid;
    var service_type = that.data.service_type;
    var coupon_payment = that.data.coupon_payment;
   
    // if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
    //   var payment_amount = that.data.payment_amount
    // } else {
    //   let intPaymentAmount = that.data.payment_amount * 100
    //   let intCouponPayment = coupon_payment * 100;
    //   var payment_amount = (parseInt(intPaymentAmount) - parseInt(intCouponPayment))/100;
    //   if(payment_amount > 0){

    //   }else{
    //     payment_amount = 0.01;
    //   }
    // }


    var coupon_id = that.data.coupon_id;
    console.log(openid)

    //----------------------------------------------------------
    let MultiArray = that.data.MultiArray;
    let objectMultiArray = that.data.objectMultiArray;
    let multiIndex = that.data.multiIndex;
    let expect_date = '';
    let expect_time_bucket = '';
    if (MultiArray.length != 0) {

      expect_date = objectMultiArray[multiIndex[0]].date; 
      expect_time_bucket = objectMultiArray[multiIndex[0]].time[multiIndex[1]].time_section;
    }
    //----------------------------------------------------------
    var data1 = {
      open_id: openid,
      service_type: service_type,
      // payment_amount: that.data.new_payment_amount, //正式
      payment_amount: "0.01", //测试
      channel: that.data.channel,  //vip渠道
      expect_date: expect_date,
      expect_time_bucket: expect_time_bucket,
      coupon_id: coupon_id,
      id: '',//传个空就行，预留位字段
      test_type: that.data.test_type,
      address_id:that.data.address_id,
      inspection_person_num: that.data.peoplenumber
    }

    console.log('--data1-->:',data1)

      request.request_get('/avip/addVIPOnlinePaymentOrder.hn', data1, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            console.log(res)
            that.setData({
              appointment_num: res.appointment_num
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
                
                console.log(res)
                wx.requestSubscribeMessage({
                  tmplIds: ['P01rYbqz6L_sbj3JyVz2SfUtU4SWhZ01PQ13j3AoSkE','-2SRPYWbtWO0xbRC2Rkdpm3j3oiTUbQ-O8HnqilmgOs','NNcHm-TIz2xzXQnpnsY-cVNRy2bgMirUg_hiOIJ6vKU'],
                  success(res) {
                    console.log('success:' + res);
                    let data = {
                      openid: app.globalData.openid
                    }
                    request.request_get('/a/sendmsg.hn', data, function (res) {
                      console.info('回调', res)
                    })
                  },
                  fail(res) {
                    console.log('fail:' + res);
                    console.log(res);
                  },
                  complete(res) {
                    console.log('complete:' + res);
                    console.log(res);
                    wx.navigateTo({
                      url: '/pages/appointmentRecord/appointmentDetail?appointment_num=' + that.data.appointment_num + '&isSpecialServices=2',
                    })
                  }
                })
              },
              fail: function (res) {
                box.showToast('支付失败', 'none', 2000)
                console.log(res)
              },
            })
          } else {
            console.log(res.msg);
            box.showToast(res.msg);
          }
          // box.hideLoading();
        } else {
          box.showToast("网络不稳定，请重试");
        }
      })
    
    wx.hideLoading({
      success: (res) => {},
    })
  }, 2000),
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAllAddress();

    var that = this;
    console.log("onshow方法")

    console.log(that.data.payment_amount)
    console.log(that.data.coupon_payment)

    if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
      that.setData({
        new_payment_amount: that.data.payment_amount
      })
    } else {
      let intPaymentAmount = that.data.payment_amount * 100
      let intCouponPayment = that.data.coupon_payment * 100;
      let payment_amount = (parseInt(intPaymentAmount) - parseInt(intCouponPayment))/100;
      if(payment_amount > 0){

      }else{
        payment_amount = 0.01;
      }
      that.setData({
        new_payment_amount: payment_amount
      })
    }
    
  },
  onUnload() {
  },
  changeTestType: function (e) {
    var that = this
    let item = e.currentTarget.dataset.item;
    if(item){
      // let coupon_payment = '';
      // if(that.data.best_coupon==0){
      //   coupon_payment = '无';
      // }else if(that.data.best_coupon==1){
      //   coupon_payment = '不使用';
      // }

      this.getYHQ();

      let urgentBoolean = true;
      if(item.service_type == 1){
        urgentBoolean = false;
      }

      that.setData({
        service_type: item.service_type,
        service_price: item.service_price,
        service_new_price: item.service_price,
        price_info_img: item.price_info_img,
        disclaimer_img: item.disclaimer_img,
        service_title: item.service_title,
        service_text: item.service_text,
        peoplenumber: item.appointment_person_num,
        area_img: item.area_img,
        single_price: item.single_price,
        channel: item.channel,
        test_type: item.test_type,
        objectMultiArray: item.objectMultiArray,
        MultiArray: item.MultiArray,
        should_know: item.should_know,
        multiIndex: [0, 0],
        // coupon_payment: coupon_payment,
        urgentBoolean: urgentBoolean
      })
     
      if(that.data.objectMultiArray.length > 0 && that.data.objectMultiArray[0].time.length > 0){
        let dataMultiArray=that.data.MultiArray;
        let sec_data = [];
        let timelist = that.data.objectMultiArray[0].time;
        for (var i = 0; i < timelist.length; i++) {
          let timeTitle = '';
          if(timelist[i].can_use == 1){
            timeTitle = ' (已约满)';
          }
          sec_data.push(timelist[i].time_section+""+timeTitle);
        }
        dataMultiArray[1] = sec_data;
        that.setData({
          MultiArray: dataMultiArray
        })
      }

      let service_price = that.data.service_price * 100;
      let single_price = that.data.single_price * 100;
      let peoplenumber = parseInt(that.data.peoplenumber);
      let people_amount = single_price * peoplenumber;
      let payment_amount = (parseInt(service_price) + parseInt(people_amount))/100;
      that.setData({
        payment_amount: payment_amount,
        people_amount: (parseInt(people_amount)/100)
      });


      if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
        that.setData({
          new_payment_amount: that.data.payment_amount
        })
      } else {

        let intPaymentAmount = that.data.payment_amount * 100;
        let intCouponPayment = that.data.coupon_payment * 100;
        let payment_amount = (parseInt(intPaymentAmount) - parseInt(intCouponPayment))/100;
        if(payment_amount > 0){

        }else{
          payment_amount = 0.01;
        }
        that.setData({
          new_payment_amount: payment_amount
        })
      }

    }

  },
  showPriceModal: function () {
    this.setData({
      showModal: true
    })
  },
  modalConfirm: function () {
    var that = this
    that.setData({
      showModal: false
    })
  },
  bindYYXZ: utils.throttle(function (e) {
    var report_temp = this.data.should_know
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('预约须知不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/VIP预约须知.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用
          wx.openDocument({
            filePath: Path,
            showMenu: false,
            success: function (res) {
              console.log('打开预约须知成功');
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('预约须知不存在，请联系客服')
        console.log(res); //失败
      }
    })
  }, 2000),
  
  changePolicy(e) {
    console.log(e)
    this.setData({
      policyChecked: !this.data.policyChecked
    })
  },
  bindCouponCheck: function () {
    let that = this;
    console.log(that.data.coupon_id);
    console.log(that.data.coupon_payment);
    if(that.data.coupon_payment=='无'){
      return;
    }

    wx.navigateTo({
      url: '/pages/coupon/couponCheck?coupon_id=' + that.data.coupon_id+'&coupon_payment='+that.data.coupon_payment,
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)

    this.setData({
      multiIndex: e.detail.value
    })

  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    console.log(this.data.multiIndex);
    var data = {
      MultiArray: this.data.MultiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    if (e.detail.column == 0) {
      //第一个数组
      //值是e.detail.value
      let sec_data = [];
      let timelist = this.data.objectMultiArray[e.detail.value].time;
      for (var i = 0; i < timelist.length; i++) {
        let timeTitle = '';
        if(timelist[i].can_use == 1){
          timeTitle = ' (已约满)'
        }
        sec_data.push(timelist[i].time_section+""+timeTitle);
      }
      console.log('data.MultiArray[1]');
      console.log(data.MultiArray);
      data.MultiArray[1] = sec_data;
      console.log('data.multiIndex[1]');
      console.log(data.multiIndex[1]);
      data.multiIndex[1] = 0;
    }

    this.setData(data);
  },
  /**
   * 添加地址
   */
  bindAddAddress(){
    if(this.data.isAllAddress == 1){
      wx.navigateTo({
        url: '/pages/addressSelect/index'
      });
    }else{
      wx.navigateTo({
        url: '/pages/addressAdd/index?isAddAddress=0'
      });
    }
  },
  bindSelectAddress(){
    wx.navigateTo({
      url: '/pages/addressSelect/index'
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
          if(res && res.result && res.result.length > 0){
            that.setData({
              isAllAddress: 1
            })

            let isAddAddressNew = 0;
            let address_id_new = '';
            for(let i = 0; i < res.result.length; i++){
              if(res.result[i].id == that.data.address_id){
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
  getCheckTime(){
    let that = this;

    let MultiArray = that.data.MultiArray;
    let objectMultiArray = that.data.objectMultiArray;
    let multiIndex = that.data.multiIndex;
    let expect_date = '';
    let expect_time_bucket = '';
    if (MultiArray.length != 0) {
      expect_date = objectMultiArray[multiIndex[0]].date;
      expect_time_bucket = objectMultiArray[multiIndex[0]].time[multiIndex[1]].time_section;
    }
    
    let data = {
      service_type: that.data.service_type,
      expect_date:expect_date,
      expect_time_bucket:expect_time_bucket,
      address_id: that.data.address_id
    }
    console.log('--1111-->:',data)
    request.request_get('/avip/is_during_vip_business_hours.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
          if (res.during_business_hours){
            that.bindshowModal_4();
          } else {
            box.showToast(res.Tips);
          }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindshowModal_4: function () {
      this.setData({
        showModal_4: true
      });
  },
  modalConfirm_4: utils.throttle(function () {
    var that = this
    that.setData({
      showModal_4: false
    })
    that.submit()
  }, 2000),
  modalCancel_4: function () {
    var that = this
    that.setData({
      showModal_4: false
    })
  },
  // 受检人数
  bindPeopleNumber: function (e) {
    var str = e.detail.value;
    this.setData({
      peoplenumber: str
    })
    this.setPrice();
  },
  bindReduce: function () {
    let str = this.data.peoplenumber;
    let service_type = this.data.service_type;
    if(service_type == 1){
      if(str > 100){
        str--;
        this.setData({
          peoplenumber: str
        });
      }
    } else {
      if(str > 1){
        str--;
        this.setData({
          peoplenumber: str
        });
      }
    }

    this.setPrice();
  },
  bindAdd: function () {
    let str = this.data.peoplenumber;
    let service_type = this.data.service_type;
    if(service_type == 1){
        str++;
        this.setData({
          peoplenumber: str
        });
    } else {
      if(str < 5){
        str++;
        this.setData({
          peoplenumber: str
        });
      }
    }

    this.setPrice();
  },
  setPrice(){
      let that = this;

      if(that.data.service_type == 1){
        let peopleSun = parseInt(that.data.peoplenumber);
        if(peopleSun > 200){
          let a = that.data.service_new_price * 100;
          let e = ((peopleSun-1)/200);
          let d = Math.floor(e);
          let b = (1000 * d) * 100;
          let c = (parseInt(a) + parseInt(b))/100;

          that.setData({
            service_price: c
          });
        }else{
          that.setData({
            service_price: that.data.service_new_price
          });
        }
      }

      let service_price = that.data.service_price * 100;
      let single_price = that.data.single_price * 100;
      let peoplenumber = parseInt(that.data.peoplenumber);
      let people_amount = single_price * peoplenumber;
      let payment_amount = (parseInt(service_price) + parseInt(people_amount))/100;
      that.setData({
        payment_amount: payment_amount,
        people_amount: (parseInt(people_amount)/100)
      });


      if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
        that.setData({
          new_payment_amount: that.data.payment_amount
        })
      } else {

        let intPaymentAmount = that.data.payment_amount * 100;
        let intCouponPayment = that.data.coupon_payment * 100;
        let payment_amount = (parseInt(intPaymentAmount) - parseInt(intCouponPayment))/100;
        if(payment_amount > 0){

        }else{
          payment_amount = 0.01;
        }
        that.setData({
          new_payment_amount: payment_amount
        })
      }
  },
  hidePicker(){
    this.setData({
      isShow: false
    });
  },
  hidePickerCall(){
    this.setData({
      isShow: false
    });
    wx.makePhoneCall({
      phoneNumber: '4008693888',
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
  phoneCall: function (e) {
    this.setData({
      isShow: true
    });
    // var that = this;
    // console.log(e)
    // wx.makePhoneCall({
    //   phoneNumber: '4008693888',
    //   success: function () {
    //     console.log("成功拨打电话")
    //   },
    // })
  },
  changeAddressDetails: utils.throttle(function (e) {
    var report_temp = this.data.area_img
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('地图不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/地图详情.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用
          wx.openDocument({
            filePath: Path,
            showMenu: false,
            success: function (res) {
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('地图不存在，请联系客服')
        console.log(res); //失败
      }
    })
  }, 2000),
})