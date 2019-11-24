// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, disallowMultiple,menu} = cc._decorator;

@ccclass
@disallowMultiple()
@menu("common/viewadapter/BgScale")
export default class BgScale extends cc.Component {

    rf:Function;

    setBgScale (){
        if(!this.enabled){
            return ;
        }
        let designSize = cc.view.getVisibleSize();
        let width = this.node.width;
        let height = this.node.height;
        if(height<designSize.height){
            this.node.setScale(designSize.height/height);
        }
        if(width<designSize.width) {
            this.node.setScale(designSize.width/width);
        }
    }
onEnable(){
    this.setBgScale();
}
    onLoad () {
        this.setBgScale();
        if(this.rf == null) {
            this.rf = cc.director.on("ResizeFrame",()=>{
                this.setBgScale();
            },this);
        }
    }

    onDestroy() {
        if(this.rf != null){
            cc.director.off("ResizeFrame",this.rf,this);
        }
      
    }
    // update (dt) {}
}
