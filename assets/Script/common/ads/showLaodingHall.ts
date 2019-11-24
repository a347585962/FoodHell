import AdsManagerHall, { ADS_TYPE } from "./AdsManagerHall";

// import AdsManagerHall, { ADS_TYPE } from "./AdsManagerHall";

export default class showLaodingHall {
    private static _instance: any;
    public static getInstance(): showLaodingHall {
        if (showLaodingHall._instance == null)
            showLaodingHall._instance = new showLaodingHall();
        return showLaodingHall._instance;
    }
    constructor(){
        if(cc.sys.isMobile){
            this.initAdsCall()
            AdsManagerHall.getInstance().initLisenter();
        }
        
    }
    //加载时间
    _loadingMinTime = 2;
    _loadingMaxTime = 5;

    _adLoadType : ADS_TYPE = ADS_TYPE.kTypeInterstitialAds;

    //广告是否在显示
    _adShowing:boolean = false;
    
    _isRequestingLoadAd :boolean= false;
    
    _bLoadingCanRemove:boolean = false;    
    
    //广告加载完成与否(失败成功回调都算完成)
    _adLoadDone :boolean= false;
    isAdsShowed:boolean;
    needShowInterstitialAds:boolean;

    scheduTime : number;

    _timeEnter:Date;

    initAdsCall(){
        let self = this;
        AdsManagerHall.getInstance().onAdsLoaded = function(type : ADS_TYPE){
            console.log(" showLaodingHall====>广告====>ID值" + type);
            if (!self._isRequestingLoadAd)
                return;
            if(self._adLoadType == type)
            {
                if(type == ADS_TYPE.kTypeInterstitialAds)
                    AdsManagerHall.getInstance().showInterstitial();
                else
                    AdsManagerHall.getInstance().showCross();
            }
        }

        AdsManagerHall.getInstance().onAdsClicked = function(type : ADS_TYPE){

            
        }
        AdsManagerHall.getInstance().onAdsExpanded = function(type : ADS_TYPE){
            console.log(" showLaodingHall====>广告====>ID值" + type);
            if(self._adLoadType == type)
            {
                self.isAdsShowed = true;
                self._adLoadDone = true;
                self._adShowing  = true;
            }
            
        }
        
        AdsManagerHall.getInstance().onAdsCollapsed = function(type : ADS_TYPE){
            //广告关闭
            console.log(" showLaodingHall====>广告====>ID值" + type);
            console.log(type);
            
            if(self._adLoadType == type)
            {
                if(self._bLoadingCanRemove)
                {
                    self._taskDone();
                    return;
                }
                self._adShowing = false;
            }
            self._timeCheckSchedule(0);    
        }
        AdsManagerHall.getInstance().onAdsLoadFailed = function(error : string, type : ADS_TYPE){

            if(self._adLoadType == type){
                self._adLoadDone = true;
            }
            
        }
    };

    showAds(isCross : boolean):void{
        
        var CanvasNode = cc.find( 'Canvas' );
        var newMyPrefab = new cc.Node();
            
        console.log("add prefab1111");
        

        CanvasNode.addChild( newMyPrefab );
        newMyPrefab.name = "newMyPrefab";
        newMyPrefab.setPosition( 0, 0 );
        newMyPrefab.zIndex = 100;
        // var newMyPrefabScript = newMyPrefab.getComponent( 'showTips' );
        // if(cc.sys.isMobile) {

        //     self.initAdsCall();
        // }
        // this.initAdsCall();

        // newMyPrefabScript.setLabelString(str );
        AdsManagerHall.getInstance().initLisenter();
        this.loadAd(isCross);
        this._timeEnter = new Date();

        // var CanvasNode = cc.find( 'Canvas' );
        // if( !CanvasNode ) { cc.log( 'find Canvas error' ); return; } 
        // let self = this; 
        // var onResourceLoaded = function(errorMessage, loadedResource)
        // {
        //     if(cc.sys.isMobile){
        //         if( errorMessage ) { cc.log( 'Prefab error11:' + errorMessage ); return; }
        //     }
        //     if( !( loadedResource instanceof cc.Prefab ) ) { cc.log( 'Prefab error22' ); return; } 
            
           

        // };

        // let path = 'loading/Ads';
        // if(cc.sys.platform == cc.sys.ANDROID){
        //     path = 'loading/Ads';
        // }else{
        //     path = 'loading/android';
        // }
        
        // cc.loader.loadRes(path, onResourceLoaded);
    }

    //加载广告
    loadAd(abIscross : boolean = false){

        this._isRequestingLoadAd = false;
        this._adShowing = false;
        this._bLoadingCanRemove = false;
        this._adLoadDone = false;
    
        //判断是否已经加载
        // if(!_running)
        //     return;
        if(abIscross)
            this._adLoadType = ADS_TYPE.kTypeCrosspromoAds;
        else
            this._adLoadType = ADS_TYPE.kTypeInterstitialAds;

        //找到根节点
        var CanvasNode = cc.find( 'Canvas' );
        let self = this;
        var seq = cc.sequence(cc.delayTime(1.5),cc.callFunc(function(){

            self.isAdsShowed = false;
            if(cc.sys.isMobile) {
                if(self._adLoadType == ADS_TYPE.kTypeInterstitialAds)
                    AdsManagerHall.getInstance().showInterstitial();
                else
                    AdsManagerHall.getInstance().showCross();                
            }
            
            //不停的监听
            self.scheduTime = setInterval(function(){

                self._timeCheckSchedule(0);
            }, 5);
        }));
        CanvasNode.runAction(seq);
    };
    //定时器
    _timeCheckSchedule(dt : number){
        var nowTime = new Date();
        var span = nowTime.getTime() - this._timeEnter.getTime();
        var leave1 = span % (24 * 3600 * 1000);
        var leave2 = leave1 % (3600 * 1000);
        var level3 = leave2 % (60 * 1000);
        var seconds = Math.round(level3 / 1000);

        if ( ((seconds >= this._loadingMinTime) && this._adLoadDone))
        {
            this._adLoadInTime();
        }
        else if (seconds >=this._loadingMaxTime)
        {
            if(this._adLoadType == ADS_TYPE.kTypeCrosspromoAds && !this.isAdsShowed){
                this._isRequestingLoadAd = false;
                this._adLoadType = ADS_TYPE.kTypeInterstitialAds;
                if(cc.sys.isMobile) {
                    AdsManagerHall.getInstance().showInterstitial();
                }
                
            }else
                this._adLoadTimeOut();
            
        }

    }
    
    //广告按时加载出来
    _adLoadInTime(){
        //广告已关闭或加载失败
        if(!this._adShowing)
        {
            this._taskDone();
        }
        //广告正在显示
        else
        {
            this._bLoadingCanRemove = true;
        }

    };
    
    //广告超时还未加载出来
    _adLoadTimeOut(){
        
        //广告已关闭或加载失败
        if(!this._adShowing)
        {
            this._taskDone();
        }
        //广告正在显示
        else
        {
            this._bLoadingCanRemove = true;
        }

    };

    //本界面任务完成
    _taskDone(){

        //结束定时器
        clearInterval(this.scheduTime);

        //移除
        var CanvasNode = cc.find('Canvas');
        if(CanvasNode.getChildByName('newMyPrefab'))
            CanvasNode.getChildByName('newMyPrefab').removeFromParent();

        if(this.loadingDoneCallback)
            this.loadingDoneCallback(); 

        
        console.log("hide ads");
        
    };

    //回调函数
    public loadingDoneCallback : () => void; 
}
