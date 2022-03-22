/* 
*  自定义弹框js -- Pop-up box
*  author cuiyf
*  date 2020-08-19
*/

//自定义弹框
function showToast(title,icon,duration) {
    var icon = arguments[1] ? arguments[1] : 'none';
    var duration = arguments[2] ? arguments[2] : 2000;
    wx.showToast({
        title: title,
        icon: icon,
        duration: duration,
        mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
    })
}

//自定义加载框
function showLoading(title,icon,duration) {
    var icon = arguments[1] ? arguments[1] : 'loading';
    var duration = arguments[2] ? arguments[2] : 800000;
    wx.showLoading({
        title: title,
        icon: icon,
        duration: duration,
        mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
    })
}

// 自定义隐藏加载框
function hideLoading() {
    wx.hideLoading();
}

module.exports = {
    showToast: showToast,
    showLoading:showLoading,
    hideLoading:hideLoading
}