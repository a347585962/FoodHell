// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    setUp: function () {
        var frameSize = cc.view.getFrameSize();
        var designSize = cc.Canvas.instance.designResolution;
        var scaleX = frameSize.width/designSize.width;
        var scaleY = frameSize.height/designSize.height;
        var realScale = 1;
        if(scaleX>scaleY) {
            realScale = scaleY/scaleX;
        }else if(scaleY>scaleX){
            realScale = scaleX/scaleY;
        }
        this.node.scaleX = realScale;
        this.node.scaleY = realScale;
    },
    start () {
       this.setUp();
    },

    // update (dt) {},
    lateUpdate: function () {
        
       if(CC_PREVIEW && CC_JSB){
           
      }
    }
});
