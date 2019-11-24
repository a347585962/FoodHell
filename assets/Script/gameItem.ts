
// import TransitionScene from "../common/uitls/TransitionScene";
// TransitionScene
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
//点击游戏类别
@ccclass
export default class gameItem extends cc.Component {
    //进入的声音资源
    @property(cc.AudioClip)
    moveAudio: cc.AudioClip = null;
    private isTouch = false;

    private canTouch = false;

    touchButton(){
        if(this.canTouch)
            return;
        this.canTouch = true;
        console.log(this.node.name);
        let self = this;
        if(this.isTouch){
            this.node.height = 120;
            this.node.getChildByName("content").height = 120;
            this.node.getChildByName("content").height = 120;
            this.node.getChildByName("box").height = 123;
            this.node.getChildByName("icon").position = cc.v2(-150, -20);    
            self.canTouch = false;

            this.isTouch = false;
            this.canTouch = false;
        }
        else{
            this.isTouch = true;
            let heightEnd = this.node.getChildByName("content").height;

            let temp = 5;
            let detal = 4;
            let icon = this.node.getChildByName("icon");
            let y = icon.position;
            this.node.getChildByName("content").runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.001), cc.callFunc(function () {
                
                self.node.getChildByName("content").height = self.node.getChildByName("content").height + temp * detal;
                self.node.getChildByName("box").height = self.node.getChildByName("box").height + temp* detal;
                self.node.height  = self.node.height + temp * detal;
                // icon.position.y = icon.position.y - 1;
                // icon.position = y.add(cc.v2(0, 1));
                y = y.add(cc.v2(0, 2.8 * detal));
                icon.setPosition(y)
                console.log(icon.position.y);
                

                if(self.node.getChildByName("content").height >= 400){

                    self.node.getChildByName("content").stopAllActions();
                    self.node.height = 400;
                    self.node.getChildByName("content").height = 400;
                    self.node.getChildByName("box").height = 403;
                    self.canTouch = false;
                }

            }))));
        }
            
        
    }

    start () {

    }

    // update (dt) {}
}
