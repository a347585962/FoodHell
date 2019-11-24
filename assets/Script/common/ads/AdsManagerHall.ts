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
//枚举广告类型
export enum ADS_TYPE{
    kTypeNativeAds = 1<<5,
    kTypeRectAds = 1<<4,
    kTypeBannerAds = 1<<3,
    kTypeInterstitialAds = 1<<2,
    kTypeCrosspromoAds = 1<<1,
    kTypeRewardedAds = 1<<0
};
//广告单例类
export default class AdsManagerHall {
    private static _instance: any;
    public static getInstance(): AdsManagerHall {
        if (AdsManagerHall._instance == null)
            AdsManagerHall._instance = new AdsManagerHall();
        return AdsManagerHall._instance;
    }
    constructor(){
        if (CC_JSB && !CC_PREVIEW){
            this.initLisenter()
        }
        
    }
    //注册回调监听函数
    public initLisenter(){
        let self = this;
        var cppObj = jsToCPP.getInstance();
        cppObj.initOnAdsLoaded(function(type : ADS_TYPE){
            console.log(" 广告加载====>ID值" + type);
            console.log(this.onAdsLoaded);
            
            if(this.onAdsLoaded)
                this.onAdsLoaded(type);
            
        }.bind(this));
        cppObj.initOnAdsClicked(function(type : ADS_TYPE){

            console.log(" 广告点击====>ID值" + type);
            if(this.onAdsClicked)
                this.onAdsClicked(type);
            
        }.bind(this));
        cppObj.initOnAdsExpanded(function(type : ADS_TYPE){

            console.log(" 广告====>ID值" + type);
            if(this.onAdsExpanded)
                this.onAdsExpanded(type);
            
        }.bind(this));
        cppObj.initOnAdsCollapsed(function (type : ADS_TYPE) {
            console.log(" 广告关闭====>ID值" + type);
            if(this.onAdsCollapsed)
                this.onAdsCollapsed(type);
        }.bind(this));
        cppObj.initOnAdsLoadFailed(function (name : string,type : ADS_TYPE) {
            console.log(" 广告加载失败====>ID值" + type + "名称" + name);
            if(this.onAdsLoadFailed)
                this.onAdsLoadFailed(name, type);
        }.bind(this));
        cppObj.initOnAdsRewarded(function (name : string,type : ADS_TYPE,isSkipped : boolean) {
            console.log(" reward广告====>ID值" + type + "名称" + name + "是否成功" + isSkipped);
            if(this.onAdsRewarded)
                this.onAdsRewarded(name, type, isSkipped);
        }.bind(this));
    }

    //显示全屏广告
    public (){
        //console.log("showFull");
        jsToCPP.getInstance().showInterstitial();
    }

    //显示全屏广告
    public showInterstitial() : boolean{
        //console.log("showFull");
        return jsToCPP.getInstance().showInterstitial();
    }

    //显示Cross广告
    public showCross():boolean{
        return jsToCPP.getInstance().showCross();
    }

    //显示banner
    public showBanner(): void{
        jsToCPP.getInstance().showBanner();


    };
    //隐藏banner
    public hideBanner(): void{
        jsToCPP.getInstance().hideBanner();

    }
    //显示reward广告
    public showReward(): boolean{
        return jsToCPP.getInstance().showReward();
    }
    //预加载
    public preAllAds(){
        jsToCPP.getInstance().preLoadAllAds();
    }
    //预加载某个广告
    public preAdsByType(type: ADS_TYPE){
        jsToCPP.getInstance().preLoadAds(Number(type));
    }
    //预加载广告

    //广告加载
    public onAdsLoaded : (type: ADS_TYPE) => void;   
    //广告加载失败
    public onAdsLoadFailed : (error : string, type: ADS_TYPE) => void;
    //广告点击 
    public onAdsClicked : (type: ADS_TYPE) => void;
    //广告加载成功
    public onAdsExpanded : (type: ADS_TYPE) => void;  
    //广告关闭
    public onAdsCollapsed : (type: ADS_TYPE) => void;
    //reward广告的回调
    public onAdsRewarded : (error : string, num:number, isSkip : boolean) => void;


}