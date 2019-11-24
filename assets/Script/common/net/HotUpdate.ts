export default class HotUpdate extends cc.EventTarget {
  private manifestUrl = null
  private stroagePath = ""
  private am = null
  private updateListener = null
  private updating = false
  private canRetry = false

  private static _instance = null
  public static get instance() {
    if (!cc.sys.isNative && !CC_EDITOR) {
      throw new Error("Native only")
    }
    if (HotUpdate._instance == null) {
      HotUpdate._instance = new HotUpdate()
    }
    return HotUpdate._instance
  }

  public static EventType = cc.sys.isNative && {
    [jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST]: "ERROR_NO_LOCAL_MANIFEST", //本地没有manifest文件
    [jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST]: "ERROR_DOWNLOAD_MANIFEST", //下载manifest失败
    [jsb.EventAssetsManager.ERROR_PARSE_MANIFEST]: "ERROR_PARSE_MANIFEST", //解析manifest失败
    [jsb.EventAssetsManager.ALREADY_UP_TO_DATE]: "ALREADY_UP_TO_DATE",
    [jsb.EventAssetsManager.NEW_VERSION_FOUND]: "NEW_VERSION_FOUND",
    [jsb.EventAssetsManager.UPDATE_PROGRESSION]: "UPDATE_PROGRESSION",
    [jsb.EventAssetsManager.UPDATE_FINISHED]: "UPDATE_FINISHED",
    [jsb.EventAssetsManager.UPDATE_FAILED]: "UPDATE_FAILED",
    [jsb.EventAssetsManager.UPDATE_NEEDRESTART]: "UPDATE_NEEDRESTART",
    [jsb.EventAssetsManager.ERROR_UPDATING]: "ERROR_UPDATING",
    [jsb.EventAssetsManager.ERROR_DECOMPRESS]: "ERROR_DECOMPRESS",
  }

  /**
   *
   * @param {string} manifestUrl
   * @param {string} storagePath
   * @returns void
   * @memberof HotUpdate
   */
  public init(manifestUrl, storagePath) {
    if (HotUpdate.instance == null) {
      throw new Error("not instance")
    } else {
      this._initAssetsManager(manifestUrl, storagePath)
    }
  }

  private _initAssetsManager(manifestUrl, storagePath) {
    this.stroagePath = storagePath
    this.manifestUrl = manifestUrl
    this.am = new jsb.AssetsManager(this.manifestUrl, storagePath, this._versionCompareHandle)

    this.am.setVerifyCallback(this._verifyCallback)
    if (cc.sys.os == cc.sys.OS_ANDROID) {
      this.am.setMaxConcurrentTask(3)
    }
  }

  private _verifyCallback(path, asset) {
    let compressed = asset.compressed
    let expectedMD5 = asset.md5
    let relativePath = asset.path
    let size = asset.size
    if (compressed) {
      return true
    } else {
      return true
    }
  }

  private _versionCompareHandle(versionA, versionB) {
    let vA = versionA.split(".")
    let vB = versionB.split(".")
    for (let i = 0; i < vA.length; ++i) {
      let a = parseInt(vA[i])
      let b = parseInt(vB[i] || 0)
      if (a == b) {
        continue
      } else {
        return a - b
      }
    }
    return vB.length > vA.length ? -1 : 0
  }

  public checkUpdate() {
    console.log("1111");
    
    if (this.updating) {
      throw new Error("Checking or updating ...");
    }
    if (this.am.getState() == jsb.AssetsManager.State.UNINITED) {
      var url = this.manifestUrl.nativeUrl
      if (cc.loader.md5Pipe) {
        url = cc.loader.md5Pipe.transformURL(url)
      }
      this.am.loadLocalManifest(url)
    }
    if (!this.am.getLocalManifest() || !this.am.getLocalManifest().isLoaded()) {
      throw new Error("Failed to load local manifest ...")
    }
    console.log("2222");
    this.am.setEventCallback(this._checkCb.bind(this))
    this.am.checkUpdate()
    this.updating = true
  }

  private _checkCb(event) {
    let totalBytes = 0,
      code = event.getEventCode(),
      route = HotUpdate.EventType[code]
    let msg = ""
    switch (code) {
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        console.log("jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST");
        
        break
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
        msg = event.getMessage()
        break
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
        console.log("jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST");
        break
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
        console.log("jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST");
        break
      case jsb.EventAssetsManager.NEW_VERSION_FOUND:
        totalBytes = event.getTotalBytes()
        break
      default:
        return
    }

    this.am.setEventCallback(null)
    this.updating = false
    route && this.emit(route, { totalBytes, msg })
  }

  public execUpdate() {
    if (this.am && !this.updating) {
      this.am.setEventCallback(this._updateCb.bind(this))

      if (this.am.getState() == jsb.AssetsManager.State.UNINITED) {
        let url = this.manifestUrl.nativeUrl
        if (cc.loader.md5Pipe) {
          url = cc.loader.md5Pipe.transformURL(url)
        }
        this.am.loadLocalManifest(url)
      }
      this.am.update()
      this.updating = true
    }
  }

  private _updateCb(event) {
    let needRestart = false
    let failed = false
    let code = event.getEventCode()
    let msg = event.getMessage()
    let route = HotUpdate.EventType[code]
    let data = { progress: null, msg }
    switch (code) {
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        failed = true
        break
      case jsb.EventAssetsManager.UPDATE_PROGRESSION:
        const progress = {
          percent: Number.isNaN(event.getPercent()) ? 0 : event.getPercent(),
          filePercent: event.getPercentByFile(),
          downloadedFiles: event.getDownloadedFiles(),
          totalFiles: event.getTotalFiles(),
          downloadedBytes: event.getDownloadedBytes(),
          totalBytes: event.getTotalBytes(),
        }
        data.progress = progress
        this.emit("UPDATE_PROGRESSION", data)
        break
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
        break

      case jsb.EventAssetsManager.UPDATE_FINISHED:
        needRestart = true
        break
      case jsb.EventAssetsManager.UPDATE_FAILED:
        this.updating = false
        this.canRetry = true
        break
      case jsb.EventAssetsManager.ERROR_UPDATING:
        cc.error("asset", event.getAssetId(), msg)
        break
      case jsb.EventAssetsManager.ERROR_DECOMPRESS:
        break
      default:
        break
    }
    route && this.emit(route, data)
    if (failed) {
      this.am.setEventCallback(null)
      this.updateListener = null
      this.updating = false
    }
    if (needRestart) {
      this.am.setEventCallback(null)
      this.updateListener = null
      const searchPaths = jsb.fileUtils.getSearchPaths()
      const newPaths = this.am.getLocalManifest().getSearchPaths()
      Array.prototype.unshift.apply(searchPaths, newPaths)
      cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths))
      jsb.fileUtils.setSearchPaths(searchPaths)
      this.emit("UPDATE_FINISHED", data)
      // cc.audioEngine.stopAll()
      // cc.game.restart()
    }
  }

  public retry() {
    if (!this.updating && this.canRetry) {
      this.canRetry = false
      this.am.downloadFailedAssets()
    }
  }

  /**
   *清除缓存
   *
   * @memberof HotUpdate
   */
  public clearCache() {
    let storagePath = this.stroagePath
    if (storagePath) {
      if (jsb.fileUtils.isDirectoryExist(storagePath)) {
        jsb.fileUtils.removeDirectory(storagePath)
      } else {
        let e = `path:-->${storagePath}not exist`
        throw new Error(e)
      }
    } else {
      throw new Error("storagePath not exist")
    }
  }

  public destroy() {
    if (this.updateListener) {
      this.am.setEventCallback(null)
      this.updateListener = null
    }
  }
}
