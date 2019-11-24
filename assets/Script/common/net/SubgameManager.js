// var window.platformInstance = require("../Script/window.platformInstance");
// import window.platformInstance = require("../Script/window.platformInstance");



const SubgameManager = {
    _storagePath: [],
    
    _getfiles: function(name, type, downloadCallback, finishCallback) {
        //this._storagePath[name] = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'UnicornCake/' + name);
        this._storagePath[name] = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + window.platformInstance.getLocalAppName() + name);
        
        this._downloadCallback = downloadCallback;
        this._finishCallback = finishCallback;
        this._fileName = name;
        // http://47.88.54.178/UnicornFoodHall/gamedata.json
                            // https://unicornfoodhall.oss-us-west-1.aliyuncs.com/popcorn/version.manifest
        //国外
        //var UIRLFILE = "https://unicornfoodhall.oss-us-west-1.aliyuncs.com/" + name ;
        //国内
        // var UIRLFILE = "https://unnicornfallcn.oss-cn-chengdu.aliyuncs.com/" + name ;
        //服务器
        // var UIRLFILE = "http://47.88.54.178/UnicornFoodHall/" + name ;    

        //cdn加速域名
        // var UIRLFILE = "http://youngtesthall.top/" + name ;    


        //CDN域名
        // var UIRLFILE = "http://youngcnfoodhall.top/UnicornCake/" + name ;  
        
        //test
        // var UIRLFILE = "http://192.168.0.131:8000/UnicornCake/" + name ;  

        //iOS版本 cocos 2.2.0
        //var UIRLFILE = "http://youngcnfoodhall.top/UnicornCakeIos/" + name ; 

        //
        var UIRLFILE =  window.platformInstance.getDownUrl() + name ; 

        this.check_before(name);

        var filees = this._storagePath[name] + '/project.manifest';
        this.manifestUrl = filees;
        var customManifestStr = JSON.stringify({
            'packageUrl': UIRLFILE,
            'remoteManifestUrl': UIRLFILE + '/project.manifest',
            'remoteVersionUrl': UIRLFILE + '/version.manifest',
            'version': '0.8',
            'assets': {},
            'searchPaths': []
        });

        var versionCompareHandle = function(versionA, versionB) {

            console.log("vA--->" + JSON.stringify(vA));
            console.log("vB--->" + JSON.stringify(vA));

            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                } else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            } else {
                return 0;
            }
        };
        this._am = new jsb.AssetsManager('', this._storagePath[name], versionCompareHandle);

        this._am.setVerifyCallback(function(path, asset) {
            var compressed = asset.compressed;
            if (compressed) {
                return true;
            } else {
                return true;
            }
        });


        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }

        /***********这个函数已经弃用，坑**************/
        // this._am.setEventCallback(this.checkCb.bind(this));
        /***********这个函数已经弃用，坑**************/
        if (type === 1) {
            this._am.setEventCallback(this._updateCb.bind(this));
            
        } else if (type == 2) {
             this._am.setEventCallback(this._checkCb.bind(this));
            
        } else {
             this._am.setEventCallback(this._needUpdate.bind(this));
            
        }

        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            // var manifest = new jsb.Manifest(customManifestStr, this._storagePath[name]);
            // this._am.loadLocalManifest(manifest, this._storagePath[name]);
            console.log(customManifestStr);
            
            if (jsb.fileUtils.isFileExist(filees)) {
                console.log('加载本地Manifest');
                this._am.loadLocalManifest(this.manifestUrl);
            } else {
                console.log('加载网络Manifest');
                let manifest = new jsb.Manifest(customManifestStr, this._storagePath);
                this._am.loadLocalManifest(manifest, this._storagePath);
            }
            
        }
        console.log("----------");
        //jsb.fileUtils
        console.log(JSON.stringify(this.manifestUrl));
        
        console.log(JSON.stringify(this._am.getLocalManifest()));
        cc.loader.loadRes(this.manifestUrl, function (err, object) {
            if (err) {
                cc.log("解析json文件失败" + err);
                return;
            }
            console.log(JSON.stringify(object));
            
        });
        var searchPaths = jsb.fileUtils.getSearchPaths();
        console.log(JSON.stringify(searchPaths));
        console.log("----------");

        if (type === 1) {
            this._am.update();
            this._failCount = 0;
        } else {
            this._am.checkUpdate();
        }
        this._updating = true;
        console.log('更新文件:' + filees);
    },
    //更新前检测旧版本目录 和 本地缓存目录是否存在未完成的更新
    check_before(name){
        let path = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + window.platformInstance.getLocalAppName() + name;
        let file = path + '/project.manifest.temp'
        if(jsb.fileUtils.isFileExist(file)){
            let str = jsb.fileUtils.getStringFromFile(file)
            if(str == '')
                str = '{}'
            let mod = JSON.parse(str).module
            if(mod != this.file_module)
                console.log('remove temp file:'+jsb.fileUtils.removeFile(file))
        }
    },
    // type = 1
    _updateCb: function(event) {
        var failed = false;
        let self = this;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                /*0 本地没有配置文件*/
                console.log('updateCb本地没有配置文件');
                //this._label.string = 'updateCb本地没有配置文件';
                failed = true;
                break;

            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                /*1下载配置文件错误*/
                console.log('updateCb下载配置文件错误');
                //this._label.string = 'updateCb下载配置文件错误';
                failed = true;
                break;

            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                /*2 解析文件错误*/
                console.log('updateCb解析文件错误');
                //this._label.string = 'updateCb解析文件错误';
                failed = true;
                break;

            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                /*3发现新的更新*/
                console.log('updateCb发现新的更新');
                //this._label.string = 'updateCb发现新的更新';
                break;

            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                /*4 已经是最新的*/
                console.log('updateCb已经是最新的');
                //this._label.string = 'updateCb已经是最新的';
                failed = true;
                break;

            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                /*5 最新进展 */
                // console.log(event.getPercentByFile());
                self._downloadCallback && self._downloadCallback(event.getPercent());
                break;


            case jsb.EventAssetsManager.ASSET_UPDATED:
                /*6需要更新*/
                break;

            case jsb.EventAssetsManager.ERROR_UPDATING:
                /*7更新错误*/
                console.log('updateCb更新错误');
                console.log("错误信息. " + event.getAssetId() + ', ' + event.getMessage() + ", " + event.getCURLMCode());
                    
                //this._label.string = 'updateCb更新错误:' + event.getAssetId() + ', ' + event.getMessage();
                break;

            case jsb.EventAssetsManager.UPDATE_FINISHED:
                /*8更新完成*/
                // Prepend the manifest's search path
                var searchPaths = jsb.fileUtils.getSearchPaths();
                var newPaths = this._am.getLocalManifest().getSearchPaths();
                Array.prototype.unshift(searchPaths, newPaths);
                // This value will be retrieved and appended to the default search path during game startup,
                // please refer to samples/js-tests/main.js for detailed usage.
                // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
                cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));

                jsb.fileUtils.setSearchPaths(searchPaths);

                self._finishCallback && self._finishCallback(true);
                break;

            case jsb.EventAssetsManager.UPDATE_FAILED:
                /*9更新失败*/
                self._failCount++;
                if (self._failCount <= 3) {
                    self._am.downloadFailedAssets();
                    console.log("Update failed. " + event.getAssetId() + ', ' + event.getMessage() + ", " + event.getCURLMCode());
                    
                    // for (const key in event) {
                    //     if (object.hasOwnProperty(key)) {
                    //         const element = object[key];
                    //         console.log(element);
                    //     }
                    // }

                    console.log(('updateCb更新失败' + this._failCount + ' 次'));
                    //this._label.string = 'updateCb更新失败' + this._failCount + ' 次';
                } else {
                    console.log(('updateCb失败次数过多'));
                    //this._label.string = 'updateCb失败次数过多';
                    self._failCount = 0;
                    failed = true;
                    self._updating = false;
                }
                break;

            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                /*10解压失败*/
                console.log('updateCb解压失败');
                //this._label.string = 'updateCb解压失败'
                break;
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener)
            self._updating = false;
            self._finishCallback && self._finishCallback(false);
        }
    },

    stopDown:function(){

        self._updating = false;
        //self._finishCallback && self._finishCallback(false);
        this._am.setEventCallback(null);
        
    },

    // type = 2
    _checkCb: function(event) {
        var failed = false;
        let self = this;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                /*0 本地没有配置文件*/
                console.log('checkCb本地没有配置文件');
                //this._label.string = 'checkCb本地没有配置文件'
                break;

            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                /*1下载配置文件错误*/
                console.log('checkCb下载配置文件错误');
                //this._label.string = 'checkCb下载配置文件错误';
                failed = true;
                break;

            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                /*2 解析文件错误*/
                console.log('checkCb解析文件错误');
                //this._label.string = 'checkCb解析文件错误';
                failed = true;
                break;

            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                /*3发现新的更新*/
                self._getfiles(self._fileName, 1, self._downloadCallback, self._finishCallback);
                break;

            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                /*4 已经是最新的*/
                console.log('checkCb已经是最新的');
                //this._label.string = 'checkCb已经是最新的';
                self._finishCallback && self._finishCallback(true);
                break;

            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                /*5 最新进展 */
                break;

            case jsb.EventAssetsManager.ASSET_UPDATED:
                /*6需要更新*/
                break;

            case jsb.EventAssetsManager.ERROR_UPDATING:
                /*7更新错误*/
                console.log('checkCb更新错误');
                //this._label.string = 'checkCb更新错误';
                failed = true;
                break;


            case jsb.EventAssetsManager.UPDATE_FINISHED:
                /*8更新完成*/
                console.log('checkCb更新完成');
                //this._label.string = 'checkCb更新完成';
                break;

            case jsb.EventAssetsManager.UPDATE_FAILED:
                /*9更新失败*/
                console.log('checkCb更新失败');
                //this._label.string = 'checkCb更新失败';
                failed = true;
                break;

            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                /*10解压失败*/
                console.log('checkCb解压失败');
                //this._label.string = 'checkCb解压失败'
                break;

        }
        this._updating = false;
        if (failed) {
            self._finishCallback && self._finishCallback(false);
        }
    },

    // type = 3
    _needUpdate: function(event) {
        let self = this;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log('子游戏已经是最新的，不需要更新');
                //this._label.string = '子游戏已经是最新的，不需要更新'
                self._finishCallback && self._finishCallback(false);
                break;

            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                console.log('子游戏需要更新');
                //this._label.string = '子游戏需要更新'
                self._finishCallback && self._finishCallback(true);
                break;

            // 检查是否更新出错
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
            case jsb.EventAssetsManager.ERROR_UPDATING:
            case jsb.EventAssetsManager.UPDATE_FAILED:
                self._downloadCallback();
                break;
        }
    },

    /**
     * 下载子游戏
     * @param {string} name - 游戏名
     * @param progress - 下载进度回调
     * @param finish - 完成回调
     * @note finish 返回true表示下载成功，false表示下载失败
     */
    downloadSubgame: function(name, progress, finish) {
        this._getfiles(name, 2, progress, finish);
    },

    /**
     * 进入子游戏
     * @param {string} name - 游戏名
     */
    enterSubgame: function(name) {
        if (!this._storagePath[name]) {
            this.downloadSubgame(name);
            return;
        }
        console.log("enterSubgame: require " + this._storagePath[name] + '/src/main.js');
        window.require(this._storagePath[name] + '/src/main.js');
    },

    /**
     * 判断子游戏是否已经下载
     * @param {string} name - 游戏名
     */
    isSubgameDownLoad: function (name) {
        let file = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + window.platformInstance.getLocalAppName() + name + '/project.manifest';
        console.log(file);
        
        if (jsb.fileUtils.isFileExist(file)) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * 判断子游戏是否需要更新
     * @param {string} name - 游戏名
     * @param isUpdateCallback - 是否需要更新回调
     * @param failCallback - 错误回调
     * @note isUpdateCallback 返回true表示需要更新，false表示不需要更新
     */
    needUpdateSubgame: function (name, isUpdateCallback, failCallback) {
        this._getfiles(name, 3, failCallback, isUpdateCallback);
    },
    setManifest(manifestUrl){
        this._manifestUrl = manifestUrl;
    },
    setLogLabel(label){
        this._label = label;
    }
};

module.exports = SubgameManager;