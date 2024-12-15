function CMsgBox(szMessage){
    var _aButtonList;
    
    var _oFade;
    var _oPanelContainer;
    var _oParent;
    var _oTitle;
    var _oButtonContainer;
    
    var _pStartPanelPos;
    
    this._init = function(szMessage){
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0.7;
        _oFade.on("mousedown",function(){});
        s_oStage.addChild(_oFade);
        
        //new createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oPanelContainer = new createjs.Container();        
        s_oStage.addChild(_oPanelContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        var oPanel = createBitmap(oSprite);        
        oPanel.regX = oSprite.width/2;
        oPanel.regY = oSprite.height/2;
        _oPanelContainer.addChild(oPanel);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT/2;
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};

        _oTitle = new createjs.Text(szMessage," 80px "+PRIMARY_FONT, "#ffffff");
        _oTitle.y = -50;
        _oTitle.textAlign = "center";
        _oTitle.textBaseline = "alphabetic";
        _oTitle.lineWidth = 600;
        _oPanelContainer.addChild(_oTitle);

        _oButtonContainer = new createjs.Container(); 
        _oButtonContainer.y = 250;
        _oPanelContainer.addChild(_oButtonContainer);
        
        _aButtonList = new Array();
        
    };
    
    this.unload = function () {
        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oFade.off("mousedown",function(){});
        
        for(var i=0; i<_aButtonList.length; i++){
            _aButtonList[i].unload();
        }
        
    };
    
    this.setMessage = function(szNewMsg){
        _oTitle.text = szNewMsg;
    };
    
    this.setExplMsg = function(szMessage){
        var oExpl = new createjs.Text(szMessage," 50px "+PRIMARY_FONT, "#ffffff");
        oExpl.y = -200;
        oExpl.textAlign = "center";
        oExpl.textBaseline = "alphabetic";
        oExpl.lineWidth = 600;
        _oPanelContainer.addChild(oExpl);
    };
    
    this.addButton = function(oSprite, iEvent, oCallBack, oOwner){
        _oTitle.y = -300;
        
        var iOffset = 150;
        
        var oBut = new CGfxButton(_aButtonList.length*(oSprite.width+iOffset), 0, oSprite, _oButtonContainer);
        oBut.addEventListener(iEvent, oCallBack, oOwner);
        
        _aButtonList.push(oBut);
        
        _oButtonContainer.regX = _oButtonContainer.getBounds().width/2 - oSprite.width/2;
        
    };
    
    this.show = function(){
        _oFade.visible = true;
        _oPanelContainer.visible = true;
    };
    
    this.reShow = function(){
        _oFade.visible = true;
        _oPanelContainer.visible = true;
    };
    
    this.hide = function(){
        _oFade.visible = false;
        _oPanelContainer.visible = false;
    };
    
    this.isVisible = function(){
        return _oPanelContainer.visible;
    };
    
    _oParent = this;
    this._init(szMessage);
}


