function CMenu(){
    var _iIdTimeout;
    
    var _oBg;
    var _oButLocal;
    var _oButMultiplayer;
    var _oFade;
    var _oAudioToggle;
    var _oButCredits;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosCredits;
    var _pStartPosFullscreen;
    var _pStartPosAudio;
    
    this._init = function(){
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('checkers_logo');
        var oCheckersLogo = createBitmap(oSprite);
        oCheckersLogo.regX = oSprite.width/2;
        oCheckersLogo.regY = oSprite.height/2;
        oCheckersLogo.x = CANVAS_WIDTH/2;
        oCheckersLogo.y = 500;
        s_oStage.addChild(oCheckersLogo);

        var oSprite = s_oSpriteLibrary.getSprite('online_logo');
        var oOnlineLogo = createBitmap(oSprite);
        oOnlineLogo.regX = oSprite.width/2;
        oOnlineLogo.regY = oSprite.height/2;
        oOnlineLogo.x = CANVAS_WIDTH/2 + 335;
        oOnlineLogo.y = 620;
        s_oStage.addChild(oOnlineLogo);

        var oSprite = s_oSpriteLibrary.getSprite('but_vs_pc');
        _oButLocal = new CGfxButton((CANVAS_WIDTH/2) - 250,CANVAS_HEIGHT -450,oSprite, s_oStage);
        _oButLocal.addEventListener(ON_MOUSE_UP, this._onButLocalRelease, this);
        _oButLocal.setScale(0.75);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_vs_man');
        _oButMultiplayer = new CGfxButton((CANVAS_WIDTH/2) + 250,CANVAS_HEIGHT -450,oSprite, s_oStage);
        _oButMultiplayer.addEventListener(ON_MOUSE_UP, this._onButMultiplayerRelease, this);
        _oButMultiplayer.setScale(0.75);
     
        var oSprite = s_oSpriteLibrary.getSprite('but_credits');
        _pStartPosCredits = {x:20 + oSprite.width/2,y:(oSprite.height / 2) + 25};
        _oButCredits = new CGfxButton(_pStartPosCredits.x, _pStartPosCredits.y, oSprite, s_oStage);
        _oButCredits.addEventListener(ON_MOUSE_UP, this._onCredits, this);
        _oButCredits.setVisible(false);
     
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 25};            
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
            _pStartPosFullscreen = {x:20 + oSprite.width/4,y:(oSprite.height / 2) + 25};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
        
    };
    
    this.unload = function(){
        _oButLocal.unload(); 
        _oButLocal = null;
        _oButMultiplayer.unload(); 
        _oButMultiplayer = null;
        _oFade.visible = false;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        _oButCredits.unload();
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        s_oMenu = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        _oButCredits.setPosition(_pStartPosCredits.x + iNewX,iNewY + _pStartPosCredits.y);
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,iNewY + _pStartPosFullscreen.y);
        }
        
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onCredits = function(){
        new CCreditsPanel();
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
    
    this.onPlayOffline = function(){
        if(parent.cmgGameEvent){
            parent.cmgGameEvent("start");
        }
        
        this.unload();

        s_bMultiplayer = false;
        s_bPlayWithBot = false;
        
        $(s_oMain).trigger("start_session");
        
        g_oCTLMultiplayer.closeAllDialog();
        s_oMain.gotoGame(MODE_HUMAN);
    };
    
    this._onButLocalRelease = function(){
        if(parent.cmgGameEvent){
            parent.cmgGameEvent("start");
        }
        
        this.unload();

        s_bMultiplayer = false;
        s_bPlayWithBot = false;
        
        $(s_oMain).trigger("start_session");

        s_oMain.gotoGame(MODE_COMPUTER);
    };

    this._onButMultiplayerRelease = function(){
        if(parent.cmgGameEvent){
            parent.cmgGameEvent("start");
        }
        
        $(s_oMain).trigger("start_session");
        
        s_bMultiplayer = true;
        s_bPlayWithBot = false;

        s_oNetworkManager.addEventListener(ON_GAMEROOM_CONNECTION_SUCCESS, this._onGameStart);
        s_oNetworkManager.addEventListener(ON_MATCHMAKING_CONNECTION_SUCCESS, this._onMatchmakingConnected);
        s_oNetworkManager.connectToSystem();
    };

    this.onRemoteGameStart = function(){
        g_oCTLMultiplayer.closeAllDialog();
        
        s_bMultiplayer = true;
        s_bPlayWithBot = false;
        
        s_oMenu.unload();
        s_oMain.gotoGameMulti();
    };

    this._onGameStart = function(){

    };

    this._onMatchmakingConnected = function(){
        g_oCTLMultiplayer.closeAllDialog();
        g_oCTLMultiplayer.showLoading(TEXT_FIND_OPPONENT.toUpperCase(), "s_oNetworkManager._onDisconnectFromARoom");
    };
    
    s_oMenu = this;
    
    this._init();
}

var s_oMenu = null;