const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
"use strict";

Page({
  data: {
    user_id: '',
    openid: '',

    surveyArr: [],
    showModal_2: false, //流调弹框
    survey_flag: true, //流调是否通过
    fever: 0,
    return_home: 0,
    high_risk_area_tourism: 0,
    high_risk_area_contact: 0,
    symptom: 0,
    peer_high_risk_occupation: 0,

    // 新增
    isAddSubject: 0,  // 0-默认添加受检人   1-选择受检人
    userinfo_id: '',
    isAllSubject: 0, // 判断是否有受检人
    card_name: '',
    idcard: '',
    phone: "",
    name: "",
    gender: '男',
    age: '',
    cardIndex: 0,
    onlineFlag: true,
    onlineFlagNum: 0,

    bottomLift: 15,

    isRequest: false
  },
  onLoad: function (options) {

    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      openid: wx.getStorageSync('coyote_userinfo').openid || '',
    });

    // this.showSurvey();
    this.getBottomLift();
  },
  onShow: function () {
    this.getAllSubject();
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
   * 
   */
  bindSubmit: utils.throttle(function (e) {
    let that = this;
    this.setData({
      isRequest: !this.data.isRequest
    });

    if(this.data.isRequest){
      if (this.data.idcard && this.data.userinfo_id) {
        let params = {
          person_id: this.data.userinfo_id,
          user_id: this.data.user_id,
          open_id: this.data.openid,
        }
        request.request_get('/Newacid/freeSubject.hn', params, function (res) {
          console.info('回调', res)
          if (res) {
            if (res.success) {
              let free_num = res.msg;
              if(free_num){
  
                wx.requestSubscribeMessage({
                  tmplIds: ['-2SRPYWbtWO0xbRC2Rkdpm3j3oiTUbQ-O8HnqilmgOs','NNcHm-TIz2xzXQnpnsY-cVNRy2bgMirUg_hiOIJ6vKU'],
                  success(res) {
                    // let data = {
                    //   openid: that.data.openid,
                    //   user_id: that.data.user_id
                    // }
                    // request.request_get('/Newacid/sendmsg.hn', data, function (res) {
                    //   console.info('回调', res)
                    // })
                  },
                  fail(res) {
                    console.log('fail:' + res);
                  },
                  complete(res) {
                    // wx.navigateTo({
                    //   url: '/pages/NewH5FreeThree/index?free_num='+ free_num
                    // });
                  }
                });

                that.setData({
                  isRequest: !that.data.isRequest
                });

                wx.navigateTo({
                  url: '/pages/NewH5FreeThree/index?free_num='+ free_num
                });
              }else{
                that.setData({
                  isRequest: !that.data.isRequest
                });
              }
            } else {
              box.showToast(res.msg);
              that.setData({
                isRequest: !that.data.isRequest
              });
            }
          } else {
            box.showToast("网络不稳定，请重试");
            that.setData({
              isRequest: !that.data.isRequest
            });
          }
        })
      }else{
        this.setData({
          isRequest: false
        });
        wx.showModal({
          title: '温馨提示',
          content: '专用信息采集页下，当前受检人必须要有证件信息才能提交',
          showCancel: false
        })
      }
    }
  }, 5000),
  /**
   * 流调
   */
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
    
    var data = {
      openid: this.data.openid,
      channel_id: '',
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
})