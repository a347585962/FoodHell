// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property,disallowMultiple,menu} = cc._decorator;

@ccclass
@disallowMultiple()
@menu("common/viewadapter/ViewSizeAdapter")
 /** !#zh: 用于屏幕适配,挂载到Canvas上，一个场景只需要一个 */
export default class ViewSizeAdapter extends cc.Component {

    setup () {
        let frameSize = cc.view.getFrameSize();
        cc.log(" fx == "+ frameSize.width+" fy ==" +frameSize.height);
        let designSize = cc.Canvas.instance.designResolution;
        let scaleX = frameSize.width/designSize.width;
        let scaleY = frameSize.height/designSize.height;
        let minScale:number;
        if(scaleX>scaleY){
            minScale = scaleY;
        }else {
            minScale = scaleX;
        }
        cc.log("scaleX == "+ scaleX+" y ==" +scaleY);
        cc.log(" minScale == "+ minScale);
        cc.log(" Rx == "+ frameSize.width/minScale+" Ry ==" +frameSize.height/minScale);
        cc.view.setDesignResolutionSize(frameSize.width/minScale,frameSize.height/minScale,cc.ResolutionPolicy.NO_BORDER);
        (cc.Canvas.instance as any).alignWithScreen();
    }
    
    onLoad () {
        this.setup();
        cc.view.setResizeCallback(()=>{
            this.setup();
           cc.director.dispatchEvent(new cc.Event.EventCustom("ResizeFrame",true));
        });
    }

    // update (dt) {}
}
