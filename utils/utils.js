// 查看手机号是否正确
function checkPhone(phone) {
  	var phoneReg = /^1\d{10}$/;
  	if (phone.length != 11) {
      	return false
  	} else if (!phoneReg.test(phone)) {
            return false
  	} else {
      	return true
  	}
}
// 支持7——11位数字联系方式
function checkContact(contact){
    var contactReg = /^\d{7,11}$/;
    if(!contactReg.test(contact)){
        return false
    }else{
        return true
    }
}
// 获取当前时间
function now_time(){
	var date = new Date();
	const year = date.getFullYear()
  	const month = date.getMonth() + 1
 	const day = date.getDate()
  	const hour = date.getHours()
  	const minute = date.getMinutes()
  	const second = date.getSeconds()
  	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 元素是否在数组中
function isInArray(arr,value){
    for(var i = 0; i < arr.length; i++){
        if(value == arr[i].value){
			return true;
        }
    }
    return false;
}
const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()
	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function http_get(controller, data, cb) {
    var url = apiurl + controller;
    wx.request({
        url: url,
        data: data,
        method: 'GET',
        success: function (res) {
            return typeof cb == "function" && cb(res.data)
        },
        fail: function (res) {
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！',
                success: function () {
                    console.log('request networkTimeout')
                }
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

// 设置 FormData 因小程序 request不能使用formatdata
function _setFormData (dic) {
	var form_data_str = "";
		for (var i in dic){
			form_data_str += 
				'\r\n--XXX' +
				'\r\nContent-Disposition: form-data; name="' + i + '"' +
				'\r\n' +
				'\r\n'+ dic[i];
		}
	form_data_str += "\r\n--XXX--";
	return form_data_str;
}
// 参数配置
//var apiurl = 'http://localhost:8080/flash20AppletBackend/OrderController'         // 本地测试
//var apiurl = 'http://47.95.207.149:8080/flash20AppletBackend/OrderController'    // 测试服务器
var apiurl = 'https://www.prohealth-wch.com:8443/flash20AppletBackend'    //正式服务器

function upload_file(controller, file, name, data, cb) {
    var url = apiurl + controller;
    // 对data中的数据进行encodeURI处理
    for(var a in data){
        data[a] = encodeURI(data[a]);
		}
		console.log(data)
		console.log(file)
    wx.uploadFile({
        url: url,
        filePath: file,
        name: name,
        formData: data,
        header:{"chartset":"utf-8"},
        success: function (res) {
            var data = JSON.parse(res.data)
            return typeof cb == "function" && cb(data)
        },
        fail: function (res) {
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！',
                success: function () {
                    console.log('request networkTimeout')
                }
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

function   upload (controller,file,name,data,cb ) {
    var that = this
    var url = apiurl + controller;
    for (var i = 0; i < file.length; i++) {
        if(file[i] == ""){
            continue
        }
      wx.uploadFile({
        url: url,
        filePath: file[i],
        name: name,
        formData: data,
        header:{"chartset":"utf-8"},
        success: function (res) {
          console.log(res)
          var data = JSON.parse(res.data)
          return typeof cb == "function" && cb(data)
        },
        fail: function (res) {
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！',
                success: function () {
                    console.log('request networkTimeout')
                }
            })
            return typeof cb == "function" && cb(false)
        }
      })
    }

  }

//自定义弹框
function showToast(title,icon,duration) {
  var icon = arguments[1] ? arguments[1] : 'none';
  var duration = arguments[2] ? arguments[2] : 3000;
  wx.showToast({
      title: title,
      icon: icon,
      duration: duration,
      mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
  })
}
// 禁止输入表情或特殊字符
function checkInput(str){
    var reg = /[^a-zA-Z0-9\u4e00-\u9fa5\u3002\uff0c\uff1a\uff08\uff09\uff1f\u201c\u201d\u3001\uff01,/.!:()?_""—-]/g;
    str =  str.replace(reg,"");
    return str;
}
// 禁止输入表情或特殊字符2
function checkInput_2(str){
 
  var reg = /[^a-zA-Z0-9\u4E00-\u9FA5\uf900-\ufa2d\u0020\u002d\u002e\·,._-]/g;
  str =  str.replace(reg,"");
  return str;
}
// 合法姓名校验
function checkInputName(str){
  var reg = /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/;
  str =  str.replace(reg,"");
  return str;
}
// 合法姓名校验2
function checkInputName_2(str){
  var reg = /^[\u4E00-\u9FA5\uf900-\ufa2d\u0020\u002d\u002e\u0026\u0023\u0031\u0038\u0033\u003b]{2,20}$/;
  str =  str.replace(reg,"");
  return str;
}
/*函数节流*/
function throttle(fn, interval) {
    var enterTime = 0;//触发的时间
    var gapTime = interval || 3000 ;//间隔时间，如果interval不传，则默认300ms
    return function() {
      var context = this;
      var backTime = new Date();//第一次函数return即触发的时间
      if (backTime - enterTime > gapTime) {
        fn.call(context,arguments);
        enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
      }
    };
  }
  function IdCard(UUserCard, num) {
      if (num == 1) {
        //获取出生日期
        birth = UUserCard.substring(6, 10) + "-" + UUserCard.substring(10, 12) + "-" + UUserCard.substring(12, 14);
        return birth;
      }
      if (num == 2) {
        //获取性别
        if (parseInt(UUserCard.substr(16, 1)) % 2 == 1) {
          //男
          return "男";
        } else {
          //女
          return "女";
        }
      }
      if (num == 3) {
        //获取年龄
        var myDate = new Date();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
        if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
          age++;
        }
        return age;
      }
    }
    // util.js页面，封装的公共方法

/**
 * 去掉字符串头尾空格
 */
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }
  
  /**
   * 身份证号验证
   */
  function checkIdCard(idCard) {
    idCard = trim(idCard.replace(/ /g, "")); //去掉字符串头尾空格
    if (idCard.length == 15) {
      return isValidityBrithBy15IdCard(idCard); //进行15位身份证的验证
    } else if (idCard.length == 18) {
      var a_idCard = idCard.split(""); // 得到身份证数组
      if (isValidityBrithBy18IdCard(idCard) && isTrueValidateCodeBy18IdCard(a_idCard)) { //进行18位身份证的基本验证和第18位的验证
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  
  /**
   * 判断身份证号码为18位时最后的验证位是否正确
   * @param a_idCard 身份证号码数组
   * @return
   */
  function isTrueValidateCodeBy18IdCard(a_idCard) {
    var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1]; // 加权因子
    var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    var sum = 0; // 声明加权求和变量
    if (a_idCard[17].toLowerCase() == 'x') {
      a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
    }
    for (var i = 0; i < 17; i++) {
      sum += Wi[i] * a_idCard[i]; // 加权求和
    }
    var valCodePosition = sum % 11; // 得到验证码所位置
    if (a_idCard[17] == ValideCode[valCodePosition]) {
      return true;
    } else {
      return false;
    }
  }
  
  /**
   * 验证18位数身份证号码中的生日是否是有效生日
   * @param idCard 18位书身份证字符串
   * @return
   */
  function isValidityBrithBy18IdCard(idCard18) {
    var year = idCard18.substring(6, 10);
    var month = idCard18.substring(10, 12);
    var day = idCard18.substring(12, 14);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 这里用getFullYear()获取年份，避免千年虫问题
    if (temp_date.getFullYear() != parseFloat(year) ||
      temp_date.getMonth() != parseFloat(month) - 1 ||
      temp_date.getDate() != parseFloat(day)) {
      return false;
    } else {
      return true;
    }
  }
  
  /**
   * 验证15位数身份证号码中的生日是否是有效生日
   * @param idCard15 15位书身份证字符串
   * @return
   */
  function isValidityBrithBy15IdCard(idCard15) {
    var year = idCard15.substring(6, 8);
    var month = idCard15.substring(8, 10);
    var day = idCard15.substring(10, 12);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
    if (temp_date.getYear() != parseFloat(year) ||
      temp_date.getMonth() != parseFloat(month) - 1 ||
      temp_date.getDate() != parseFloat(day)) {
      return false;
    } else {
      return true;
    }
  }
//m转km
  function setMorKm(m){
    var n=''
    if(m){
        if (m >= 1000) {
            n = (m / 1000).toFixed(2) + 'km'
        } else {
            n = m + 'm'
        }
    }else{
        n = '0m'
    }
    return n
  }
  //当前时间是否在指定时间段内
  function checkAuditTime(beginTime) { //09:00-12:00 || 09:00-12:00;13:00-18:00
    
    if(beginTime == '' || beginTime == undefined || beginTime == null){
      return true
    }else{
		var nowDate = new Date();
		var beginDate = new Date(nowDate);
		var endDate = new Date(nowDate);
		
		var beginIndex = beginTime.indexOf(":");
		var beginHour = beginTime.substring(0, beginIndex);
    var beginMinue = beginTime.substr(beginIndex + 1, 2);
    console.log('beginHour='+beginHour,'beginMinue='+beginMinue)
		beginDate.setHours(beginHour, beginMinue, 0, 0);
    console.log('beginDate='+beginDate)
    
		var endIndex = beginTime.indexOf("-");
		var endHour = beginTime.substr(endIndex + 1, 2);
    var endMinue = beginTime.substr(endIndex + 4, 2);
    console.log('endHour='+endHour,'endMinue='+endMinue)
    endDate.setHours(endHour, endMinue, 0, 0);
    console.log('endDate='+endDate)
   
    console.log(nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= endDate.getTime())
    if(beginHour <= endHour){
      return nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= endDate.getTime();
    }else{
      var nowDate1 = new Date();
      var nowDate2 = new Date();
      nowDate1.setHours(24,0,0,0);
      nowDate2.setHours(0,0,0,0);
      console.log('nowDate1='+nowDate1,'nowDate2='+nowDate2)
      console.log('nowDate='+nowDate,'beginDate='+beginDate,'endDate='+endDate)
      console.log(nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= nowDate1.getTime() )
      console.log(nowDate.getTime() - nowDate2.getTime() >= 0 && nowDate.getTime() <= endDate.getTime())
      return ( nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= nowDate1.getTime() ) || ( nowDate.getTime() - nowDate2.getTime() >= 0 && nowDate.getTime() <= endDate.getTime() )

    }
    
  }
}

  //当前时间是否在指定时间段内(提前半小时)
  function checkAuditTime_before30min(beginTime) { //09:00-12:00 || 09:00-12:00;13:00-18:00
    if(beginTime == '' || beginTime == undefined || beginTime == null){
      return true
    }else{
		var nowDate = new Date();
		var beginDate = new Date(nowDate);
		var endDate = new Date(nowDate);
		
		var beginIndex = beginTime.indexOf(":");
		var beginHour = beginTime.substring(0, beginIndex);
    var beginMinue = beginTime.substr(beginIndex + 1, 2);
    console.log('beginHour='+beginHour,'beginMinue='+beginMinue)
		beginDate.setHours(beginHour, beginMinue, 0, 0);
    console.log('beginDate='+beginDate)
    
		var endIndex = beginTime.indexOf("-");
		var endHour = beginTime.substr(endIndex + 1, 2);
    var endMinue = beginTime.substr(endIndex + 4, 2);
    console.log('endHour='+endHour,'endMinue='+endMinue)
    endDate.setHours(endHour, endMinue, 0, 0);
    console.log('endDate='+endDate)
    console.log(nowDate.getTime() - (beginDate.getTime()-1000*60*30) >= 0 && nowDate.getTime() <= endDate.getTime())
    
    if(beginHour <= endHour){
      return nowDate.getTime() - (beginDate.getTime()-1000*60*30) >= 0 && nowDate.getTime() <= endDate.getTime();
    }else{
      var nowDate1 = new Date();
      var nowDate2 = new Date();
      nowDate1.setHours(24,0,0,0);
      nowDate2.setHours(0,0,0,0);
      console.log('nowDate1='+nowDate1,'nowDate2='+nowDate2)
      console.log('nowDate='+nowDate,'beginDate='+beginDate,'endDate='+endDate)
      console.log(nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= nowDate1.getTime() )
      console.log(nowDate.getTime() - nowDate2.getTime() >= 0 && nowDate.getTime() <= endDate.getTime())
      return ( nowDate.getTime() - (beginDate.getTime()-1000*60*30) >= 0 && nowDate.getTime() <= nowDate1.getTime() ) || ( nowDate.getTime() - nowDate2.getTime() >= 0 && nowDate.getTime() <= endDate.getTime() )

    }
  }
}


 function compareTime(endTime){
  var nowD = new Date(); //当前时间
  var reg = new RegExp( '/' , "g" )
  var endD = new Date(endTime.replace(reg,'-'));
 
  if( nowD.getTime() < endD.getTime()){ //getTime() 方法可返回距 1970 年 1 月 1 日之间的毫秒数。
  return true
  }else{
    return false
 }
 }

 /*
  handle:函数
  wait:规定在1.5秒钟内只能执行一次
 */
const newthrottle = (fn, gapTime) =>{
  if (gapTime == null || gapTime == undefined) {
      gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function () {
      let _nowTime = + new Date()
      if (_nowTime - _lastTime > gapTime || !_lastTime) {
          fn.apply(this, arguments)   //将this和参数传给原函数
          _lastTime = _nowTime
      }
  }
}
module.exports = {
    checkPhone: checkPhone,
    checkContact: checkContact,
    now_time:now_time,
    isInArray:isInArray,
    formatTime: formatTime,
    http_get:http_get,
    showToast:showToast,
    upload_file:upload_file,
    upload:upload,
    checkInput:checkInput,
    throttle:throttle,
    IdCard:IdCard,
    checkIdCard:checkIdCard,
    checkInputName:checkInputName,
    setMorKm:setMorKm,
    checkInputName_2:checkInputName_2,
    checkInput_2:checkInput_2,
    checkAuditTime:checkAuditTime,
    checkAuditTime_before30min:checkAuditTime_before30min,
    formatNumber:formatNumber,
    compareTime:compareTime,
    newthrottle: newthrottle
}
