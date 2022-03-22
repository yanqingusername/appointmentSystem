const app = getApp()
var request = require('../utils/request.js')
var box = require('../utils/box.js')

/* 
*  登录js
*  author songcl
*  date 2021-03-02
*/

function toLogin(phone){
    console.log("utils toLogin方法")
    var data = {
        openid: app.globalData.openid,
        phone: phone
    }
    request.request_get('/support/login.hn', data, function (res) {
        console.info('回调123', res)
        if(res){
            if(res.success){
                console.log('登录成功')
                var userInfo = res.msg;
                console.log(userInfo)
                // 存储用户信息
                app.globalData.userInfo = userInfo;
                wx.switchTab({
                    url: '/pages/orderList/orderList'
                })
            }else{
                box.showToast(res.msg);
            }
        }
    })
}

module.exports = {
    toLogin: toLogin
}