
import HttpUtils from "./HttpUtils";
// import ReleaseMg from "./ReleaseMg";
import HallDataConfig from "./HallDataConfig";

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

//版本管理
//本地存一个版本值  
//服务器存一个json值 
//判断本地版本值 android ios分开

@ccclass
export default class VersionMG {

    private static _instance: any;
    public static getInstance(): VersionMG {
        if (VersionMG._instance == null)
            VersionMG._instance = new VersionMG();
        return VersionMG._instance;
    }

    //安装的版本值
    private startVersionNum:string = "versionLocal"

    //显示弹框的场景名字
    private showPopSceneName:string = "cakeChoose";

    //初始化的版本
    private startVersion = 10;

    //不同平台的版本号 编译的时候修改
    private androidV = 11;
    private iosV = 11;

    private isShowPop:boolean = false;

    constructor(){
        //不同平台  不同的初始版本号
        if(cc.sys.platform == cc.sys.ANDROID){
            this.startVersion = this.androidV;
        }else{
            this.startVersion = this.iosV;
        }
        // this.initVersion();
        cc.sys.localStorage.setItem(this.startVersionNum, this.startVersion);
    }
    //初始化
    initVersion(){

        let version =  cc.sys.localStorage.getItem(this.startVersionNum);

        if(!version){

            version = this.startVersion;
            //cc.sys.localStorage.setItem(this.startVersionNum, version);
        }
        cc.sys.localStorage.setItem(this.startVersionNum, this.startVersion);
    }

    //获取当前版本
    getVersion():Number{
        let version =  cc.sys.localStorage.getItem(this.startVersionNum);
        if(!version){

            version = this.startVersion;

        }

        return version;
    }

    //判断是否弹框
    calIsToPopVerDialog(){


        let url =  HallDataConfig.getInstance().getVersionJsonUrl();//"http://youngcnfoodhall.top/UnicornCake/version.json";  
        let self = this;
        HttpUtils.getInstance().httpGet(url, function (resonpose) {
            
            //获取失败的话 从本地加载json
            if(!resonpose){
                
            }else{
                
                console.log("网络json");
                
                //注意抛出异常
                try {
                    let jsonobj = JSON.parse(resonpose);

                    let tempobj = jsonobj[0];

                    if(tempobj){
                        let webJson = 0;
                        let nowPlatFormName = "android";
                        if(cc.sys.platform == cc.sys.ANDROID){
                            webJson = Number(tempobj.androidVersion);
                            nowPlatFormName = "android";
                        }else{
                            webJson = Number(tempobj.iosVersion);
                            nowPlatFormName = "ios";
                        }

                        let localVersion = self.getVersion();
                        let sceneName = cc.director.getScene().name;

                        console.log("平台 ： " + nowPlatFormName);
                        console.log("本地版本" + localVersion);
                        console.log("网络版本" + webJson);
                        console.log("当前场景名" + sceneName);
                        console.log("是否弹过 " + self.isShowPop);    

                        let tempNumber = -1;
                        if (CC_JSB && !CC_PREVIEW){
                            var cppObj = jsToCPP.getInstance();
                            
                            var array = cppObj.getArray();
                            tempNumber = Number(array.length);
                        }
                        console.log("是否弹过 " + (tempNumber == 0));   
                        //版本号比本地大
                        if(tempNumber == 0 && webJson > self.getVersion() && sceneName == self.showPopSceneName){
                            //弹出框
                            console.log("显示弹框");
                            self.showPopDialogToMarket();
                            self.isShowPop = true;
                            if (CC_JSB && !CC_PREVIEW){
                                //设置数据进入数组
                                var cppObj = jsToCPP.getInstance();
                                cppObj.setArray("ont");
                                cppObj.setArray("two");
                                cppObj.setArray("three");
                                
                            }
                        }
                    }
                } catch (error) {
                    console.log("网络json错误 加载本地json");
                    
                    
                }

            }
            
        });

    }

    //弹出框 到market
    showPopDialogToMarket(){
        // cc.loader.loadRes("pop_market",cc.Prefab,function(error:Error,loadedResource:cc.Prefab){

        //     if(error){
        //         console.log(error + "");
                
        //         return;
        //     }
            
        //     let changechange = cc.instantiate(loadedResource);
        //     changechange.parent = cc.Canvas.instance.node;
        //     changechange.position = cc.v2(0, 0);
        //     changechange.zIndex = 100;
        //     ReleaseMg.getInstance().releaseAsset(loadedResource);
        // });


    }

    // update (dt) {}
}
