import HotUpdate from "./HotUpdate"

const { ccclass, property } = cc._decorator

@ccclass
export default class HotUdatePanel extends cc.Component {
  @property(cc.ProgressBar) pb: cc.ProgressBar = null
  @property({ type: cc.Asset }) private manifestUrl: cc.Asset = null

  @property({ type: cc.Node }) private popDialog: cc.Node = null

  @property({ type: cc.Label }) private label: cc.Label = null
  private storagePath = null
  private hotUpdate: HotUpdate = null

  private _init() {
    this.storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "FoodHell"
    this.hotUpdate = HotUpdate.instance
    this.hotUpdate.init(this.manifestUrl, this.storagePath)
    this._addUpdateListener()
  }

  private _addUpdateListener() {
    this.hotUpdate.on("NEW_VERSION_FOUND", this._onNewVersionFound, this)
    this.hotUpdate.on("ALREADY_UP_TO_DATE", this._onAlredyUpToDate, this)
    this.hotUpdate.on("UPDATE_PROGRESSION", this._updataProgression, this)
    this.hotUpdate.on("UPDATE_FAILED", this._onUpdateFailed, this)
    this.hotUpdate.on("ERROR_NO_LOCAL_MANIFEST", this._onAlredyUpToDate, this)
    this.hotUpdate.on("ERROR_DOWNLOAD_MANIFEST", this._onDownloadError, this)
    this.hotUpdate.on("ERROR_PARSE_MANIFEST", this._onUpdateFailed, this)
    this.hotUpdate.on("ERROR_DECOMPRESS", this._onUpdateFailed, this)
    this.hotUpdate.on("ERROR_UPDATING", this._onUpdateFailed, this)
    this.hotUpdate.on("UPDATE_FINISHED", this._hotUpdateOver, this)
  }

  private _removeUpdateListener() {
    this.hotUpdate.off("NEW_VERSION_FOUND", this._onNewVersionFound, this)
    this.hotUpdate.off("ALREADY_UP_TO_DATE", this._onAlredyUpToDate, this)
    this.hotUpdate.off("UPDATE_PROGRESSION", this._updataProgression, this)
    this.hotUpdate.off("UPDATE_FAILED", this._onUpdateFailed, this)
    this.hotUpdate.off("ERROR_NO_LOCAL_MANIFEST", this._onAlredyUpToDate, this)
    this.hotUpdate.off("ERROR_DOWNLOAD_MANIFEST", this._onDownloadError, this)
    this.hotUpdate.off("ERROR_PARSE_MANIFEST", this._onUpdateFailed, this)
    this.hotUpdate.off("ERROR_DECOMPRESS", this._onUpdateFailed, this)
    this.hotUpdate.off("ERROR_UPDATING", this._onUpdateFailed, this)
    this.hotUpdate.off("UPDATE_FINISHED", this._hotUpdateOver, this)
  }
  private _hotUpdateOver(){

        // cc.audioEngine.stopAll()
        // cc.game.restart()

    

  }
  private _onNewVersionFound() {
    this.node.active = true

    console.log("is new");
    
    this.popDialog.active = true;
    this.hotUpdate.execUpdate()
  }

  private _onAlredyUpToDate() {
    //@ts-ignore
    window.allreadyUpdate = true
  }

  private _updataProgression(data) {
    const progressData = data.progress
    if (progressData) {
      const { percent, filePercent, downloadedFiles, totalFiles, downloadedBytes, totalBytes } = progressData
      // cc.error("-----progressDataprogressDataprogressData-----", JSON.stringify(progressData))
      this.pb.progress = percent
      this.label.string = filePercent + " " + percent;
      console.log(downloadedBytes + " "  + totalFiles);
      
    }
  }

  private _onDownloadError(event?) {}

  private _onUpdateFailed() {
    this._retry(3)
  }

  private _retry(count: number) {
    if (count > 0) {
      this.hotUpdate.retry()
      return this._retry(count - 1)
    }
    this._onDownloadError()
  }

  onLoad() {
    //@ts-ignore
    if (!window.allreadyUpdate) {
      if (cc.sys.isNative) {
        this._init()
        this.hotUpdate.checkUpdate()
      } else {
        this._onAlredyUpToDate()
      }
    } else {
      this.node.active = false
    }
  }

  onDestroy() {
    if (cc.sys.isNative) {
      if (this.hotUpdate) {
        this._removeUpdateListener()
        this.hotUpdate.destroy()
      }
    }
  }
}
