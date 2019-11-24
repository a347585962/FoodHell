const {ccclass, property} = cc._decorator;
/**
 * 防止按钮点击多次 放在一个有Button组件的node下面
 */
@ccclass
export default class ButtonSafe extends cc.Component {

    @property
    safeTime: number = 0.5;

    clickEvents = [];
    start () {

        let button = this.node.getComponent(cc.Button);
        if (!button){
            return;
        }

        this.clickEvents = button.clickEvents;
        let self = this;

        var isTouch = false;
        this.node.on('click', ()=>{
            // this.node.stopAllActions();
            // let position = this.node.getPosition();
            // let action = cc.moveTo(0.3,cc.v2(position.x,position.y+15));
            // let action1 = cc.moveTo(0.3,cc.v2(position.x,position.y));
            // this.node.runAction(cc.repeat(cc.sequence(action,action1),2));
            button.clickEvents = [];
            if(!isTouch){
                isTouch = true;
                self.scheduleOnce((dt)=>{
                    button.clickEvents = self.clickEvents;
                    isTouch =false;
                }, this.safeTime);
            }
        }, this);
    }

    // update (dt) {}
}
