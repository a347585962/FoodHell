import AdsManagerHall, { ADS_TYPE } from "./AdsManagerHall";

// interface RewardJsonItem {
//     IAPID: string;
//     ModuleName: string;
//     Key:string;
//     Indexs:string;

//     getKey(): string;

// }
// declare module '*.json'

export default class RewardManagerHall {
    private static _instance: any;
    public static getInstance(): RewardManagerHall {
        if (RewardManagerHall._instance == null)
            RewardManagerHall._instance = new RewardManagerHall();
        return RewardManagerHall._instance;
    }
    constructor(){
        this.showCrossCount = 0;
        
    }
    //成员变量
    s_showFullAds:boolean 
    _waitingUnLockItemInfo:RewardInfoItem;
    showCrossCount:number = 0;

    //回调函数
    public showRewardFalseCall : () => void;   
    public showRewardLoadingCall : () => void;   
    public removeRewardLoadingCall : (key:string) => void;   
    public showDialog : () => void;  
     
    mapRewardItems = new Map<string, RewardInfoItem>();
    jsonPath:string = "content.json";
    //加载配置文件
    public loadConfig(){
        let self = this;
        cc.loader.loadRes(this.jsonPath, function (err, object) {
            if (err) {
                cc.log("解析json文件失败" + err);
                return;
            }

            object.json.forEach(element => {

                // console.log(reward.IAPID + reward.Indexs+reward.Key+reward.ModuleName);
                // let key:string = reward.getKey();

                //分割字符串
                let arrComma = element.Indexs.split(",");
                if(arrComma.length == 0){

                    return;
                }
                console.log(arrComma);
                let iap = element.IAPID;
                let moduleName = element.ModuleName;
                let key = element.Key;
                for (let index = 0; index < arrComma.length; index++) {
                    let reward:RewardInfoItem = new RewardInfoItem(iap, moduleName, key, -1);
                    const element = arrComma[index];
                    reward.index = Number(element);
                    self.mapRewardItems.set(reward.getKey(), reward);
                }

                console.log(self.mapRewardItems);
                
            });

        });
    };
    
    public getRewardInfoItem(moduleName:string, keyInModule : string, inx : number):RewardInfoItem{

        let key = this.getItemKey(moduleName, keyInModule, inx);
        if(this.mapRewardItems.has(key))
            return this.mapRewardItems.get(key);
        return null;
    }
    public getItemKey(moduleName:string, keyInModule:string, inx: number):string
    {
        console.log(moduleName + keyInModule + String(inx));
        
        return moduleName + keyInModule + String(inx);
    }

    //检查是否锁住
    public isLocked(key:string):boolean{
        
        if(!this.mapRewardItems.has(key))
            return false;

        let isLock =  cc.sys.localStorage.getItem(key);
        if(!isLock)
            isLock = 1;
        
        //对boolean没有支持 用0代表false 1代表true
        cc.sys.localStorage.setItem(key, isLock);
        return isLock == 1;  //.getBoolForKey(key, true);
    };

    public isLockOther(key:string):boolean { 
        let isLock =  cc.sys.localStorage.getItem(key);
        if(!isLock)
            isLock = 1;
        
        //对boolean没有支持 用0代表false 1代表true
        cc.sys.localStorage.setItem(key, isLock);
        return isLock == 1;  //.getBoolForKey(key, true);

    }


    //根据key展示广告
    public showRewardAds(key:string){

        if(!this.mapRewardItems.has(key))
            return;

        if(!this.isLocked(key))
            return;

        console.log("显示reward,开始解锁" + key);
        
        this.showRewardAdsByItem(this.mapRewardItems.get(key));
    }
    //显示广告
    public showRewardAdsByItem(item:RewardInfoItem){

        // AdsManagerHall.getInstance().initLisenter();

        let self = this;
        //检查网络，系统功能，稍后实现JSB绑定
        if(!jsToCPP.getInstance().checkNetworkAvailable()){

            jsToCPP.getInstance().popAlertDialog("there is problem with internet connection and try later");
            if(this.showRewardFalseCall)
            {
                this.showRewardFalseCall();
            }
            return;
        }

        if(cc.sys.isMobile)
            this.initLisenter();

        let result:boolean = AdsManagerHall.getInstance().showReward();
        //显示不成功，显示错误，此时显示全屏
        if(!result){
                AdsManagerHall.getInstance().preAdsByType(ADS_TYPE.kTypeRewardedAds);
                let result = this.showRewardFailedHandleAndroid();
                if(!result)
                    return;
                console.log(item);
                    
                self._waitingUnLockItemInfo = item; 
                //显示全屏和cross的时候，直接解锁
                this.unLockedByItem(self._waitingUnLockItemInfo);
                // if(this.removeRewardLoadingCall)
                // {
                //     this.removeRewardLoadingCall(self._waitingUnLockItemInfo.getKey());
                // }
        }else{
            this.s_showFullAds = false;
            self._waitingUnLockItemInfo = item;
            if(this.showRewardLoadingCall)
            {
                this.showRewardLoadingCall();
            }
            
        }
        
        cc.log("要解锁的key",self._waitingUnLockItemInfo.getKey());    
        cc.log("=========onAdsCollapsed %d 1111=========",this.s_showFullAds);

        //registerAdsEvents();
    }
    
    //解锁
    public unLocked(key:string){
        // if(!this.mapRewardItems.has(key))
        //     return ;

        //解锁，传0 
        //对boolean没有支持 用0代表false 1代表true
        cc.sys.localStorage.setItem(key, 0);
        //debug
        //发出消息  消息者模式
        console.log("解锁成功" + key);
    }

    private unLockedByItem(item:RewardInfoItem){
        console.log("解锁" + item.getKey());
        
        this.unLocked(item.getKey());
    }

    //reward广告加载失败时，显示全屏
    private showRewardFailedHandleAndroid():boolean{

        let type = ADS_TYPE.kTypeInterstitialAds;
        if(this.showCrossCount >= 2){
            this.showCrossCount = 0;
            type = ADS_TYPE.kTypeCrosspromoAds;
        }
        this.showCrossCount++;
        let result:boolean ;
        if(type == ADS_TYPE.kTypeInterstitialAds)
            result = AdsManagerHall.getInstance().showInterstitial();
        else
            result = AdsManagerHall.getInstance().showCross();
        
        //系统检测网络
        // STSystemFunction cfy;
        if(!result)
        {
            jsToCPP.getInstance().popAlertDialog("there is problem with internet connection and try later");
            if(this.showRewardFalseCall)
            {
                this.showRewardFalseCall();
            }
        }
        return result;
    }
    unLisenter(){
        AdsManagerHall.getInstance().onAdsLoaded = null;
        AdsManagerHall.getInstance().onAdsClicked = null;
        AdsManagerHall.getInstance().onAdsExpanded = null;
        AdsManagerHall.getInstance().onAdsCollapsed = null;
        AdsManagerHall.getInstance().onAdsLoadFailed = null;
        AdsManagerHall.getInstance().onAdsRewarded = null;
        
    }
    //广告监听
    public initLisenter(){
        console.log(" RewardManagerHall initLisenter");
        let self = this;
        AdsManagerHall.getInstance().initLisenter();
        AdsManagerHall.getInstance().onAdsLoaded = function(type : ADS_TYPE){
            
        }

        AdsManagerHall.getInstance().onAdsClicked = function(type : ADS_TYPE){

            
        }
        AdsManagerHall.getInstance().onAdsExpanded = function(type : ADS_TYPE){
            console.log(" RewardManagerHall====>广告====>ID值" + type);
           
        }
        
        AdsManagerHall.getInstance().onAdsCollapsed = function(type : ADS_TYPE){
            console.log(" RewardManagerHall====>onAdsCollapsed====>ID值" + type);
            self.unLisenter()
            console.log(" RewardManagerHall====>self.unLisenter()");
            if(self.removeRewardLoadingCall)
            {
                self.removeRewardLoadingCall(self._waitingUnLockItemInfo.getKey());
            }
        }
        AdsManagerHall.getInstance().onAdsLoadFailed = function(error : string, type : ADS_TYPE){
            console.log(" RewardManagerHall====>onAdsLoadFailed====>ID值" + type);
            self.unLisenter()
            console.log(" RewardManagerHall====>self.unLisenter()");
            if (type == ADS_TYPE.kTypeInterstitialAds)
            {
                if(self.removeRewardLoadingCall)
                {
                    self.removeRewardLoadingCall(self._waitingUnLockItemInfo.getKey());
                }
                return;
            }
        }
        AdsManagerHall.getInstance().onAdsRewarded = function(error : string, num:number, isSkip : boolean){
            //unRegisterAdsEvents();
            console.log(" RewardManagerHall====>self.unLisenter()");
            self.unLisenter()
            console.log(" RewardManagerHall====>onAdsRewarded-------" + self._waitingUnLockItemInfo.getKey());
            if(isSkip)
            {
                if(self.removeRewardLoadingCall)
                {
                    self.removeRewardLoadingCall(self._waitingUnLockItemInfo.getKey());
                }
                return;
            }else {
                self.unLockedByItem(self._waitingUnLockItemInfo);
                if(self.removeRewardLoadingCall)
                {
                    self.removeRewardLoadingCall(self._waitingUnLockItemInfo.getKey());
                }
            }
                    
        }
    }

}
export class RewardInfoItem {
    constructor(aIapId:string, aModuleName:string, aKeyInModule:string, aIndex : number) {
        this.iapId =  aIapId;
        this.moduleName =  aModuleName;
        this.keyInModule =  aKeyInModule;
        this.index =  aIndex;
        
    }

    getKey():string
    {
        return this.moduleName + this.keyInModule + this.index;
    }
    
    isNull():boolean
    {
        return this.index == 999;
    }

     //所归属的iap项(该iap购买后，reward锁也解了)
     iapId:string;
     //模块名称+类别名称+index，用作需要解锁物品的key
     //模块名称
     moduleName:string;
     //类别名称。。
     keyInModule:string;
     index : number = 999;
}