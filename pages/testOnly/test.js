Page({
  data: {
    text:''
  },
  onLoad() {
  },
  bindOCR: function () {
    let that = this;
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
          //https://api-cn.faceplusplus.com/imagepp/v2/generalocr
          url: 'https://api-cn.faceplusplus.com/imagepp/v2/generalocr',
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
            console.log(res)
            var obj = JSON.parse(res.data)
            console.log(obj.text_info)
          },
          fail: function (res) {
            console.log(res)
          },
        })
      }
    })
  },

})