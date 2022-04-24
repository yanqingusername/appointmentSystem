/* 
 *  网络请求js
 *  author songcl
 *  date 2021-03-28 songcl
 */

// 参数配置
//var apiurl = 'http://localhost:8080/flash20AppletBackend'         // 本地测试
// var apiurl = 'https://store.coyotebio-lab.com:8443/lis_appointment'    // 测试服务器
//var apiurl = 'http://xmr.coyotebio-lab.com/lis_appointment'    // 测试服务器
var apiurl = 'https://cloud.coyotebio-lab.com:8443/lis_appointment'    // 服务器
//8.130.48.31
// var apiurl = 'https://scldev.coyotebio-lab.com:8443/lis_appointment'//测试服务器 孙仕豪
//var apiurl = 'http://8.130.25.5:8080/flash20AppletBackend' // 测试服务器 宋彦睿
//var apiurl = 'https://syrdev.coyotebio-lab.com/flash20AppletBackend/'
//var apiurl = 'http://8.130.55.156:8080/flash20AppletBackend'    // 测试服务器  于光良
//var apiurl = 'https://www.prohealth-wch.com:8443/flash20AppletBackend'    //正式服务器

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
module.exports = {
    request_get: request_get
}