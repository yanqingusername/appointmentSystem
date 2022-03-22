/* 
*  自动更新js
*  author cuiyf
*  date 2020-08-19
*/

// 自动更新小程序
function updateApp(appName){
    //判断微信版本是否兼容小程序更新机制API的使用
    if (wx.canIUse('getUpdateManager')) {
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            console.log('onCheckForUpdate====', res)
            // 请求完新版本信息的回调
            if (res.hasUpdate) {
                wx.showModal({
                    title: '更新提示',
                    content: '发现新版本啦！',
                    confirmText: '立即更新',
                    cancelText: '暂不更新',
                    success: function (res) {
                        console.log('success====', res)
                        if (res.confirm) {
                            // 进行更新操作
                            console.log('用户选择了确定更新')
                            updateManager.onUpdateReady(function () {
                                console.log('新的版本已经下载好，调用 applyUpdate 应用新版本并重启')
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate()
                            })
                            updateManager.onUpdateFailed(function () {
                                // 新的版本下载失败
                                console.log('新的版本下载失败')
                                wx.showModal({
                                    title: '失败',
                                    showCancel:false,
                                    content: '更新失败，您可删除当前小程序，重新搜索“' + appName + '”，点击后即可直接登陆使用最新版本。'
                                })
                            })
                        }else if (res.cancel) {
                            console.log('用户点击暂不更新');
                        }
                    }
                })
            }
        })
    }else {
        //TODO 此时微信版本太低（一般而言版本都是支持的）
        wx.showModal({
            title: '溫馨提示',
            showCancel:false,
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
    }
}

module.exports = {
    updateApp: updateApp
  }
  