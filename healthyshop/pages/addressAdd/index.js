
const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowRegion: 1,
    region: ['北京市', '北京市', '东城区'],
    title: "添加地址",
    address_person: "",
    address_phone: "",
    province: "",
    city: "",
    area: "",
    address: "",
    addressregion:"",
    showDialog: false,
    dialogData: {
      title: "确认删除该地址？",
      titles:  "删除后无法恢复",
      cancel: "取消",
      sure: "确认"
    },
    submitState: true,
    isAddAddress: 0,  // 0-默认从商场提交订单页-添加地址跳转   1-从选择地址-添加地址跳转 2-从选择地址-编辑地址跳转
    address_id: '',
    policyChecked: false,
    isMine: 0,

    user_id: ""
  },
  onShow: function () {
  },
  onLoad: function (options) {
    this.getbaseData();
    this.setData({
      isAddAddress: options.isAddAddress,
      isMine: options.isMine,
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    });

    if(options && options.title){
      this.setData({
        title: options.title,
      })
    }

    if(options && options.jsonItem){
      let jsonItem = JSON.parse(options.jsonItem);
      let addressregion = jsonItem.province+jsonItem.city+jsonItem.region+"";

      this.setData({
        address_person: jsonItem.receive_name,
        address_phone: jsonItem.phone,
        province: jsonItem.province,
        city: jsonItem.city,
        area: jsonItem.region,
        address: jsonItem.detail_address,
        addressregion: addressregion,
        address_id: jsonItem.id,
        isShowRegion: 2,
        region: [jsonItem.province, jsonItem.city, jsonItem.region],
      });
      this.checkSubmitStatus();
    }
  },
  //保存按钮禁用判断
  checkSubmitStatus: function(e){
    if(this.data.address_person != '' && this.data.address_phone != '' && this.data.addressregion != '' && this.data.address != ''){
      this.setData({
        submitState: false
      })
    }else{
      this.setData({
        submitState: true
      })
    }
  },
  bindName: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput_2(str);
    this.setData({
      address_person: str
    })

    this.checkSubmitStatus();
  },
  bindPhone: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      address_phone: str
    })

    this.checkSubmitStatus();
  },
  clearPhone: function () {
    this.setData({
      address_phone: ''
    })
    this.checkSubmitStatus();
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let region = e.detail.value;
    if(region && region.length > 0){
      let addressregion = region[0]+region[1]+region[2]+"";
      this.setData({
        isShowRegion: 2,
        region: e.detail.value,
        addressregion: addressregion,
      })
    }
  },
  updateLocation: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    this.setData({
      address: str
    })

    this.checkSubmitStatus();
  },
  
  submitBuffer: utils.throttle(function (e) {

    var that = this;
    var address_person = that.data.address_person;
    var address_phone = that.data.address_phone;
    var addressregion = that.data.addressregion;
    var address = that.data.address;
    
    if (address_person == '') {
      box.showToast("请填写联系人姓名");
      return
    } else if (address_phone == '') {
      box.showToast("请填写手机号码");
      return
    } else if (!utils.checkPhone(address_phone)) {
      box.showToast("手机号码格式不正确")
      return
    } else if (addressregion == '') {
      box.showToast("请选择所在地区")
      return
    } else if (address == '') {
      box.showToast("请填写详细地址");
      return
    }

    if (that.data.policyChecked == false) {
      box.showToast("请阅读并勾选协议")
      return
    }

    var data = {
      user_id: this.data.user_id,
      receive_name: that.data.address_person,
      phone: that.data.address_phone,
      province: that.data.region[0],
      city: that.data.region[1],
      region: that.data.region[2],
      detail_address: that.data.address
    }

    console.log('---->:', data)
    // return

    // 0-默认从商场提交订单页-添加地址跳转   1-从选择地址-添加地址跳转 2-从选择地址-编辑地址跳转
    if(this.data.isAddAddress == 0){
      request.request_get('/Newacid/addShopAddress.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            box.showToast('添加成功','',1000)

            if(that.data.isMine == 1){
              setTimeout(()=>{
                wx.navigateBack({
                  delta: 1,
                })
              },1200);
            }else{
              setTimeout(()=>{
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];
                prevPage.setData({
                  isAddAddress: 1,
                  address_id: res.msg,
                  address_person: that.data.address_person,
                  address_phone: that.data.address_phone,
                  province: that.data.region[0],
                  city: that.data.region[1],
                  area: that.data.region[2],
                  address: that.data.address,
                })
                wx.navigateBack({
                  delta: 1,
                })
              },1200);
            }
          } else {
            box.showToast(res.msg);
          }
        }else{
            box.showToast('网络异常，请稍后再试');
        }
      })
    } else if(this.data.isAddAddress == 1){
      request.request_get('/Newacid/addShopAddress.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            box.showToast('添加成功','',1000)

            if(that.data.isMine == 1){
              setTimeout(()=>{
                wx.navigateBack({
                  delta: 1,
                })
              },1200);
            }else{
              setTimeout(()=>{
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 3];
                prevPage.setData({
                  isAddAddress: 1,
                  address_id: res.msg,
                  address_person: that.data.address_person,
                  address_phone: that.data.address_phone,
                  province: that.data.region[0],
                  city: that.data.region[1],
                  area: that.data.region[2],
                  address: that.data.address,
                })
                wx.navigateBack({
                  delta: 2,
                })
              },1200);
            }
          } else {
            box.showToast(res.msg);
          }
        }else{
            box.showToast('网络异常，请稍后再试');
        }
      })
    } else if(this.data.isAddAddress == 2){
      data.id = that.data.address_id;
      request.request_get('/Newacid/updateShopAddress.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            box.showToast('编辑成功','',1000)

            if(that.data.isMine == 1){
              setTimeout(()=>{
                wx.navigateBack({
                  delta: 1,
                })
              },1200);
            }else{
              setTimeout(()=>{
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 3];
                prevPage.setData({
                  isAddAddress: 1,
                  address_id: that.data.address_id,
                  address_person: that.data.address_person,
                  address_phone: that.data.address_phone,
                  province: that.data.region[0],
                  city: that.data.region[1],
                  area: that.data.region[2],
                  address: that.data.address,
                })
                wx.navigateBack({
                  delta: 2,
                })
              },1200);
            }
          } else {
            box.showToast(res.msg);
          }
        }else{
            box.showToast('网络异常，请稍后再试');
        }
      })
    }
    
  }, 3000),
  bindDeleteClick(){
    if(this.data.address_id){
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
    id: this.data.address_id,
    user_id: this.data.user_id,
   }
   request.request_get('/Newacid/deleteShopAddress.hn', params, function (res) { 
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
      filePath: wx.env.USER_DATA_PATH + '/VIP用户服务协议.pdf',
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
      filePath: wx.env.USER_DATA_PATH + '/VIP隐私政策.pdf',
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