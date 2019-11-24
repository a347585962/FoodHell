// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//const t = cc.tween;

cc.Class({
    extends: cc.Component,
    // editor: {
    //     executionOrder:0,
    //     requireComponent: cc.BoxCollider
    // },
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

    onLoad () {
       // let noe = this.node;

       // t(noe).delay(0.5).start();

        this.node.on(cc.Node.EventType.TOUCH_START,function clickDown() {
            var timeScale = 1.2;
            var scale = cc.scaleTo(0.13*timeScale,1,0.8);
            this.node.runAction(scale);
        },this);
        var clickUp = function() {
            var timeScale = 1.2;
            var scale0 = cc.scaleTo(0.11*timeScale,0.82,1);
            var scale1 = cc.scaleTo(0.1*timeScale,1,0.86);
            var scale2 = cc.scaleTo(0.09*timeScale,0.88,1);
            var scale3 = cc.scaleTo(0.08*timeScale,1,0.89);
            var scale4 = cc.scaleTo(0.07*timeScale,1);
            var seq = cc.sequence(scale0,scale1,scale2,scale3,scale4);
            this.node.runAction(seq);
        };
        this.node.on(cc.Node.EventType.TOUCH_END,clickUp,this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,clickUp,this);
    },

    // update (dt) {},
});
