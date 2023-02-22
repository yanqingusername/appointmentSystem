/* 
 *  网络请求js
 *  author songcl
 *  date 2021-03-28 songcl
 */

// 参数配置
// var apiurl = 'http://xmr.coyotebio-lab.com/lis_appointment'    // 测试服务器
var apiurl = 'https://cloud.coyotebio-lab.com:8443/lis_appointment'    // 正式服务器
// var apiurl = "https://scldev.coyotebio-lab.com:8443/lis_appointment"//测试服务器

// var apiurl = "https://store.coyotebio-lab.com:8443/lis_appointment"//测试服务器

// var apiurl = 'http://syrdev.coyotebio-lab.com:8080/lis_appointment'    // 服务器

// 常用request get封装
function request_get(controller, data, cb) {
    var url = apiurl + controller;
    wx.request({
        url: url,
        data: data,
        method: 'GET',
        success: function (res) {
            //console.log(cb(res.data))
            return typeof cb == "function" && cb(res.data)
        },
        fail: function (res) {
            console.log('request networkTimeout')
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！'
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

var apiurlJinshazhou = 'https://cloud.coyotebio-lab.com/Jinshazhou/api'    // 正式服务器

// var apiurlJinshazhou = 'http://syrdev.coyotebio-lab.com:8080/Jinshazhou/api'    // 测试服务器

function request_getJinshazhou(controller, data, cb) {
    var urlJinshazhou = apiurlJinshazhou + controller;
    wx.request({
        url: urlJinshazhou,
        data: data,
        method: 'GET',
        success: function (res) {
            //console.log(cb(res.data))
            return typeof cb == "function" && cb(res.data)
        },
        fail: function (res) {
            console.log('request networkTimeout')
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！'
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

module.exports = {
    request_get: request_get,
    request_getJinshazhou: request_getJinshazhou
}