var box = require('../utils/box.js')

function loadUrlFile(urlfile){
    box.showLoading("请稍等...");
    wx.downloadFile({
        url: urlfile, 
        success: function (res) {                           
            console.log(res);
            if (res.statusCode === 200) {//成功
                //返回的文件临时地址，用于后面打开本地预览所用
                var Path = res.tempFilePath                     
                wx.openDocument({
                    filePath: Path, //要打开的文件路径
                    success: function (res) {
                        console.log('打开文件成功');
                    },
                    fail: function (res) {
                        console.log(res);
                        box.showToast("打开文件失败，请重试！")
                    },
                    complete:function(){
                        box.hideLoading();
                    }
                })
            }
        },
        fail: function (res) {
            console.log(res);
            box.hideLoading();
            box.showToast("打开文件失败，请重试！")
        }
    })
}

module.exports = {
    loadUrlFile: loadUrlFile
}