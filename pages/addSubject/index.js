
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "添加受检人",
    phoneCode: ["", ""], //正确的 手机号 和 验证码
    age: '',
    name: "",
    phone: "",
    onlineid: 1,
    code: '',
    idcard: '',
    onlineFlag: true,
    onlineFlagNum: 0,
    cardList: ['二代身份证', '护照', '港澳台通行证'],
    genderList: ['男', '女'],
    cardIndex: 0,
    genderIndex: 0,
    gender: '男',
    codeBtText: '获取验证码',
    codeBtState: false,
    hiddenFlag: false,
    currentTime: 60,
    keyboard_type: 'idcard',
    keyboard_type_limit_num: 18,
    showDialog: false,
    dialogData: {
      title: "确认删除该受检人？",
      titles:  "删除后无法恢复",
      cancel: "取消",
      sure: "确认"
    },
    submitState: true,
    isAddSub: 0,  // 0-默认从个人预约-添加受检人跳转   1-从选择受检人-添加受检人跳转 2-从选择受检人-编辑受检人跳转
    showIDcardModal: false,
    card_name: '身份证', //身份证name
    userinfo_id: '',
    policyChecked: false,
  },
  onShow: function () {
    // this.bindHistoryInfo();
  },
  onLoad: function (options) {
    this.getbaseData();
    
    this.setData({
      isAddSub: options.isAddSub
    });

    if(options && options.title){
      this.setData({
        title: options.title,
      })
    }

    if(options && options.online && options.jsonItem){
      if(options.online == 1){
        // 线下
        let jsonItem = JSON.parse(options.jsonItem);
        this.setData({
          onlineid: 2,
          onlineFlag: false,
          onlineFlagNum: 1,
          name: jsonItem.name,
          gender: jsonItem.gender,
          age: jsonItem.age,
          phone: jsonItem.phone,
          idcard: jsonItem.id_card,
          card_name: jsonItem.card_type == 1 ? '护照' : jsonItem.card_type == 2 ? '港澳台通行证' : '身份证',
          cardIndex: jsonItem.card_type,
          userinfo_id: jsonItem.id
        });

        if (jsonItem.card_type == 0) {
          this.setData({
            keyboard_type: 'idcard',
            keyboard_type_limit_num: 18
          })
        } else {
          this.setData({
            keyboard_type: 'text',
            keyboard_type_limit_num: 20
          })
        }
      }else {
        // 线上
        let jsonItem = JSON.parse(options.jsonItem);
        this.setData({
          onlineid: 1,
          onlineFlag: true,
          onlineFlagNum: 0,
          name: jsonItem.name,
          gender: jsonItem.gender,
          age: jsonItem.age,
          phone: jsonItem.phone,
          idcard: jsonItem.id_card,
          card_name: jsonItem.card_type == 1 ? '护照' : jsonItem.card_type == 2 ? '港澳台通行证' : '身份证',
          cardIndex: jsonItem.card_type,
          userinfo_id: jsonItem.id
        });

        if (jsonItem.card_type != 0) {
          this.setData({
            age: jsonItem.age
          });
          if (jsonItem.gender == '男') {
            this.setData({
              genderIndex: 0
            });
          } else if (jsonItem.gender == '女') {
            this.setData({
              genderIndex: 1
            });
          }
        }

        if (jsonItem.card_type == 0) {
          this.setData({
            keyboard_type: 'idcard',
            keyboard_type_limit_num: 18
          })
        } else {
          this.setData({
            keyboard_type: 'text',
            keyboard_type_limit_num: 20
          })
        }
      }
    }
  },
  //保存按钮禁用判断
  checkSubmitStatus: function(e){
    if(this.data.onlineid == 2){
      if(this.data.phone != '' && this.data.code != ''){
        this.setData({
          submitState: false
        })
      }else{
        this.setData({
          submitState: true
        })
      }
    }else{
      if(this.data.cardIndex != 0){
        if(this.data.name != '' && this.data.phone != '' && this.data.age != '' && this.data.code != '' && this.data.idcard != ''){
          this.setData({
            submitState: false
          })
        }else{
          this.setData({
            submitState: true
          })
        }
      } else {
        if(this.data.name != '' && this.data.phone != '' && this.data.code != '' && this.data.idcard != ''){
          this.setData({
            submitState: false
          })
        }else{
          this.setData({
            submitState: true
          })
        }
      }
    }
  },
  //历史信息自动填充
  bindHistoryInfo: function (e) {
    var that = this
    var data = {
      openid: app.globalData.openid
    }
    request.request_get('/a/getpretestInfo.hn', data, function (res) {
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

    this.checkSubmitStatus();
  },
  bindPhone: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      phone: str
    })

    this.checkSubmitStatus();
  },
  bindIdcard: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      idcard: str
    })

    this.checkSubmitStatus();
  },
  bindAge: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      age: str
    })

    this.checkSubmitStatus();
  },
  bindCode: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      code: str
    })
    this.checkSubmitStatus();
  },
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
  submitBuffer: utils.throttle(function (e) {

    var that = this;
    var id_card = that.data.idcard;
    var name = that.data.name;
    var phone = that.data.phone;
    var code = that.data.code;
    var age = that.data.age;
    var openid = app.globalData.openid;
    var phoneCode = that.data.phoneCode;
    var onlineFlag = that.data.onlineFlag;
    var cardIndex = that.data.cardIndex;
    console.log(id_card)
    console.log(openid)
    if (onlineFlag == false) { //线下
    } else { //线上
      if (cardIndex != 0) { //其他身份证件
        if (name == '') {
          box.showToast("请填写与证件一致的姓名");
          return
        }
        if (age == '') {
          box.showToast("请填写年龄");
          return
        } else if (id_card == '') {
          box.showToast("请填写正确的证件号码")
          return
        }
      } else { //线上 且选择身份证
        if (name == '') {
          box.showToast("请填写与证件一致的姓名");
          return
        } else if (id_card == '') {
          box.showToast("请填写正确的证件号码")
          return
        }
        if (!utils.checkIdCard(id_card)) {
          box.showToast("请填写正确的证件号码")
          return
        }
      }
    }
    if (phone == '') {
      box.showToast("请填写手机号码");
      return
    } else if (!utils.checkPhone(phone)) {
      box.showToast("手机号码格式不正确")
      return
    } else if (code == '') {
      box.showToast("请填写验证码");
      return
    } else if (phoneCode[0] == "") {
      //进入这里说明未点击获取验证码
      box.showToast("请获取验证码")
      return
    } else if (phoneCode[0] != phone) {
      box.showToast("手机号和验证码不匹配")
      return
    } else if (phoneCode[1] != code) {
      box.showToast("验证码错误")
      return
    }

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
      }
      that.setData({
        onlineFlagNum: 0
      })
    }

      if (that.data.policyChecked == false) {
        box.showToast("请阅读并勾选协议")
        return
      }

    var data = {
      open_id: openid,
      name: that.data.name,
      gender: that.data.gender,
      age: that.data.age,
      card_type: that.data.cardIndex,
      id_card: that.data.idcard,
      phone: phone,
      code: code,
      onlineFlag: that.data.onlineFlagNum,
    }

    console.log('---->:', data)
    // return

    // 0-默认从个人预约跳转   1-从选择受检人-添加受检人跳转 2-从选择受检人-编辑受检人跳转
    if(this.data.isAddSub == 0){
      request.request_get('/a/addSubject.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            box.showToast('添加成功','',1000)

            setTimeout(()=>{
              let pages = getCurrentPages();
              let prevPage = pages[pages.length - 2];
              prevPage.setData({
                isAddSubject: 1,
                userinfo_id: res.person_id,
                gender: that.data.gender,
                age: that.data.age,
                cardIndex: that.data.cardIndex,
                name: that.data.name,
                phone: that.data.phone,
                idcard: that.data.idcard,
                card_name: that.data.card_name,
                onlineFlag: that.data.onlineFlag,
                onlineFlagNum: that.data.onlineFlagNum,
              })
              wx.navigateBack({
                delta: 1,
              })
            },1200);
          } else {
            box.showToast(res.msg);
          }
        }else{
            box.showToast('网络异常，请稍后再试');
        }
      })
    } else if(this.data.isAddSub == 1){
      request.request_get('/a/addSubject.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            box.showToast('添加成功','',1000)

            setTimeout(()=>{
              let pages = getCurrentPages();
              let prevPage = pages[pages.length - 3];
              prevPage.setData({
                isAddSubject: 1,
                userinfo_id: res.person_id,
                gender: that.data.gender,
                age: that.data.age,
                cardIndex: that.data.cardIndex,
                name: that.data.name,
                phone: that.data.phone,
                idcard: that.data.idcard,
                card_name: that.data.card_name,
                onlineFlag: that.data.onlineFlag,
                onlineFlagNum: that.data.onlineFlagNum,
              })
              wx.navigateBack({
                delta: 2,
              })
            },1200);
          } else {
            box.showToast(res.msg);
          }
        }else{
            box.showToast('网络异常，请稍后再试');
        }
      })
    } else if(this.data.isAddSub == 2){
      data.id = that.data.userinfo_id;
      request.request_get('/a/editSubject.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            box.showToast('编辑成功','',1000)

            setTimeout(()=>{
              let pages = getCurrentPages();
              let prevPage = pages[pages.length - 3];
              prevPage.setData({
                isAddSubject: 1,
                userinfo_id: that.data.userinfo_id,
                gender: that.data.gender,
                age: that.data.age,
                cardIndex: that.data.cardIndex,
                name: that.data.name,
                phone: that.data.phone,
                idcard: that.data.idcard,
                card_name: that.data.card_name,
                onlineFlag: that.data.onlineFlag,
                onlineFlagNum: that.data.onlineFlagNum,
              })
              wx.navigateBack({
                delta: 2,
              })
            },1200);
          } else {
            box.showToast(res.msg);
          }
        }else{
            box.showToast('网络异常，请稍后再试');
        }
      })
    }
    
  }, 3000),
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
        request.request_get('/a/Verification.hn', {
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
          }else{
            box.showToast('网络异常，请稍后再试');
          }
        })
      }
    }
  },
  clearidcard: function () {
    this.setData({
      idcard: ''
    })
    this.checkSubmitStatus();
  },
  clearPhone: function () {
    this.setData({
      phone: ''
    })
    this.checkSubmitStatus();
  },
  clearCode: function () {
    this.setData({
      code: ''
    })
    this.checkSubmitStatus();
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
        onlineFlag: false,
        // gender: '男',
        // age: '',
        // cardIndex: 0,
        // name: '',
        // phone: '',
        // idcard: '',
        // card_name: '身份证',
        // onlineFlagNum: 1,
      })
    }
  },
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
  bindDeleteClick(){
    if(this.data.userinfo_id){
      this.setData({
        showDialog: true
       });
    }else{
      box.showToast('暂无该用户数据')
    }
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
   this.deleteCompanyContactInfo();
 },
  deleteCompanyContactInfo(){
   let params = {
    id: this.data.userinfo_id
   }
   request.request_get('/a/deleteSubject.hn', params, function (res) { 
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
  changePolicy(e) {
    console.log(e)
    this.setData({
      policyChecked: !this.data.policyChecked
    })
    console.log(this.data.policyChecked)
  },
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
  getbaseData: function () {
    let that = this;
    //获取用户服务协议
    //获取隐私政策
    let data = {}
    request.request_get('/a/getbaseInfo.hn', data, function (res) {
      if(res){
        if (res.success) {
          let msg = res.msg;
          that.setData({
            fwxy_url: msg.fwxy_url,
            yszz_url: msg.yszz_url
          })
        }
      }
    })
  },
})