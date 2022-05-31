
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pickerShow: {
      type: Boolean,
      observer:function(val){   //弹出动画
        // console.log(this.data);
        if(val){
          let animation = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          let animationOpacity = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          setTimeout(() => {
            animation.bottom(0).step();
            animationOpacity.opacity(0.7).step();
            this.setData({
              animationOpacity: animationOpacity.export(),
              animationData: animation.export()
            })
          }, 0);
        }else{
          let animation = wx.createAnimation({
            duration: 100,
            timingFunction: "ease"
          });
          let animationOpacity = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          animation.bottom(-320).step();
          animationOpacity.opacity(0).step();
          this.setData({
            animationOpacity: animationOpacity.export(),
            animationData: animation.export()
          });
        }
      }
    },
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    instrumentIndex: 0,
  },
  detached: function() {
  },
  attached: function() {},
  ready: function() {
   
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    preventD:function(){

    },
   
    onConfirm: function(e) {
      let instrumentIndex = this.data.instrumentIndex;
        //触发自定义事件
        if(instrumentIndex == 0){

        }else{
          this.triggerEvent("onConfirm", instrumentIndex);
          this.triggerEvent("hidePicker", {});
        }
    },
    hideModal: function() {
      this.triggerEvent("hidePicker", {});
    },
    hideModalCall: function() {
      this.triggerEvent("hidePickerCall", {});
    },
    bindSelect(e){
      console.log(e.currentTarget.dataset.number)
      this.setData({
        instrumentIndex: e.currentTarget.dataset.number
      });
    }
   
  }
});