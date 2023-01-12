// pages/createOrder/createOrder.js
const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
const utilMd5 = require('../../utils/md5.js');
"use strict";
const chooseLocation = requirePlugin('chooseLocation');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: '0',
    bindBackFlag: false,
    // forbiddenFlag:false,//禁止进入选择采样点页面
    checkbox_arr: [],
    phoneCode: ["", ""], //正确的 手机号 和 验证码
    showModal: false, // 显示modal弹窗
    showModal_2: false, //流调弹框
    showModal_3: false,
    dynamicTimeFlag: 0,
    survey_flag: true, //流调是否通过
    fever: 0,
    timeModalFlag: false, //是否显示带时间带急检模版
    return_home: 0,
    high_risk_area_tourism: 0,
    high_risk_area_contact: 0,
    symptom: 0,
    peer_high_risk_occupation: 0,
    payment_amount: 0,
    list: [],
    intoByScanFlag: false,
    age: '',
    checkbox_arr: ['L'],
    serviceIndex: 0,
    address: "",
    locationName: "",
    choose_type: 0,
    name: "",
    phone: "",
    onlineid: 1,
    time: '',
    typeid: -1,
    code: '',
    idcard: '',
    showIDcardModal: false,
    onlineFlag: true,
    onlineFlagNum: 0,
    flag: true,
    payment_working_time: '',
    fromContinueFlag: false, //是否从'继续预约下一人'页面跳转而来
    cardList: ['二代身份证', '护照', '港澳台通行证'],
    genderList: ['男', '女'],
    cardIndex: 0,
    genderIndex: 0,
    gender: '男',
    pay_channel: '微信',
    codeBtText: '获取验证码',
    codeBtState: false,
    hiddenFlag: false,
    currentTime: 60,
    surveyArr: [],
    keyboard_type: 'idcard',
    keyboard_type_limit_num: 18,
    policyChecked: false,
    coupon_id: '',
    coupon_payment: '无',
    best_coupon:0,
    swiperCurrent: 0,
    movies: [],
    pickerConfig: {
      endDate: false,
      column: "minute",
      dateLimit: true,
      initStartTime: time.format_hour(new Date(new Date().getTime())),
      limitStartTime: time.format_hour(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3)),
      limitEndTime: time.format_hour(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7))
    },
    // 开始时间参数设置
    startIsPickerRender: false,
    startIsPickerShow: false,
    startTime: time.format_hour3(new Date(new Date().getTime())).toString() + ":00",
    startChartHide: false,
    MultiArray: [],
    objectMultiArray: [],
    multiIndex: [0, 0],
    new_payment_amount: 0,
    // 新增
    showNotice: false,
    isAddSubject: 0,  // 0-默认添加受检人   1-选择受检人
    card_name: '',
    userinfo_id: '',
    isAllSubject: 0, // 判断是否有受检人
    isShowTime: false, // 是否在营业时间内
    isXSH: 0, // 0 不显示  1 显示
    isShowXSH: false,
    isShowCanUse: false,
    is_promise: 2, //是否显示公告 1-显示  2-隐藏
    showModal_4: false,
    is_paynotice: 2,//是否显示付款须知 1-显示  2-隐藏
    paynotice_title: '',
    paynotice_url: '',

    user_id: '',
    openid: '',

    isH5Show: 1
  },
  onLoad: function (options) {

    this.setData({
      isH5Show: options.isH5Show || '1',
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      openid: wx.getStorageSync('coyote_userinfo').openid || '',
    });

    var that = this;
    // console.log(utils.checkAuditTime('09:00-12:00'));
    // console.log(utils.checkAuditTime('09:00-01:00'));
    // that.showSurvey();
    that.getLocationAuth();
    that.getBannerList();
    //获取优惠券
    that.getYHQ();


    console.log(that.data.card_type)
    console.log(that.data.cardIndex)
    console.log(options)
    // console.log(app.globalData.fixChannel)
    if (options.fromContinueFlag) {
      if (options.dynamicTimeFlag == 1) {
        that.setData({
          dynamicTimeFlag: 1,
          intoByScanFlag: true
        })
      }
      console.log(options)
      console.log(options.fromContinueFlag)
    } else {
      // that.bindHistoryInfo()
    }

    that.setData({
      choose_type: options.choose_type, //0 微信 1 三方
    })
    if (options.fix_channel_id != undefined && options.fix_channel_id != -1) {
      console.log('扫固定采样点二维码首次进入')
      var channel_id = options.fix_channel_id;
      that.setData({
        hiddenFlag: true,
        channel_id: channel_id,
        // forbiddenFlag:true,
        intoByScanFlag: true, //通过扫固定采样点二维码进入,
        dynamicTimeFlag: 1
      })
      that.getFixedChannel(options.fix_channel_id); // 固定采样点
    } else {
      let choMap = options.choMap || 0;
      if (choMap == 1) {
        let jsonItem = options.channel;
        let typeid = options.typeid;
        let channel = JSON.parse(jsonItem);
        console.log('---->:',channel)
        that.setData({
          channel: channel,
          typeid: typeid
        });
        that.getFixedChannel(that.data.channel.channel_id); // 选中新采样点返回
        console.log('选中新采样点返回')
        var channel_id = that.data.channel.channel_id;
        that.setData({
          channel_id: channel_id,
        })
      }else{
        that.getChannelList();
      }
      console.log('小程序进入')
    }

  },
  getYHQ:function(){
    //获取优惠券
    //通过openid
    let that = this;
    let data = {
    openid: this.data.openid
    }
    // that.setData({
    //   coupon_id:1,
    //   coupon_payment:5
    // })
    request.request_get('/activity/getCouponBest.hn', data, function (res) {
      console.log('---------------getCouponBest---------------', res);
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
  modalConfirm_2: function () {
    var that = this
    var survey_flag = that.data.survey_flag
    if (survey_flag == false) {
      wx.showModal({
        content: '请立即去就近医院或发热门诊进行检查！',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
        }
      })
      return;
    } else {
      that.setData({
        showModal_2: false
      })
    }
    if (that.data.intoByScanFlag == true) {
      var channel_id = that.data.channel_id
    } else {
      var channel_id = ''
    }
    var data = {
      openid: this.data.openid,
      channel_id: channel_id,
      fever: that.data.fever,
      return_home: that.data.return_home,
      high_risk_area_tourism: that.data.high_risk_area_tourism,
      high_risk_area_contact: that.data.high_risk_area_contact,
      symptom: that.data.symptom,
      peer_high_risk_occupation: that.data.peer_high_risk_occupation
    }
    request.request_get('/Newacid/epidemiologicalSurvey.hn', data, function (res) {
      console.log('epidemiologicalSurvey', res);
      if (res) {
        if (res.success) {
          console.log(res.msg);
        } else {
          console.log(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  getDetectionType: function () {
    var that = this
    // console.log(app.globalData.channel_id)
    var channel_id = that.data.channel.channel_id
    var data = {
      flag: 0, //1 动态加载  0 全部加载 本来是参数dynamicTimeFlag
      channel_id: channel_id
    }
    request.request_get('/Newacid/getDetectionType.hn', data, function (res) {
      console.log('getDetectionType', res);
      if (res) {
        if (res.success) {
          console.log(res.msg);
          var detectionTypeArr = res.msg;
          if (that.data.intoByScanFlag == true) {
            for (var i = 0; i < detectionTypeArr.length; i++) {
              console.log(utils.checkAuditTime_before30min(detectionTypeArr[i].working_time))
              console.log(detectionTypeArr[i].working_time)
              if (!utils.checkAuditTime_before30min(detectionTypeArr[i].working_time)) { //当前时间是否能做指定检测类型

                detectionTypeArr[i].grayFlag = true
              }
            }
          }

           let typeid = '';
           let payment_amount = '';
           let urgent = '';
           let payment_text = '';
           let payment_working_time = '';
          if(that.data.typeid != -1){
            for (var i = 0; i < detectionTypeArr.length; i++) {
              if (that.data.typeid == detectionTypeArr[i].id) { //当前时间是否能做指定检测类型
                 typeid = detectionTypeArr[i].id;
                 payment_amount = detectionTypeArr[i].money;
                 urgent = detectionTypeArr[i].urgent;
                 payment_text = detectionTypeArr[i].text;
                 payment_working_time = detectionTypeArr[i].working_time;
              }
            }
          }else{
             typeid = detectionTypeArr[0].id;
             payment_amount = detectionTypeArr[0].money;
             urgent = detectionTypeArr[0].urgent;
             payment_text = detectionTypeArr[0].text;
             payment_working_time = detectionTypeArr[0].working_time;
          }

          that.setData({
            detectionTypeArr: detectionTypeArr,
            typeid: typeid,
            payment_amount: payment_amount,
            urgent: urgent,
            payment_text: payment_text,
            payment_working_time: payment_working_time,
          })
          console.log(detectionTypeArr);

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
  getFixedChannel: function (x) {
    var that = this;
    var id = x;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log('获取坐标成功')
        that.setData({
          longitude: res.longitude, //经度
          latitude: res.latitude //纬度
        })
        var data = {
          longitude: res.longitude,
          latitude: res.latitude,
          id: id
        }
        request.request_get('/Newacid/getSamplingPointById.hn', data, function (res) {
          console.log('getFixedSamplingPoint', res);
          if (res) {
            if (res.success) {
              console.log(res.msg);
              var info = res.msg;
              var channel = {
                channel_id: info.channel_id,
                appointment_open: info.appointment_open,
                channel_name: info.channel_name,
                distance: info.distance,
                working_time: info.working_time,
                sbusiness_time1: info.sbusiness_time1,
                xbusiness_time1: info.xbusiness_time1,
              }
              channel.distance = utils.setMorKm(channel.distance)
              var workingTimeArr = channel.working_time.split(',');
              for (var i = 0; i < workingTimeArr.length; i++) {
                // workingTimeArr[i] = workingTimeArr[i].replace(":00:00",":00")
                if (workingTimeArr[i].indexOf('：') == -1) { //普通检测，数据库配置时间处为空字符串，需要前端处理
                  workingTimeArr[i] += '：全天24h'
                }

                var reg = new RegExp(":00-", "g"); //去掉-前后的 :00
                workingTimeArr[i] = workingTimeArr[i].replace(reg, "-");
                workingTimeArr[i] = workingTimeArr[i].substring(0, workingTimeArr[i].length - 3);

                if (workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2) > workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2)) {
                  console.log(workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2))
                  console.log(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                  workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2), '次日' + workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                }

                // if(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)>24){ //若时间为25:00显示为次日01:00
                //   workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2),'次日'+ utils.formatNumber((workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)-24)))
                // }

              }
              console.log('info--------------------------------------')
              console.log(info)

              that.setData({
                MultiArray: info.MultiArray,
              })

              if(info && info.objectMultiArray.length > 0 && info.objectMultiArray[0].time.length > 0){
                let dataMultiArray=that.data.MultiArray;
                let sec_data = [];
                let timelist = info.objectMultiArray[0].time;
                for (var i = 0; i < timelist.length; i++) {
                  let timeTitle = '';
                  if(timelist[i].can_use == 0){
                    timeTitle = ' (已约满)';
                  }
                  sec_data.push(timelist[i].time_section+""+timeTitle);
                }
                dataMultiArray[1] = sec_data;
                that.setData({
                  MultiArray: dataMultiArray
                })
              }

              that.setData({
                channel: channel,
                hiddenFlag: false, //显示距离
                workingTimeArr: workingTimeArr,
                work_time_remarks: info.work_time_remarks,
                // MultiArray: info.MultiArray,
                objectMultiArray: info.objectMultiArray,
                multiIndex: [0, 0],
                isXSH: info.isXSH
              })
              that.getDetectionType();
              that.getbaseData(channel)
            } else {
              box.showToast(res.msg);
            }
          } else {
            box.showToast("网络不稳定，请重试");
          }
        })
      },
      fail(res) {
        console.log('获取坐标失败')
        // box.showToast("获取坐标失败"+"id="+id)
        // box.showToast(x,'none',3000)
        // console.log(app.globalData.channel_id)
        var data = {
          id: id
        }
        request.request_get('/Newacid/getSamplingPointById.hn', data, function (res) {
          console.log('getFixedSamplingPoint', res);
          if (res) {
            if (res.success) {
              console.log(res.msg);
              var info = res.msg;
              var channel = {
                channel_id: info.channel_id,
                appointment_open: info.appointment_open,
                channel_name: info.channel_name,
                distance: '-m',
                working_time: info.working_time,
                sbusiness_time1: info.sbusiness_time1,
                xbusiness_time1: info.xbusiness_time1,
              }
              var workingTimeArr = channel.working_time.split(',');
              for (var i = 0; i < workingTimeArr.length; i++) {
                // workingTimeArr[i] = workingTimeArr[i].replace(":00:00",":00")
                if (workingTimeArr[i].indexOf('：') == -1) {
                  workingTimeArr[i] += '：全天24h'
                }
                var reg = new RegExp(":00-", "g");
                workingTimeArr[i] = workingTimeArr[i].replace(reg, "-");
                workingTimeArr[i] = workingTimeArr[i].substring(0, workingTimeArr[i].length - 3);

                if (workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2) > workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2)) {
                  console.log(workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2))
                  console.log(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                  workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2), '次日' + workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                }
                // if(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)>24){ //若时间为25:00显示为次日01:00
                //   workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2),'次日'+ utils.formatNumber((workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)-24)))
                // }
              }

              that.setData({
                MultiArray: info.MultiArray,
              })

              if(info && info.objectMultiArray.length > 0 && info.objectMultiArray[0].time.length > 0){
                let dataMultiArray=that.data.MultiArray;
                let sec_data = [];
                let timelist = info.objectMultiArray[0].time;
                for (var i = 0; i < timelist.length; i++) {
                  let timeTitle = '';
                  if(timelist[i].can_use == 0){
                    timeTitle = ' (已约满)';
                  }
                  sec_data.push(timelist[i].time_section+""+timeTitle);
                }
                dataMultiArray[1] = sec_data;
                that.setData({
                  MultiArray: dataMultiArray
                })
              }

              that.setData({
                channel: channel,
                hiddenFlag: true,
                workingTimeArr: workingTimeArr,
                work_time_remarks: info.work_time_remarks,
                // MultiArray: info.MultiArray,
                objectMultiArray: info.objectMultiArray,
                multiIndex: [0, 0],
                isXSH: info.isXSH
              })
              that.getDetectionType()
              that.getbaseData(channel)
            } else {
              box.showToast(res.msg);
            }
          } else {
            box.showToast("网络不稳定，请重试");
          }
        })
      }
    })

  },

  getChannelList: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log('获取坐标成功')
        that.setData({
          longitude: res.longitude, //经度
          latitude: res.latitude //纬度
        })
        var data = {
          longitude: res.longitude,
          latitude: res.latitude,
          tag: ''
        }
        request.request_get('/Newacid/getFixedSamplingPoint.hn', data, function (res) {
          console.log('getFixedSamplingPoint', res);
          if (res) {
            if (res.success) {
              console.log(res.msg);
              var channelList = res.msg;
              // channelList.sort(function (a, b) {
              //   return b.distance < a.distance ? 1 : -1 //正序
              // })
              var channel = channelList[0]
              channel.distance = utils.setMorKm(channel.distance)
              var workingTimeArr = channel.working_time.split(',');
              for (var i = 0; i < workingTimeArr.length; i++) {
                // workingTimeArr[i] = workingTimeArr[i].replace(":00:00",":00")
                if (workingTimeArr[i].indexOf('：') == -1) {
                  workingTimeArr[i] += '：全天24h'
                }
                var reg = new RegExp(":00-", "g");
                workingTimeArr[i] = workingTimeArr[i].replace(reg, "-");
                workingTimeArr[i] = workingTimeArr[i].substring(0, workingTimeArr[i].length - 3);

                if (workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2) > workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2)) {
                  console.log(workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2))
                  console.log(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                  workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2), '次日' + workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                }

                // if(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)>24){ //若时间为25:00显示为次日01:00
                //   workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2),'次日'+ utils.formatNumber((workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)-24)))
                // }
              }

              that.setData({
                MultiArray: channel.MultiArray,
              })

              if(channel && channel.objectMultiArray.length > 0 && channel.objectMultiArray[0].time.length > 0){
                let dataMultiArray=that.data.MultiArray;
                let sec_data = [];
                let timelist = channel.objectMultiArray[0].time;
                for (var i = 0; i < timelist.length; i++) {
                  let timeTitle = '';
                  if(timelist[i].can_use == 0){
                    timeTitle = ' (已约满)';
                  }
                  sec_data.push(timelist[i].time_section+""+timeTitle);
                }
                dataMultiArray[1] = sec_data;
                that.setData({
                  MultiArray: dataMultiArray
                })
              }

              that.setData({
                channel: channel,
                hiddenFlag: false,
                workingTimeArr: workingTimeArr,
                work_time_remarks: channel.work_time_remarks,
                // MultiArray: channel.MultiArray,
                objectMultiArray: channel.objectMultiArray,
                multiIndex: [0, 0],
                isXSH: channel.isXSH
              })
              that.getDetectionType();
              that.getbaseData(channel)
            } else {
              // box.showToast(res.msg);
            }
          } else {
            //box.showToast("网络不稳定，请重试");
          }
        })
      },
      fail(res) {
        console.log('获取坐标失败')
        var data = {
          tag: '',
          longitude: 116.39772, // 默认天安门广场
          latitude: 39.90323, // 默认天安门广场
        }
        request.request_get('/Newacid/getFixedSamplingPoint.hn', data, function (res) {
          console.log('getFixedSamplingPoint', res);
          if (res) {
            if (res.success) {
              console.log(res.msg);
              var channelList = res.msg;
              // channelList.sort(function (a, b) {
              //   return b.distance < a.distance ? 1 : -1 //正序
              // })
              var channel = channelList[0]
              channel.distance = utils.setMorKm(channel.distance)
              var workingTimeArr = channel.working_time.split(',');
              for (var i = 0; i < workingTimeArr.length; i++) {
                if (workingTimeArr[i].indexOf('：') == -1) {
                  workingTimeArr[i] += '：全天24h'
                }
                var reg = new RegExp(":00-", "g");
                workingTimeArr[i] = workingTimeArr[i].replace(reg, "-");
                workingTimeArr[i] = workingTimeArr[i].substring(0, workingTimeArr[i].length - 3);

                if (workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2) > workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2)) {
                  console.log(workingTimeArr[i].substr(workingTimeArr[i].indexOf('：') + 1, 2))
                  console.log(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                  workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2), '次日' + workingTimeArr[i].substr((workingTimeArr[i].indexOf('-') + 1), 2))
                }

                //     if(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)>24){ //若时间为25:00显示为次日01:00
                //   workingTimeArr[i] = workingTimeArr[i].replace(workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2),'次日'+ utils.formatNumber((workingTimeArr[i].substr((workingTimeArr[i].indexOf('-')+1),2)-24)))
                // }
              }
              
              that.setData({
                MultiArray: channel.MultiArray,
              })

              if(channel && channel.objectMultiArray.length > 0 && channel.objectMultiArray[0].time.length > 0){
                let dataMultiArray=that.data.MultiArray;
                let sec_data = [];
                let timelist = channel.objectMultiArray[0].time;
                for (var i = 0; i < timelist.length; i++) {
                  let timeTitle = '';
                  if(timelist[i].can_use == 0){
                    timeTitle = ' (已约满)';
                  }
                  sec_data.push(timelist[i].time_section+""+timeTitle);
                }
                dataMultiArray[1] = sec_data;
                that.setData({
                  MultiArray: dataMultiArray
                })
              }

              that.setData({
                channel: channel,
                hiddenFlag: true,
                workingTimeArr: workingTimeArr,
                work_time_remarks: channel.work_time_remarks,
                // MultiArray: channel.MultiArray,
                objectMultiArray: channel.objectMultiArray,
                multiIndex: [0, 0],
                isXSH: channel.isXSH
              })
              that.getDetectionType()
              that.getbaseData(channel)
            } else {
              // box.showToast(res.msg);
            }
          } else {
            //box.showToast("网络不稳定，请重试");
          }
        })
      }
    })

  },
  //自定义详细地址
  // updateLocation:function(e){
  //   console.log(e.detail.value)
  //   var str = e.detail.value;
  //   str = utils.checkInput(str);
  //   this.setData({
  //     locationName: str
  //   })
  // },
  scanCode: function () {
    var that = this;
    wx.scanCode({ //扫描API
      onlyFromCamera: true,
      success(res) { //扫描成功
        console.log(res) //输出回调信息
        that.setData({
          courierNumber: res.result
        });
        wx.showToast({
          title: '成功',
          duration: 1000
        })
      }
    })
  },

  //历史信息自动填充
  bindHistoryInfo: function (e) {
    var that = this
    var data = {
      openid: this.data.openid
    }
    request.request_get('/Newacid/getpretestInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if (res.msg.length == 1) {
            var userinfo = res.msg[0]
            console.log('bindHistoryInfo方法成功' + res.msg);
            that.setData({
              name: userinfo.name,
              phone: userinfo.phone,
              idcard: userinfo.id_card,
              cardIndex: userinfo.card_type, //0 身份证 1 护照 2 港澳台通行证 
            })
            if (userinfo.card_type != 0) {
              that.setData({
                age: userinfo.age,
              })
              if (userinfo.gender == '男') {
                that.setData({
                  genderIndex: 0,
                  gender: userinfo.gender
                })
              } else if (userinfo.gender == '女') {
                that.setData({
                  genderIndex: 1,
                  gender: userinfo.gender
                })
              }
            }
            console.log(userinfo.name)
            console.log(userinfo.phone)
            console.log(userinfo.id_card)
            console.log(userinfo.card_type)
          }
        } else {
          box.showToast("res.msg");
        }
      }
    })
  },


  bindName: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput_2(str);
    this.setData({
      name: str
    })
  },
  bindPhone: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      phone: str
    })
  },
  bindIdcard: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      idcard: str
    })
  },
  bindAge: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      age: str
    })
  },
  bindVerificationCode: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      verification_code: str
    })
  },
  bindCode: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      code: str
    })
  },

  //跳转至联系人选择页面
  bindChooseCustodian: function (e) {
    var that = this
    if (that.data.account == '') {
      wx.showToast({
        title: '请选择客户',
      })
    } else {
      that.setData({
        flag: true
      })
      wx.navigateTo({
        url: '/pages/chooseCustodian/chooseCustodian?account=' + this.data.account
      })
    }
  },
  // //仪器类型change事件
  // bindPickerChangeInstrument: function (e) {
  //   var that = this;
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     instrumentIndex: e.detail.value,
  //     instrument_status: e.detail.value,
  //     instrumentList: that.data.instrumentList,
  //     instrument_name: that.data.instrumentList[e.detail.value].instrument_name
  //   })
  // },
  bindPickerChangeGender: function (e) {
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      genderIndex: e.detail.value,
      genderList: that.data.genderList,
      gender: that.data.genderList[e.detail.value]
    })
    console.log('picker发送选择改变，携带值为', that.data.genderIndex)
  },
  bindPickerChangeCard: function (e) {
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      cardIndex: e.detail.value,
      cardList: that.data.cardList,
      card_name: that.data.cardList[e.detail.value]
    })
    if (e.detail.value == 0) {
      that.setData({
        keyboard_type: 'idcard',
        keyboard_type_limit_num: 18
      })
    } else {
      that.setData({
        keyboard_type: 'text',
        keyboard_type_limit_num: 20
      })
    }
    console.log('picker发送选择改变，携带值为', that.data.cardIndex)
  },

  handleChange: function (e) {
    var that = this;
    if (e.detail.value == true) {
      that.setData({
        ifAccept: 1
      })
    } else {
      that.setData({
        ifAccept: 0
      })
    }
  },
  // 时间选择器
  start_time_show: function () {
    this.setData({
      startIsPickerShow: true,
      startIsPickerRender: true,
      startChartHide: true
    })
  },
  start_time_hide: function () {
    this.setData({
      startIsPickerShow: false,
      startChartHide: false
    })
  },
  set_start_time: function (val) {
    console.log(val.detail.startTime)
    this.setData({
      startTime: val.detail.startTime.substring(0, 13) + ":00"
    });
  },

  getLocalTime() {
    return new Date().getTime();
  },
  getFullTime() {
    let date = new Date(), //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      Y = date.getFullYear() + '',
      M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
      D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()),
      h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()),
      m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()),
      s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    return Y + M + D + h + m + s
  },
  submitBuffer: utils.throttle(function (e) {

    var that = this;
    var id_card = that.data.idcard;
    var name = that.data.name;
    var phone = that.data.phone;
    var code = that.data.code;
    var age = that.data.age;
    var openid = this.data.openid;
    var phoneCode = that.data.phoneCode;
    var onlineFlag = that.data.onlineFlag;
    var cardIndex = that.data.cardIndex;
    var typeid = that.data.typeid;
    var detectionTypeArr = that.data.detectionTypeArr;
    console.log(id_card)
    console.log(openid)
    // if (onlineFlag == false) { //线下
    // } else { //线上
    //   if (cardIndex != 0) { //其他身份证件
    //     if (name == '') {
    //       box.showToast("请填写与证件一致的姓名");
    //       return
    //     }
    //     if (age == '') {
    //       box.showToast("请填写年龄");
    //       return
    //     } else if (id_card == '') {
    //       box.showToast("请填写正确的证件号码")
    //       return
    //     }
    //   } else { //线上 且选择身份证
    //     if (name == '') {
    //       box.showToast("请填写与证件一致的姓名");
    //       return
    //     } else if (id_card == '') {
    //       box.showToast("请填写正确的证件号码")
    //       return
    //     }
    //     if (!utils.checkIdCard(id_card)) {
    //       box.showToast("请填写正确的证件号码")
    //       return
    //     }
    //   }
    // }

    // if (phone == '') {
    //   box.showToast("请输入手机号码");
    //   return
    // } else if (!utils.checkPhone(phone)) {
    //   box.showToast("手机号码格式不正确")
    //   return
    // } else if (code == '') {
    //   box.showToast("请填写验证码");
    //   return
    // } else if (phoneCode[0] == "") {
    //   //进入这里说明未点击获取验证码
    //   box.showToast("请获取验证码")
    //   return
    // } else if (phoneCode[0] != phone) {
    //   box.showToast("验证码过期")
    //   return
    // } else if (phoneCode[1] != code) {
    //   box.showToast("验证码错误")
    //   return
    // }
    if (this.data.userinfo_id == '') {
      box.showToast("请添加受检人");
      return
    } else if (detectionTypeArr.length == 1 && detectionTypeArr[0].grayFlag == true) {
      box.showToast("当前时间该采样点不在营业时间")
      return
    } else if (that.data.yyxz_show == 1) {
      if (that.data.policyChecked == false) {
        box.showToast("请阅读并勾选预约须知")
        return
      }
    }

    if (that.data.channel.appointment_open == 1) {
      if (that.data.objectMultiArray[that.data.multiIndex[0]].time[that.data.multiIndex[1]].can_use == 0) {
        // wx.showModal({
        //   title: that.data.yyts_title,
        //   content: that.data.yyts_text,
        //   showCancel: false,
        //   success(res) {
        //     if (res.confirm) {
        //       console.log('用户点击了确定')
        //     }
        //   }
        // })
        that.setData({
          isShowCanUse: true
        });
        return;
      }

    }

    if(this.data.choose_type ==1 || this.data.choose_type ==2){
      if (this.data.verification_code == '') {
        box.showToast("请输入核销码");
        return
      }
    }

    /**
     * appointment_open  是否开启预约  1 开启  0 未开启
     * isXSH 0 不显示   1 显示
     * 根据只开一天预约并且只能预约当天的时间,时间过期了提示
     */
    if(this.data.channel.appointment_open == '1' && this.data.isXSH == 0){
      // box.showToast("当前时间为非营业时间，无法预约，为避免影响您的行程，请预约其他采样站",'',2000);
      this.setData({
        isShowXSH: true
      });
      return
    }

    console.log("payment_amount=" + that.data.payment_amount)
    if (that.data.urgent == 1) {
      if (that.data.payment_working_time != '') {
        if (!utils.checkAuditTime(that.data.payment_working_time)) { //当前时间是否能做指定检测类型
          that.setData({
            timeModalFlag: true
          })
        }
      }
      console.log("急检")
      that.bindshowModal_3(); //此时已经完成所有校验
    } else {
      // that.submit();
      //  新增检测是否在营业时间接口判断
      that.getCheckTime();
      
    }
  }, 3000),

  // 提交确认出库信息
  submit: utils.throttle(function (e) {

    var that = this
    var id_card = that.data.idcard;
    var name = that.data.name;
    var phone = that.data.phone;
    var code = that.data.code;
    var age = that.data.age;
    var openid = this.data.openid;
    var typeid = that.data.typeid;
    var channel_id = that.data.channel.channel_id;
    var phoneCode = that.data.phoneCode;
    var onlineFlag = that.data.onlineFlag;
    var onlineFlagNum = that.data.onlineFlagNum;
    var cardIndex = that.data.cardIndex;
    var choose_type = that.data.choose_type;
    var verification_code = that.data.verification_code;
    var coupon_payment = that.data.coupon_payment;
    console.log(that.data.payment_amount)
    console.log(coupon_payment)
    // if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
    //   var payment_amount = that.data.payment_amount
    // } else if (that.data.coupon_payment == 24.89) {
    //   var payment_amount = 0.01
    // } else {
    //   var payment_amount = that.data.payment_amount - coupon_payment;
    // }
    if (that.data.coupon_payment == '不使用'||that.data.coupon_payment == '无') {
      var payment_amount = that.data.payment_amount
    } else {
      let intPaymentAmount = that.data.payment_amount * 100
      let intCouponPayment = coupon_payment * 100;
      var payment_amount = (parseInt(intPaymentAmount) - parseInt(intCouponPayment))/100;
      if(payment_amount > 0){

      }else{
        payment_amount = 0.01;
      }
      // this.setData({
      //   payment_amount: payment_amount
      // })
    }
    var coupon_id = that.data.coupon_id;
    console.log(id_card)
    console.log(openid)

    if (onlineFlag == false) { //线下
      that.setData({
        cardIndex: 0,
        idcard: '', //
        gender: '',
        age: '',
        name: '', //
        onlineFlagNum: 1
      })
    } else { //线上
      if (cardIndex != 0) { //其他身份证件
      } else { //线上 且选择身份证
        var age = utils.IdCard(id_card, 3);
        var gender = utils.IdCard(id_card, 2);
        that.setData({
          age: age,
          gender: gender
        })
        console.log(age)
        console.log(gender)
      }
      that.setData({
        onlineFlagNum: 0
      })
    }
    console.log(openid, name, that.data.gender, that.data.age, that.data.cardIndex, that.data.idcard, phone, typeid, payment_amount, channel_id, that.data.onlineFlagNum, choose_type)

    //----------------------------------------------------------
    let MultiArray = that.data.MultiArray;
    let objectMultiArray = that.data.objectMultiArray;
    let multiIndex = that.data.multiIndex;
    let appointment_date = '';
    if (MultiArray.length != 0) {

      appointment_date = objectMultiArray[multiIndex[0]].date + ' ' + objectMultiArray[multiIndex[0]].time[multiIndex[1]].time_section;
    }
    //----------------------------------------------------------
    var data1 = {
      open_id: openid,
      // name: that.data.name,
      // gender: that.data.gender,
      // age: that.data.age,
      // card_type: that.data.cardIndex,
      // id_card: that.data.idcard,
      // phone: phone,
      test_type: typeid,
      payment_amount: payment_amount,
      channel: channel_id,
      // onlineFlag: that.data.onlineFlagNum,
      coupon_id: coupon_id,
      appointment_date: appointment_date,
      id: this.data.userinfo_id,
      user_id: this.data.user_id
      // pay_channel: this.data.pay_channel //支付渠道
    }

    console.log('--data1-->:',data1)

    if (choose_type == 0) {
      request.request_get('/Newacid/addOnlinePaymentOrder.hn', data1, function (res) {
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
                that.setData({
                  showModal_3: false
                })
                console.log(res)
                wx.requestSubscribeMessage({
                  tmplIds: ['P01rYbqz6L_sbj3JyVz2SfUtU4SWhZ01PQ13j3AoSkE','-2SRPYWbtWO0xbRC2Rkdpm3j3oiTUbQ-O8HnqilmgOs','NNcHm-TIz2xzXQnpnsY-cVNRy2bgMirUg_hiOIJ6vKU'],
                  success(res) {
                    console.log('success:' + res);
                    let data = {
                      openid: that.data.openid,
                      user_id: that.data.user_id
                    }
                    request.request_get('/Newacid/sendmsg.hn', data, function (res) {
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
                      url: '/pages/appointmentRecord/appointmentDetail?appointment_num=' + that.data.appointment_num + '&continueFlag=true' + '&onlineFlagNum=' + that.data.onlineFlagNum + '&dynamicTimeFlag=' + that.data.dynamicTimeFlag +'&isH5Show=' + that.data.isH5Show,
                    })
                  }
                })
                // wx.navigateTo({
                //   url: '/pages/appointmentRecord/appointmentDetail?appointment_num=' + that.data.appointment_num + '&continueFlag=true' + '&onlineFlagNum=' + that.data.onlineFlagNum + '&dynamicTimeFlag=' + that.data.dynamicTimeFlag,
                // })
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
    } else if (choose_type == 1) {
      var data2 = {
        open_id: openid,
        examined_person_id: this.data.userinfo_id,
        channel: channel_id,
        appointment_time: appointment_date,
        verification_code: verification_code,
        user_id: this.data.user_id
        // pay_channel: this.data.pay_channel //支付渠道
      }
      request.request_get('/Newacid/addMeituanPaymentOrder.hn', data2, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            box.showToast("核销成功”，且跳转至预约详情页",'',1000);

            console.log(res)
            that.setData({
              appointment_num: res.msg,
            })
            wx.requestSubscribeMessage({
              tmplIds: ['P01rYbqz6L_sbj3JyVz2SfUtU4SWhZ01PQ13j3AoSkE','-2SRPYWbtWO0xbRC2Rkdpm3j3oiTUbQ-O8HnqilmgOs','NNcHm-TIz2xzXQnpnsY-cVNRy2bgMirUg_hiOIJ6vKU'],
              success(res) {
                console.log('success:' + res);
                let data = {
                  openid: that.data.openid,
                  user_id: that.data.user_id
                }
                request.request_get('/Newacid/sendmsg.hn', data, function (res) {
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
                  url: '/pages/appointmentRecord/appointmentDetail?appointment_num=' + that.data.appointment_num + '&continueFlag=true' + '&onlineFlagNum=' + that.data.onlineFlagNum + '&dynamicTimeFlag=' + that.data.dynamicTimeFlag +'&isH5Show=' + that.data.isH5Show,
                })
              }
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
    }
    wx.hideLoading({
      success: (res) => {},
    })
  }, 2000),
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAllSubject();

    var that = this;
    console.log("onshow方法")

    console.log(that.data.payment_amount)
    console.log(that.data.coupon_payment)
    console.log("bindBackFlag=" + that.data.bindBackFlag)

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
    
    if (that.data.bindBackFlag == true) {
      that.getFixedChannel(that.data.channel.channel_id); // 选中新采样点返回
      console.log('选中新采样点返回')
      console.log("bindBackFlag=" + that.data.bindBackFlag)
      var channel_id = that.data.channel.channel_id;
      that.setData({
        channel_id: channel_id,
        bindBackFlag: false
      })
    }
    //  that.getLocationAuth();

  },
  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },
  getLocationAuth() {
    wx.getSetting({ //获取用户已授权的信息
      success(res) {
        console.log(res)
        if (res.authSetting['scope.userLocation'] == false) { //如果没有授权地理位置  
          console.log("用户没授权地理位置")
          wx.showModal({
            title: '获取地理位置',
            content: '为您推荐附近采样点',
            confirmText: '确认授权',
            showCancel: true,
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    res.authSetting = { //打开授权位置页面，让用户自己开启
                      "scope.userLocation": true
                    }
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else { //
          wx.getSystemInfo({
            success(res) {
              var isopendingwei = res.locationEnabled;
              if (isopendingwei == false) {
                wx.showModal({
                  title: '无法获取地理位置，请检查是否开启系统权限',
                  showCancel: false,
                  success(res) {}
                })
              }
            }
          })
        }
      }
    })
  },
  //显示地图
  showMap() {
    var that = this
    that.setData({
      flag: false
    })
    //使用在腾讯位置服务申请的key（必填）
    const key = "RLWBZ-JD53U-OJHV6-27XHB-I5VKQ-I7F3H";
    //调用插件的app的名称（必填）
    const referer = "方舱数据管理信息化系统";
    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer
    });
  },
  getCode: function () {
    var that = this;
    var phone = that.data.phone;
    var currentTime = that.data.currentTime;
    console.log("需要获取验证码的手机号" + phone);
    if (that.data.codeBtState) {
      console.log("还未到达时间");
    } else {
      if (phone == '') {
        box.showToast("请输入手机号码")
      } else if (!utils.checkPhone(phone)) {
        box.showToast("手机号码格式不正确")
      } else {
        box.showToast("验证码已发送")
        //倒计时,不管验证码发送成功与否，都进入倒计时，防止多次点击造成验证码发送失败**************************
        that.setData({
          codeBtState: true
        })
        var interval = setInterval(function () {
          currentTime--;
          that.setData({
            codeBtText: currentTime + 's'
          })
          if (currentTime <= 0) {
            clearInterval(interval)
            that.setData({
              codeBtText: '重新发送',
              currentTime: 60,
              codeBtState: false,
            })
          }
        }, 1000);

        // 服务器发送验证码***********************
        request.request_get('/Newacid/Verification.hn', {
          phone: phone
        }, function (res) {
          console.info('回调', res)
          if (res) {
            if (res.success) {
              console.log('验证码发送成功，获取的验证码' + res.msg);
              that.setData({
                phoneCode: [phone, res.msg]
              });
            } else {
              box.showToast("验证码发送失败");
            }
          }
        })
      }
    }
  },
  clearidcard: function () {
    this.setData({
      idcard: ''
    })
  },
  clearPhone: function () {
    this.setData({
      phone: ''
    })
  },
  clearCode: function () {
    this.setData({
      code: ''
    })
  },
  changeType: function (e) {
    var that = this
    console.log(e)
    that.setData({
      num: e.currentTarget.dataset.num
    })
    if (that.data.num == 1) { //美团
      that.setData({
        pay_channel: '美团',
        verification_code: '',
        choose_type: 1
      })
    } else if (that.data.num == 2) { //京东
      that.setData({
        pay_channel: '京东',
        verification_code: '',
        choose_type: 2
      })
    } else if(that.data.num == 0){ //微信
      that.setData({
        pay_channel: '微信',
        verification_code: '',
        choose_type: 0
      })
    }
  },
  changeTestType: function (e) {
    var that = this
    console.log(e)
    if (that.data.intoByScanFlag == true) {
      if (!utils.checkAuditTime_before30min(e.currentTarget.dataset.workingtime)) { //当前时间不能做指定检测类型
        box.showToast("该检测不在营业时间，请选择其他检测类型", 'none', 1000);
        return;
      }
    }
    let coupon_payment = '';
    if(that.data.best_coupon==0){
      coupon_payment = '无';
    }else if(that.data.best_coupon==1){
      coupon_payment = '不使用';
    }

    that.setData({
      typeid: e.currentTarget.dataset.id,
      payment_amount: e.currentTarget.dataset.money,
      urgent: e.currentTarget.dataset.urgent,
      payment_text: e.currentTarget.dataset.text,
      payment_working_time: e.currentTarget.dataset.workingtime,
      coupon_payment: coupon_payment
    })

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
  //显示地图
  showMap() {
    var that = this
    that.setData({
      flag: false
    })
    //使用在腾讯位置服务申请的key（必填）
    const key = "LESBZ-6WP66-VWTSY-MBHS6-VOTVH-KBBAW";
    //调用插件的app的名称（必填）
    const referer = "卡尤迪预约小程序";
    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer
    });
  },
  changeOnlineFlag: function (e) {
    console.log(e.currentTarget.dataset.onlineid)
    var that = this
    that.setData({
      onlineid: e.currentTarget.dataset.onlineid
    })
    if (that.data.onlineid == 1) { //线上绑定身份
      that.setData({
        onlineFlag: true
      })
    } else if (that.data.onlineid == 2) { //线下刷身份证
      if (that.data.showIDcardModal == false) {
        wx.showModal({
          title: '请携带二代身份证',
          content: '线下刷身份证需到采样点提供证件给工作人员，若未携带可线上完成身份信息绑定',
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#E06596',
          success(res) {
            if (res.confirm) {
              that.setData({
                showIDcardModal: true
              })
            }
          }
        })
      }
      that.setData({
        onlineFlag: false
      })
    }
  },
  showPriceModal: function () {
    this.setData({
      showModal: true
    })
  },
  bindshowModal_3: function () {
    this.setData({
      showModal_3: true
    })
  },

  chooseChannel: function () {
    wx.navigateTo({
      url: '/pages/chooseSamplingPoint/chooseSamplingPoint',
    })
  },

  RadioChange1(e) {
    console.log(e)
    if (e.detail.value == 'A1') {
      this.setData({
        // survey_flag:true,
        fever: 1
      })
    } else {
      this.setData({
        fever: 0
      })
    }
  },
  RadioChange2(e) {
    console.log(e)
    if (e.detail.value == 'A3') {
      this.setData({
        // survey_flag:true,
        return_home: 1
      })
    } else {
      this.setData({
        return_home: 0
      })
    }
  },
  RadioChange3(e) {
    console.log(e)
    if (e.detail.value == 'A5') {
      this.setData({
        // survey_flag:true,
        high_risk_area_tourism: 1
      })
    } else {
      this.setData({
        high_risk_area_tourism: 0
      })
    }
  },
  RadioChange4(e) {
    console.log(e)
    if (e.detail.value == 'A7') {
      this.setData({
        // survey_flag:true,
        high_risk_area_contact: 1
      })
    } else {
      this.setData({
        high_risk_area_contact: 0
      })
    }
  },
  RadioChange5(e) {
    console.log(e)
    if (e.detail.value == 'A9') {
      this.setData({
        survey_flag: false,
        symptom: 1
      })
    } else {
      this.setData({
        survey_flag: true,
        symptom: 0
      })
    }
  },
  RadioChange6(e) {
    console.log(e)
    if (e.detail.value == 'A11') {
      this.setData({
        // survey_flag:true,
        peer_high_risk_occupation: 1
      })
    } else {
      this.setData({
        peer_high_risk_occupation: 0
      })
    }
  },
  // CheckboxChange(e){
  //   console.log(e)
  //   var arr = e.detail.value;
  //   console.log(arr)
  //   if(arr.indexOf('A')>-1||arr.indexOf('B')>-1||arr.indexOf('C')>-1||arr.indexOf('D')>-1||arr.indexOf('E')>-1||arr.indexOf('F')>-1||arr.indexOf('G')>-1||arr.indexOf('H')>-1||arr.indexOf('I')>-1||arr.indexOf('J')>-1||arr.indexOf('K')>-1){
  //     this.setData({
  //       survey_flag:false

  //     })
  //     console.log("去医院")
  //   }
  //   this.setData({
  //     checkbox_arr:arr
  //   })
  // },
  bindOCR: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'], //原图
      sourceType: ['album', 'camera'], //支持选取图片
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        //上传图片
        wx.uploadFile({
          //请求后台的路径
          url: 'https://api-cn.faceplusplus.com/cardpp/v1/ocridcard',
          //小程序本地的路径
          filePath: tempFilePaths,
          //后台获取我们图片的key
          name: 'image_file',
          header: {
            "Content-Type": "multipart/form-data" //必须用此header
          },
          //额外的参数formData
          formData: {
            'api_key': 'gQfz-MnGIuRUbtzJK8wB_x1ZVEc45J0H', //请填写你创建的 apikey
            'api_secret': 'GNl9vID_5KjzzbG2UG51vswvYeb06vnu',
          },
          success: function (res) {
            //上传成功
            console.log(res.data)
            var obj = JSON.parse(res.data)

            var card_arr = obj.cards[0]
            if (card_arr.type == 1) {
              that.setData({
                idcard: card_arr.id_card_number,
                name: card_arr.name
              })
            } else {
              box.showToast("请上传二代身份证图片")
            }
          },
          fail: function (res) {
            console.log(res)
          },
        })
      }
    })
  },
  modalConfirm_3: utils.throttle(function () {
    var that = this
    that.setData({
      showModal_3: false
    })
    that.submit()
  }, 2000),
  modalCancel_3: function () {
    var that = this
    that.setData({
      timeModalFlag: false
    })
  },
  showSurvey: function () {
    var that = this
    request.request_get('/Newacid/getQuestion.hn', {}, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          var surveyTemp = res.msg;
          that.setData({
            surveyArr: surveyTemp
          })
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  modalConfirm: function () {
    var that = this
    that.setData({
      showModal: false
    })
  },
  bindYYXZ: utils.throttle(function (e) {
    var report_temp = this.data.yyxz_url
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('预约须知不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/预约须知.pdf',
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
  bindUserProtocol: utils.throttle(function (e) {
    var report_temp = this.data.fwxy_url
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('用户服务协议不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/用户服务协议.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用
          console.log(Path);
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
        box.showToast('用户服务协议不存在，请联系客服')
        console.log(res); //失败
      }
    })
  }, 2000),
  bindPrivacyPolicy: utils.throttle(function (e) {
    var report_temp = this.data.yszz_url
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
  changePolicy(e) {
    console.log(e)
    this.setData({
      policyChecked: !this.data.policyChecked
    })
    console.log(this.data.policyChecked)
  },
  bindCouponCheck: function () {
    let that = this;
    console.log('=================bindCouponCheck==================');
    console.log(that.data.coupon_id);
    console.log(that.data.coupon_payment);
    if(that.data.coupon_payment=='无'){
      return;
    }

    wx.navigateTo({
      url: '/pages/coupon/couponCheck?coupon_id=' + that.data.coupon_id+'&coupon_payment='+that.data.coupon_payment,
    })
  },
  getBannerList: function () {
    var that = this;
    console.log('open_id=' + this.data.openid)
    var open_id = this.data.openid;
    var data = {
      type: 2
    }
    request.request_get('/activity/getBannerInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          console.log(res.msg);
          that.setData({
            movies: res.msg
          })
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  //轮播图的切换事件
  swiperChange: function (e) {
    console.log(e)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  //点击图片触发事件 
  swipclick: function (e) {
    console.log(this.data.swiperCurrent);
    console.log(this.data.links);
    wx.navigateTo({
      url: this.data.movies[this.data.swiperCurrent].icon
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)

    if (this.data.objectMultiArray[e.detail.value[0]].time[e.detail.value[1]].can_use == 0) {
      //提醒当前时间段不可预约
      // wx.showModal({
      //   title: this.data.yyts_title,
      //   content: this.data.yyts_text,
      //   showCancel: false,
      //   success(res) {
      //     if (res.confirm) {
      //       console.log('用户点击了确定')
      //     }
      //   }
      // })
      this.setData({
        isShowCanUse: true
      });
      return;
    }

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
        if(timelist[i].can_use == 0){
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
  getbaseData: function (channel_id) {
    let that = this;
    //获取当前页面基础数据
    //获取收费规则图片，以及是否显示标志
    //获取预约须知图片，以及是否显示标志
    //获取用户服务协议
    //获取隐私政策
    let data = {
      channel_id: channel_id.channel_id
    }
    console.log('===================================================');
    console.log(channel_id);
    request.request_get('/Newacid/getbaseData.hn', data, function (res) {
      console.log('getbaseData', res);
      if (!res) {
        box.showToast("网络不稳定，请重试");
        return;
      }
      if (!res.success) {
        console.log(res.msg);
        box.showToast("网络不稳定，请重试");
        return;
      }
      //加载数据
      console.log(res.msg);
      let msg = res.msg;
      that.setData({
        sfgz_url: msg.sfgz_url,
        sfgz_show: msg.sfgz_show,
        yyxz_url: msg.yyxz_url,
        yyxz_show: msg.yyxz_show,
        yyts_title: msg.yyts_title,
        yyts_text: msg.yyts_text,
        fwxy_url: msg.fwxy_url,
        yszz_url: msg.yszz_url,
        is_promise: msg.is_promise, //是否显示公告 1-显示
        promise_title: msg.promise_title,
        promise_url: msg.promise_url,
        promise_announcement: msg.promise_announcement,
        is_paynotice: msg.is_paynotice,//是否显示付款须知 1-显示  2-隐藏
        paynotice_title: msg.paynotice_title,
        paynotice_url: msg.paynotice_url,
      })

    })
  },
  /**
   * 公告
   */
  bindNoticeClick(){
    this.setData({
      showNotice: true
    });
  },
  noticeConfirm(){
    this.setData({
      showNotice: false
    });
  },
  /**
   * 添加受检人
   */
  bindAddSubject(){
    if(this.data.isAllSubject == 1){
      wx.navigateTo({
        url: '/pages/selectSubject/index'
      });
    }else{
      wx.navigateTo({
        url:'/pages/addSubject/index?isAddSub=0'
      });
    }
  },
  bindSelectSubject(){
    wx.navigateTo({
      url: '/pages/selectSubject/index'
    });
  },
  clearVerificationCode(){
    this.setData({
      verification_code: ''
    })
  },
  getAllSubject(){
    let that = this;
    let data = {
      open_id: this.data.openid,
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/getAllSubject.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if(res && res.msg && res.msg.length > 0){
            that.setData({
              isAllSubject: 1
            })

            let isAddSubjectNew = 0;
            let userinfo_id_new = '';
            for(let i = 0; i < res.msg.length; i++){
              if(res.msg[i].id == that.data.userinfo_id){
                isAddSubjectNew = 1;
                userinfo_id_new = that.data.userinfo_id;
              }
            }
            that.setData({
              isAddSubject: isAddSubjectNew,
              userinfo_id: userinfo_id_new
            });
          } else {
            that.setData({
              isAllSubject: 0,
              isAddSubject: 0
            })
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  /**
   * 下单须知
   */
  submitConfirm: utils.throttle(function () {
    var that = this
    that.setData({
      isShowTime: false
    })
    // that.submit()
    that.bindshowModal_4();
  }, 2000),
  getCheckTime(){
    let that = this;
    let data = {
      test_type: that.data.typeid,
      channel_id: that.data.channel.channel_id
    }
    request.request_get('/Newacid/is_during_business_hours1.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
          if (res.during_business_hours){
            // that.submit();
            that.bindshowModal_4();
          } else {
            that.setData({
              isShowTime: true,
              timeTitle: res.title,
              timeTips: res.Tips,
              timeBusinessTime: res.business_time
            })
          }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  submitConfirmXSH(){
    this.setData({
      isShowXSH: false
    });
  },
  submitConfirmCanUse(){
    this.setData({
      isShowCanUse: false
    });
  },
  bindshowModal_4: function () {
    if(this.data.is_paynotice == 1){
      this.setData({
        showModal_4: true
      });
    }else{
      this.setData({
        showModal_4: false
      });
      this.submit()
    }
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
})