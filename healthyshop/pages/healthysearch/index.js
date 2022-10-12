const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    class_id: "",
    class_title:"搜索",
    searchText: '',
    shopList:[
      {
        id:'1',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'2',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'3',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'4',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      },
      {
        id:'5',
        subtitle:"【满100减20】",
        title: "卡尤迪肠道菌群检测试剂盒 顺",
        price: "299",
        oldprice: '399'
      }
    ]
  },
  onShow: function () {

  },
  onLoad: function (options) {
    this.setData({
      class_id: options.id,
      class_title: options.title,
    });
  },
  onReachBottom: function () {
    console.log('1111')
  },
  //利用js进行模糊查询
  searchChangeHandle: function (e) {
    this.setData({
      searchText: e.detail.value
    })
  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
    this.setData({
      searchText: '',
    });
    // this.getChannelList();
  },
  handleRouter(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/healthyshop/pages/shoppingdetail/index?shopid=${id}`
    });
  },
  /**
   * 获取搜索商品列表
   */
   getShopList: function () {
    var that = this;
    var data = {
      class_id: this.data.class_id,
      searchText: this.data.class_id,
    }
    request.request_get('/activity/getSearchShopList.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if (that.data.page == 1) {
            that.setData({
              shopList: res.msg,
              page: (res.data.data && res.data.data.length > 0) ? that.data.page + 1 : that.data.page
            })
          } else {
            that.setData({
              shopList: that.data.goodList.concat(res.data.data || []),
              page: (res.data.data && res.data.data.length > 0) ? that.data.page + 1 : that.data.page,
            })
          }
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
})