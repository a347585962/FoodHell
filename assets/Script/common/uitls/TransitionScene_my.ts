import ColorRect = require("./ColorRect_my");
import { CocosHelper } from "./CocosHelper_my";
// import ReleaseMg from "../../Script/ReleaseMg";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
// import ColorRect = require('./utils/ColorRect');
// import { CocosHelper } from './utils/CocosHelper';
// ColorRect
// CocosHelper
const {ccclass, property} = cc._decorator;

@ccclass
export default class TransitionScene extends cc.Component {
    private newSceneName:string = null;
    private static currentChangeName = "";
    /**
     * @description: 切换场景
     * @param newSceneName 场景名称
     * @param prefabUrl 过度效果预制路径,默认就是个白色渐变
     * @return: 
     */
    static changeScene(newSceneName:string,prefabUrl:string = "codebase/TransitionScen"){
    
        cc.director.loadScene(newSceneName);
        return;
        cc.loader.loadRes(prefabUrl,cc.Prefab,function(error:Error,loadedResource:cc.Prefab){
            let change:cc.Node;
            if(error == null && loadedResource != null){
                change = cc.instantiate(loadedResource);
            }else {
                 change = new cc.Node();
                let _size = cc.view.getVisibleSize();//cc.view.getDesignResolutionSize();
                change.setContentSize(_size * 2);
                change.position = new cc.Vec2(_size.width*.5,_size.height*.5);
                // let r : ColorRect = change.addComponent(ColorRect);
                // r.blColor = r.brColor = r.tlColor = r.trColor = cc.Color.WHITE;
                let _btn =change.addComponent(cc.Button);
                _btn.target = change;
            }
            change.opacity = 0;
            let currentgroup = change.group;
            change.group = "uilayer";
            if(change.groupIndex == -1){
                change.group = currentgroup;
            }
             change.name = "TransitionSceneNode";
            let tran = change.getComponent(TransitionScene);
            if(tran == null){
                tran = change.addComponent(TransitionScene);
            }
            tran.newSceneName = newSceneName;
            cc.game.addPersistRootNode(change);
            change.setSiblingIndex(999);
            ReleaseMg.getInstance().releaseAsset(loadedResource);
        });
    }

    private startChange() {
        CocosHelper.visitNode(cc.director.getScene(),function (node:cc.Node) {
            let coms = node.getComponents(cc.Component);
            for(let c of coms){
                let transitiOnExit = c["transitiOnExit"];
                if(transitiOnExit != undefined && transitiOnExit instanceof Function){
                    (transitiOnExit as Function).bind(c)();
                }
            }
        });
        this.node.opacity = 0;
        this.node.stopAllActions();
        let finished = cc.callFunc(()=>{
            if(this.newSceneName != null){
                cc.director.preloadScene(this.newSceneName ,()=>{
                    cc.director.loadScene(this.newSceneName,function(){
                        CocosHelper.visitNode(cc.director.getScene(),function (node:cc.Node) {
                            let coms = node.getComponents(cc.Component);
                            for(let c of coms){
                                let transitionOnEnter = c["transitionOnEnter"];
                                if(transitionOnEnter != undefined && transitionOnEnter instanceof Function){
                                    c["hasTransition"] = true;
                                }
                            }
                        });
                        let node= cc.find("TransitionSceneNode");
                        if(node != null){
                            let loadFinished = cc.callFunc(function(){
                                cc.game.removePersistRootNode(this);
                                this.destroy();
                                CocosHelper.visitNode(cc.director.getScene(),function (node:cc.Node) {
                                    let coms = node.getComponents(cc.Component);
                                    for(let c of coms){
                                        let transitionOnEnter = c["transitionOnEnter"];
                                        if(transitionOnEnter != undefined && transitionOnEnter instanceof Function){
                                            (transitionOnEnter as Function).bind(c)();
                                        }
                                    }
                                });
                            },node);
                            node.runAction(cc.sequence(cc.fadeOut(0.6),loadFinished));
                        }
                           
                    });
                     this.newSceneName = null;
                });
            }
        },this);

        this.node.runAction(cc.sequence(cc.fadeIn(0.6),finished));
    }

onDestroy(){
    TransitionScene.currentChangeName = "";
}
    start () {
        if(TransitionScene.currentChangeName != ""){
            cc.error("scene:"+TransitionScene.currentChangeName + " isChanging, don`t change "+this.newSceneName);
        }
        TransitionScene.currentChangeName = this.newSceneName;
        this.startChange();
    }

    // update (dt) {}
}
