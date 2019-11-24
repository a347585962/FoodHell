
const {ccclass, property} = cc._decorator;
//方向
const ShowDirection = cc.Enum({
    left: 1,
    right: 2,
    top: 3,
    bottom : 4 ,
});
const ActionType = cc.Enum({
    Bezier: 1,
    JumpTo: 2,
    EaseElastic: 3,
    Rote : 4 ,
});
@ccclass
export default class MoveIn extends cc.Component {

    //node 进入的动画脚本
    //动画前间隔的时间
    @property
    delayTime: number = 0.0;

    //进入的方向
    @property({
        type : ShowDirection
    })
    direction = ShowDirection.left;

    //进入的方向
    @property({
        type : ActionType
    })
    action = ActionType.Bezier;
    //进入的声音资源
    @property(cc.AudioClip)
    private scoreAudio: cc.AudioClip = null;

    //是否自动执行
    @property()
    private isLoad: boolean = true;

    //动画执行完成的回调
    public actionCallBack : () => void;

    getScreenPos(_node:cc.Node,_dir:number):cc.Vec2{
        let _mainC = cc.Camera.findCamera(_node);
        let _size = cc.view.getDesignResolutionSize();
        let topLeft =  new cc.Vec2(0,_size.height);
        let bottomRight = new cc.Vec2(_size.width,0);
        let curentPosition = _node.position;
        let pos = _node.position;
        if(_node.parent != null){
            curentPosition = _node.parent.convertToWorldSpaceAR(curentPosition);
        }
        if(_mainC != null){
            topLeft = _mainC.getCameraToWorldPoint(topLeft,new cc.Vec2());
            bottomRight = _mainC.getCameraToWorldPoint(bottomRight,new cc.Vec2());
        }
      
        let endPosiont:cc.Vec2;
        switch (_dir) {
            case  ShowDirection.bottom:
                endPosiont = new cc.Vec2(curentPosition.x,bottomRight.y- _node.getContentSize().height*(1-_node.getAnchorPoint().y));
                break;
            case  ShowDirection.left:
                endPosiont = new cc.Vec2(topLeft.x -_node.getContentSize().width*(1-_node.getAnchorPoint().x), curentPosition.y);
                break;
            case  ShowDirection.right:
                endPosiont =  new cc.Vec2(bottomRight.x+_node.getContentSize().width*_node.getAnchorPoint().x, curentPosition.y);
                break;
            case  ShowDirection.top:
                endPosiont =  new cc.Vec2(curentPosition.x, topLeft.y +_node.getContentSize().width*(_node.getAnchorPoint().y));
                break;
        }

        if(_node.parent != null){
            endPosiont = _node.parent.convertToNodeSpaceAR(endPosiont);
        }
        return endPosiont;
        
    }

    onLoad () {
        if(!this.isLoad)
            this.doShowAction();

    }

    public doShowAction(){
        // console.log("doShowAction" + this.node.name);
        
        let endPosiont = this.node.position;
        let statPos:cc.Vec2 = this.getScreenPos(this.node, this.direction);
        this.node.setPosition(statPos);
        this.node.opacity = 255;
        let time = 1.0;
        let action;
        switch (this.action) {
            case  ActionType.Bezier:
                action = cc.bezierTo(time, [cc.v2(endPosiont.x*.5,endPosiont.y+150), cc.v2(endPosiont.x*.5,endPosiont.y+150), cc.v2(endPosiont.x, endPosiont.y)]);
                break;
            case  ActionType.EaseElastic:
                action = cc.moveTo(time, endPosiont).easing(cc.easeElasticOut(2.0));
                break;
            case  ActionType.JumpTo:
                action = cc.jumpTo(time, endPosiont, 200, 1);
                break;
            case  ActionType.Rote:
                {
                    var rotate = -10;
                    if(this.direction == ShowDirection.left)
                        rotate = 10;
                    
                    action = cc.spawn(cc.moveTo(time, endPosiont).easing(cc.easeBackOut()), cc.rotateBy(time * 0.58, rotate), cc.rotateBy(time*0.58, -rotate).easing(cc.easeBackInOut()));
                }
                break;
            default:
                action = cc.moveTo(time, endPosiont).easing(cc.easeElasticOut(2.0));
        }
        var finished = null;
        var self = this;
        //if(this.actionCallBack)
        finished = cc.callFunc(function () {
            
            if(self.actionCallBack)
                self.actionCallBack();

        }, this);

        
        var detalTimeTemp = cc.delayTime(this.delayTime);
        let sq = cc.sequence(detalTimeTemp, cc.callFunc(function () {
            // console.log("播放音效");
            
            if(self.scoreAudio)
                cc.audioEngine.play(self.scoreAudio, false, 1); 
        }),action, finished);
        this.node.runAction(sq);
    };

    start () {
        if(this.isLoad)
            this.doShowAction();

        console.log("movein start");
        
        // this.doShowAction();
        // this.doShowAction();
        // this.node.active = true;
    }
    // update (dt) {}
}
