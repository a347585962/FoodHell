import GameData from "./GameData";
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
//网络工具类
@ccclass
export default class HttpUtils {

    private static _instance: any;
    public static getInstance(): HttpUtils {
        if (HttpUtils._instance == null)
            HttpUtils._instance = new HttpUtils();
        return HttpUtils._instance;
    }
    // http://apis.juhe.cn/mobile/get?phone=18202822779&key=eccc7eaffd998b2430c96da7a51c5c06

    // update (dt) {}
    httpGet(url, callback){
        var xhr = cc.loader.getXMLHttpRequest();
        console.log("url->" + url);
        
        xhr.onreadystatechange = function () {
            console.log("xhrxhrxhrxhrxhr");
            console.log(xhr.readyState);
            console.log(xhr.status);
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                var respone = xhr.responseText;
                callback(respone);
            }else{
                callback(null);
            }
        };
        xhr.open("GET", url, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            
        }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000;// 5 seconds for timeout

        xhr.send();

    };

    getJsonData(){
        // let url =  "http://youngcnfoodhall.top/UnicornCake/game.json";  

        let url = HallDataConfig.getInstance().getGameJsonUrl();
        console.log("url->" + url);
        HttpUtils.getInstance().httpGet(url, function (resonpose) {
            //获取失败的话 从本地加载json
            if(!resonpose){
                
            }else{
                console.log("网络json");
                try {
                    GameData.getInstance().clearData();
                    let jsonobj = JSON.parse(resonpose);
                    for(var i = 0; i < jsonobj.length; i++){
                        GameData.getInstance().initData(jsonobj[i]);
                    }
                    console.log(JSON.stringify(jsonobj));
                    
                } catch (error) {
                    
                }

            }
            
        });
    }

}
