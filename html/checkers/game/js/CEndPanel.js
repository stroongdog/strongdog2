function CEndPanel(oSpriteBg){
    
    var _oBg;
    var _oGroup;
    var _oBlackPanel;
    var _oWhitePanel;

    var _oMsgText;
    var _oMsgTextUnder;
    var _oFade;
    var _oListener;
    var _oHome;
    var _oCheckBoard;
    var _oRestart;
    var _oThis;
    
    this._init = function(oSpriteBg){
        
        s_oGame.pauseGame(true);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0.7;
        _oListener = _oFade.on("mousedown",function(){});
        
        _oBg = createBitmap(oSpriteBg);
        _oBg.regX = oSpriteBg.width/2;
        _oBg.regY = oSpriteBg.height/2;
        _oBg.x = CANVAS_WIDTH/2;
        _oBg.y = CANVAS_HEIGHT/2;

       
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        _oGroup.addChild(_oFade, _oBg);
        
        var iWidth = 700;
        var iHeight = 100;
        var oRect = new createjs.Rectangle(CANVAS_WIDTH*0.5 - iWidth/2, (CANVAS_HEIGHT/2) - 250 - iHeight/2, iWidth, iHeight);
        _oMsgText = new CTLText(   _oGroup, 
                                    oRect.x, oRect.y, oRect.width, oRect.height, 
                                    90, "center", "#ffffff", PRIMARY_FONT,
                                    0,0,
                                    " ",
                                    true, true, false,
                                    false
                                );
       
        
        _oMsgTextUnder = new createjs.Text(""," 40px "+PRIMARY_FONT, "#ffffff");
        _oMsgTextUnder.x = CANVAS_WIDTH/2;
        _oMsgTextUnder.y = (CANVAS_HEIGHT/2) - 150;
        _oMsgTextUnder.textAlign = "center";
        _oMsgTextUnder.textBaseline = "alphabetic";
        _oMsgTextUnder.lineWidth = 800;

        
        
        _oGroup.addChild(_oMsgTextUnder);

        s_oStage.addChild(_oGroup);
    };
    
    this.unload = function(){
        s_oStage.removeChild(_oGroup);
        
        if(_oRestart){
            _oRestart.unload();
        }
        if(_oHome){
            _oHome.unload();
        }
        if(_oCheckBoard){
            _oCheckBoard.unload();
        }

        createjs.Tween.removeTweens(_oMsgTextUnder);

        _oFade.off("mousedown", _oListener);

    };
    
    this.setRestartBut = function(oCb, oOwner){
        var oSprite = s_oSpriteLibrary.getSprite('but_restart');
        _oRestart = new CGfxButton(CANVAS_WIDTH/2 - 180, CANVAS_HEIGHT/2 + 250, oSprite, _oGroup);
        _oRestart.addEventListener(ON_MOUSE_UP, oCb, oOwner);
    };

    this.setHomeBut = function(oCb, oOwner){
        var oSprite = s_oSpriteLibrary.getSprite('but_home');
        _oHome = new CGfxButton(CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 250, oSprite, _oGroup);
        _oHome.addEventListener(ON_MOUSE_UP, oCb, oOwner);
    };
    
    this.setCheckBut = function(oCb, oOwner){
        var oSprite = s_oSpriteLibrary.getSprite('but_show');
        _oCheckBoard = new CGfxButton(CANVAS_WIDTH/2 + 180, CANVAS_HEIGHT/2 + 250, oSprite, _oGroup);
        _oCheckBoard.addEventListener(ON_MOUSE_UP, oCb, oOwner);
    };
    
    this.show = function(iWinner, iBlackTime, iWhiteTime){
        if(s_bMultiplayer){
            /////MULTIPLAYER
            if(iWinner === WIN_WHITE){
                if(s_oNetworkManager.isUserA()){
                    playSound("win",1,false); 
                    _oMsgText.refreshText( TEXT_YOU_WIN );
                }else {
                    playSound("game_over",1,false); 
                    _oMsgText.refreshText( TEXT_WINS.format(s_oNetworkManager.getEnemyNickname().toUpperCase()) );
                }
            }else if(iWinner === WIN_BLACK) {
                if(!s_oNetworkManager.isUserA()){
                    playSound("win",1,false); 
                    _oMsgText.refreshText( TEXT_YOU_WIN );
                }else {
                    playSound("game_over",1,false); 
                    _oMsgText.refreshText( TEXT_WINS.format(s_oNetworkManager.getEnemyNickname().toUpperCase()) );
                }
            }else if(iWinner === DRAW){ //DRAW            
                playSound("game_over",1,false);
                _oMsgText.refreshText( TEXT_DRAW );
            }   else if(iWinner === WIN_WHITE_BLACK_NOMOVES){
                if(s_oNetworkManager.isUserA()){
                    playSound("win",1,false); 
                    _oMsgText.refreshText( TEXT_YOU_WIN );
                }else {
                    playSound("game_over",1,false); 
                    _oMsgText.refreshText( TEXT_WINS.format(s_oNetworkManager.getEnemyNickname().toUpperCase()) );
                }
                _oMsgTextUnder.text = "(" +TEXT_BLACK + " " + TEXT_MOVES_AVAIL +")";
            } else if(iWinner === WIN_BLACK_WHITE_NOMOVES){
                if(!s_oNetworkManager.isUserA()){
                    playSound("win",1,false); 
                    _oMsgText.refreshText( TEXT_YOU_WIN );
                }else {
                    playSound("game_over",1,false); 
                    _oMsgText.refreshText( TEXT_WINS.format(s_oNetworkManager.getEnemyNickname().toUpperCase()) );
                }
                _oMsgTextUnder.text = "(" +TEXT_WHITE + " " + TEXT_MOVES_AVAIL +")";
            }
            
        } else {
            /////SINGLE PLAYER
            if(iWinner === WIN_WHITE){
                playSound("win",1,false); 
                if(MODE_HUMAN){
                    _oMsgText.refreshText( TEXT_WHITE + " " +TEXT_GAMEOVER );
                }else {
                    _oMsgText.refreshText( TEXT_YOU_WIN );
                }


            } else if(iWinner === WIN_BLACK) {
                if(MODE_HUMAN){
                    playSound("win",1,false); 
                    _oMsgText.refreshText( TEXT_BLACK + " " +TEXT_GAMEOVER );
                } else {
                    playSound("game_over",1,false); 
                    _oMsgText.refreshText( TEXT_WINS.format(TEXT_COMPUTER) );
                }            
                

            } else if(iWinner === DRAW){ //DRAW            
                playSound("game_over",1,false);
                _oMsgText.refreshText( TEXT_DRAW );
            } else if(iWinner === WIN_WHITE_BLACK_NOMOVES){
                playSound("win",1,false); 
                if(MODE_HUMAN){
                    _oMsgText.refreshText( TEXT_WHITE + " " +TEXT_GAMEOVER );
                }else {
                    _oMsgText.refreshText( TEXT_YOU_WIN );
                }
                _oMsgTextUnder.text = "(" +TEXT_BLACK + " " + TEXT_MOVES_AVAIL +")";
            } else if(iWinner === WIN_BLACK_WHITE_NOMOVES){
                if(MODE_HUMAN){
                    playSound("win",1,false);  
                    _oMsgText.refreshText( TEXT_BLACK + " " +TEXT_GAMEOVER );
                } else {
                    playSound("game_over",1,false);
                    _oMsgText.refreshText( TEXT_WINS.format(TEXT_COMPUTER) );
                }            
                _oMsgTextUnder.text = "(" +TEXT_WHITE + " " + TEXT_MOVES_AVAIL +")";
            }
        }
        
       
        _oGroup.visible = true;
        
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500);

        var iWhiteScore = 1800000 - iBlackTime;        
        $(s_oMain).trigger("save_score", [iWinner, iBlackTime, iWhiteTime, s_iGameType, iWhiteScore]);
        $(s_oMain).trigger("share_event", [iWhiteScore, s_iGameType, iWinner] ); 
    };

    this._onExit = function(){
        _oGroup.off("mousedown",_oListener);

        s_oStage.removeChild(_oGroup);
        
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("show_interlevel_ad");
        
        s_oGame.onExit();
    };
    
    
    this.hide = function(){
        _oGroup.visible = false;
        
        $(s_oMain).trigger("end_session");
    };
    
    this.reShow = function(){
        _oGroup.visible = true;
    };
    
    this.hideMessage = function(){
        _oMsgText.getText().visible = false;
    };
    
    this.showMessage = function(){
        _oMsgText.getText().visible = true;
    };
    
    this.setMessage = function(szMsg){
        _oMsgText.refreshText( szMsg );
    };
    
    this.setExplMessage = function(szMsg){
        createjs.Tween.removeTweens(_oMsgTextUnder);
        _oMsgTextUnder.textAlign = "center";
        _oMsgTextUnder.text = szMsg;
        _oMsgTextUnder.x = CANVAS_WIDTH/2;
        _oMsgTextUnder.y = (CANVAS_HEIGHT/2) - 150;
        _oMsgTextUnder.font = " 40px "+PRIMARY_FONT;
    };
    
    this.setWaitingMsg = function(){
        _oMsgTextUnder.textAlign = "left";
        _oMsgTextUnder.font = "bold 90px "+PRIMARY_FONT;
        _oMsgTextUnder.text = TEXT_WAITING_MOVES;
        _oMsgTextUnder.x = CANVAS_WIDTH/2 - _oMsgTextUnder.getBounds().width/2;
        _oMsgTextUnder.y = (CANVAS_HEIGHT/2);
        
        
        createjs.Tween.get(_oMsgTextUnder).wait(500).call(function(){
            _oMsgTextUnder.text = TEXT_WAITING_MOVES +".";
            createjs.Tween.get(_oMsgTextUnder).wait(500).call(function(){
                _oMsgTextUnder.text = TEXT_WAITING_MOVES +"..";
                createjs.Tween.get(_oMsgTextUnder).wait(500).call(function(){
                    _oMsgTextUnder.text = TEXT_WAITING_MOVES +"...";
                    createjs.Tween.get(_oMsgTextUnder).wait(500).call(function(){
                        _oThis.setWaitingMsg();
                    });
                });
            });
        });
    };
    
    this.isVisible = function(){
        return _oGroup.visible;
    };
    
    this.hideButtons = function(){
        _oHome.setVisible(false);
        _oCheckBoard.setVisible(false);
        _oRestart.setVisible(false);
    };
    
    this.showButtons = function(){
        _oHome.setVisible(true);
        _oCheckBoard.setVisible(true);
        _oRestart.setVisible(true);
    };
    
    this.hideRestartButton = function(){
        _oRestart.setVisible(false);
    };
    
    this.centerRemainingButtons = function(){
        _oHome.setX(CANVAS_WIDTH/2 -150);
        _oCheckBoard.setX(CANVAS_WIDTH/2 + 150);
    };
    
    _oThis = this;
    this._init(oSpriteBg);
    
    return this;
}
