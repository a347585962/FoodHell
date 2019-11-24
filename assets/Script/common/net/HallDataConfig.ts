
const {ccclass, property} = cc._decorator;

//大厅数据单例

@ccclass
export default class HallDataConfig {
    private static _instance: any;
    public static getInstance(): HallDataConfig {
        if (HallDataConfig._instance == null){
            HallDataConfig._instance = new HallDataConfig();
            HallDataConfig._instance.init();
        }
        return HallDataConfig._instance;
    }
    private platformInstance: HallDataConfig;
    constructor(){
        this.getIsInChina();
        this.init();
    }
    private init(){
        console.log("初始化platformInstance");
        
        window['platformInstance'] = HallDataConfig._instance; 
    }

    /*************************一些需要修改的变量 */
    //服务器主文件名字
    private ossName = "UnicornCakeHotUP/";

    private ossNameChina = "UnicornCakeHotUPChina/"
    
    //服务器game.json
    private gameJson = "game.json";

    //服务器version.json
    private versionJson = "version.json";

    //本地存储主文件名字  一般与服务器保持一致即可
    // private localAppName = "UnicornCakeHotUP/";
    //注意这里需要修改和子包main.js文件一致
    private localAppName = "UnicornCakeHotUP/";   

    private isInChaia:boolean = false;

    //是否是测试环境  测试环境使用本地服务器
    private isDebug = false;
    /********************************************/
    
    //判断是否在国内
    getIsInChina(){

        let language = "don not know";
        let country = "don not know";
        if(cc.sys.os == cc.sys.OS_IOS){
            console.log("cc.sys.OS_IOS");
            
            language = jsb.reflection.callStaticMethod("AppController", "getLocaleLanguageCode");

            country = jsb.reflection.callStaticMethod("AppController", "getCountryCode");
            
        }

        console.log("现在的国家语言" + language);
        console.log("现在的国家" + country);
        let temp = String(country);
        console.log(temp.indexOf("zh"));
        
        let isInChinese = false;
        //是不是中国
        let isChinese = temp.indexOf("zh") != -1;
        console.log("是中国吗->" + isChinese);
        //是不是台湾
        let istw = temp.indexOf("TW") != -1;

        //是不是香港
        let isHK = temp.indexOf("HK") != -1;

        if(isChinese){
            if(istw || isHK){

                isInChinese = false;
                console.log("处于中国台湾或者香港");
                   
            }
            isInChinese = true;
        }

        this.isInChaia = isInChinese;
        // return temp.indexOf("zh") > 0;
    }

    //根据国内国外 选择域名body
    getUrlBody(){

        let urlBody = "";
        let tempOssName = this.ossName;

        //如果在国内
        if(this.isInChaia){

            urlBody = "https://unnicornfallcn.oss-cn-chengdu.aliyuncs.com/";

            this.ossName = this.ossNameChina;
        }else{

            //国外
            urlBody = "http://youngcnfoodhall.top/";



        }
        if(cc.sys.os == cc.sys.OS_ANDROID){

            this.ossName = tempOssName;
            //urlBody = "https://unnicornfallcn.oss-cn-chengdu.aliyuncs.com/";

        }

        //测试环境
        if(this.isDebug){

            urlBody = "http://192.168.0.131:8000/"
            this.ossName = tempOssName;
        }

        console.log("域名主体" + urlBody);
        console.log("服务器名称" + this.ossName);

        return urlBody;
        
    }


    //获取下载链接
    getDownUrl(){


        return this.getUrlBody() + this.ossName;

    }

    //获取游戏配置连接
    getGameJsonUrl(){

        return this.getDownUrl() + this.gameJson;
    }

    //获取游戏版本连接
    getVersionJsonUrl(){

        return this.getDownUrl() + this.versionJson;
    }

    //获取本地储存文件名字
    getLocalAppName(){

        return this.localAppName;
    }
    // update (dt) {}
}
// var _hallData:HallDataConfig = HallDataConfig.getInstance();
// window['_hallData'] = _hallData;