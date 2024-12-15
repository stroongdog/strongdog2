function CMessage(oParentContainer, iCurPlayer, szText){
    
    var _iStartX;
    var _iStartY;
    var _iEndY;
    
    var _oMessage;
    var _oParent;
    
    this._init = function(oParentContainer, iCurPlayer, szText){
        if(iCurPlayer === PAWN_WHITE){
            _iStartX = 0;
            _iStartY = -1510;
            _iEndY = 510;
        } else {
            _iStartX = 0;
            _iStartY = 1510;
            _iEndY = -510;
        }
        
        _oMessage = new createjs.Container();
        _oMessage.x = _iStartX;
        _oMessage.y = _iStartY;
        if(s_bMobile && iCurPlayer === PAWN_BLACK && !s_bMultiplayer){
            _oMessage.rotation = 180;
        }
        oParentContainer.addChild(_oMessage);
        
        var oSprite = s_oSpriteLibrary.getSprite('message');
        var oBg = createBitmap(oSprite);
        oBg.regX = oSprite.width/2;
        oBg.regY = oSprite.height/2;
        
        var oText = new createjs.Text(szText," 40px "+PRIMARY_FONT, "#ffffff");
        oText.textAlign = "center";
        oText.textBaseline = "top";
        oText.lineWidth = 350;
        oText.regY = oText.getBounds().height/2;
        
        _oMessage.addChild(oBg, oText);
        
        createjs.Tween.get(_oMessage).to({y:_iEndY}, 1000, createjs.Ease.cubicOut);
        
    };
    
    this.unload = function(){
        oParentContainer.removeChild(_oMessage);
    };
    
    _oParent = this;
    this._init(oParentContainer, iCurPlayer, szText);
    
}