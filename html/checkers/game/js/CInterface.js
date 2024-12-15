function CInterface(oPieceContainer){
    
    var _iNumChips;
    
    var _aWhiteChips;
    var _aBlackChips;
    
    var _oButExit;
    var _oAudioToggle;
    var _oHelpPanel=null;
    var _oWhitePanel;    
    var _oBlackPanel;
    var _oAreYouSurePanel;
    var _oButFullscreen;
    var _oTurnText;
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _pStartPosFullscreen;
    var _pStartPosExit;
    var _pStartPosAudio;
    
    
    this._init = function(oPieceContainer){                
        var oExitX;        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 25};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = CANVAS_WIDTH - (oSprite.width/2) - 125;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
           
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: oExitX, y: 25+ (oSprite.height/2)}; 
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);           
            
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:oSprite.width/4 + 20,y:(oSprite.height/2) +25};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        var oTopPanelPos = {x: 485, y: 290};
        var oBotPanelPos = {x: 815, y: 1630};
        _oWhitePanel = new CInfoTurn(oBotPanelPos.x,oBotPanelPos.y,PAWN_WHITE, s_oStage);        
        _oBlackPanel = new CInfoTurn(oTopPanelPos.x,oTopPanelPos.y,PAWN_BLACK, s_oStage);
        
        _oWhitePanel.setPanelVisible(false);
        _oBlackPanel.setPanelVisible(false);

        var iWidth = 650;
        var iHeight = 100;
        var oRect = new createjs.Rectangle(CANVAS_WIDTH*0.5 - iWidth/2, 1610-iHeight/2, iWidth, iHeight);
        _oTurnText = new CTLText(   s_oStage, 
                                    oRect.x, oRect.y, oRect.width, oRect.height, 
                                    60, "center", "#ffffff", PRIMARY_FONT,
                                    0,0,
                                    " ",
                                    true, true, false,
                                    false
                                );
       
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        _oButExit.unload();
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
        }
        if(_oHelpPanel!==null){
            _oHelpPanel.unload();
        }
        
        _oBlackPanel.unload();
        _oWhitePanel.unload();
        
        for(var i=0; i<_iNumChips; i++){
            oPieceContainer.removeChild(_aWhiteChips[i]);
            oPieceContainer.removeChild(_aBlackChips[i]);
        };
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        _oAreYouSurePanel = null;
        s_oInterface = null;        
    };
    
    this.configureInfoPanel = function(bBlackTop){
        var iOffset = 19;
        _iNumChips = 12;

        var oTopPanelPos = {x: -320, y: -507};
        var oBotPanelPos = {x: 339, y: 509};
        var iWhiteDir;
        var iBlackDir;

        var oWhiteContainer = new createjs.Container();
        oPieceContainer.addChild(oWhiteContainer);
        
        var oBlackContainer = new createjs.Container();
        oPieceContainer.addChild(oBlackContainer);

        if(bBlackTop){
            oWhiteContainer.x = oBotPanelPos.x;
            oWhiteContainer.y = oBotPanelPos.y;
            iWhiteDir = -1;
            
            oBlackContainer.x = oTopPanelPos.x;
            oBlackContainer.y = oTopPanelPos.y;
            iBlackDir = 1;
            
        }else {
            oWhiteContainer.x = oTopPanelPos.x;
            oWhiteContainer.y = oTopPanelPos.y;
            iWhiteDir = 1;
            
            oBlackContainer.x = oBotPanelPos.x;
            oBlackContainer.y = oBotPanelPos.y;
            iBlackDir = -1;
        }

        _aBlackChips = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('black_chip');
        for(var i=0; i<_iNumChips; i++){
            _aBlackChips[i] = createBitmap(oSprite);
            _aBlackChips[i].regX = oSprite.width/2;
            _aBlackChips[i].regY = oSprite.height/2;
            _aBlackChips[i].x = iBlackDir*i*iOffset;
            _aBlackChips[i].visible = false;
            oBlackContainer.addChild(_aBlackChips[i]);
        }
        
        _aWhiteChips = new Array();
        for(var i=0; i<_iNumChips; i++){
            var oSprite = s_oSpriteLibrary.getSprite('white_chip');
            _aWhiteChips[i] = createBitmap(oSprite);
            _aWhiteChips[i].regX = oSprite.width/2;
            _aWhiteChips[i].regY = oSprite.height/2;
            _aWhiteChips[i].x = iWhiteDir*i*iOffset;
            _aWhiteChips[i].visible = false;
            oWhiteContainer.addChild(_aWhiteChips[i]);
        }
        
    };
    
    this.setPlayersInfo = function(szWhiteName, szBlackName){
        _oWhitePanel.setName(szWhiteName);
        _oBlackPanel.setName(szBlackName);
    };
    
    this.resetInfo = function(){
        _oWhitePanel.refreshTime(formatTime(0));
        _oBlackPanel.refreshTime(formatTime(0));
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,iNewY + _pStartPosFullscreen.y);
        }
    };

    this.refreshWhitePawnNumber = function(iNum){

        if(iNum < 0){
            iNum = 0;
        }
        for(var i=0; i<iNum; i++){
            _aWhiteChips[i].visible = true;
        }
        for(var i=iNum; i<_iNumChips; i++){
            _aWhiteChips[i].visible = false;
        }
        
    };
    
    this.refreshWhiteTime = function(iTime){
        if(iTime > 50){
            _oWhitePanel.refreshTime(formatTime(iTime));
        }
        
    };
    
    this.refreshBlackPawnNumber = function(iNum){        
        if(iNum < 0){
            iNum = 0;
        }
        for(var i=0; i<iNum; i++){
            _aBlackChips[i].visible = true;
        }
        for(var i=iNum; i<_iNumChips; i++){
            _aBlackChips[i].visible = false;
        }
        
    };
    
    this.refreshBlackTime = function(iTime){
        if(iTime > 50){
            _oBlackPanel.refreshTime(formatTime(iTime));
        }
        
    };
    
    this.setTurnText = function(szMessage){
        _oTurnText.refreshText( szMessage );
    };
    
    this.activePlayerVisible = function(bVal){
        _oTurnText.getText().visible = bVal;
    };
    
    this.activePlayer = function(iCurPlayer){
        
        var szCurName;
        if(s_bMultiplayer){
            if(iCurPlayer === PAWN_WHITE){
                if(s_oNetworkManager.isUserA()){
                    _oTurnText.getText().color = "#ffffff";
                    _oTurnText.refreshText( TEXT_YOUR_MOVE);
                }else {
                    szCurName = s_oNetworkManager.getEnemyNickname();
                    _oTurnText.getText().color = "#ffffff";
                    _oTurnText.refreshText( TEXT_WAITING_FOR + " " + szCurName);
                }
            }else {
                if(s_bPlayWithBot){
                    szCurName = s_oNetworkManager.getBotName();
                } else {
                    if(s_oNetworkManager.isUserA()){
                        szCurName = s_oNetworkManager.getEnemyNickname();
                        _oTurnText.getText().color = "#000000";
                    _oTurnText.refreshText( TEXT_WAITING_FOR + " " + szCurName);
                    }else {
                        _oTurnText.getText().color = "#000000";
                        _oTurnText.refreshText( TEXT_YOUR_MOVE);
                    }
                }
            }
        }else {
            if(iCurPlayer === PAWN_WHITE){
                szCurName = TEXT_WHITE_LOWER;
                _oTurnText.getText().color = "#ffffff";
                
                if(s_iGameType === MODE_COMPUTER){
                    _oTurnText.refreshText( TEXT_YOUR_MOVE);
                }else {
                    _oTurnText.refreshText( szCurName + TEXT_MOVE);
                }
            }else {
                szCurName = TEXT_BLACK_LOWER;
                _oTurnText.getText().color = "#000000";
                
                _oTurnText.refreshText( szCurName + TEXT_MOVE);
            }            
            
        };
        ///FORCE WHITE COLOR IN EVERY MODE
        _oTurnText.getText().color = "#ffffff";
    };

    this.setInfoVisible = function(bVal){
        _oWhitePanel.setPanelVisible(bVal);
        _oBlackPanel.setPanelVisible(bVal);
    };

    this._onButConfigRelease = function(){
        new CConfigPanel();
    };
    
    this._onButRestartRelease = function(){
        s_oGame.restartGame();
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onExit = function(){
        _oAreYouSurePanel = new CAreYouSurePanel(s_oInterface._onConfirmExit);
    };
    
    this._onConfirmExit = function(){
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("show_interlevel_ad");
        s_oGame.onExit();  
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };
        
    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    s_oInterface = this;
    
    this._init(oPieceContainer);
    
    return this;
}

var s_oInterface = null;