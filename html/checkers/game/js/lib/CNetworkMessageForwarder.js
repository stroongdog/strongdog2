///////MESSAGE TYPE ARE ONLY STRING
////MSG FROM SERVER
var MSG_ROOM_IS_FULL = "room_is_full";
var MSG_GAME_FOUND = "game_found";
var MSG_PLAYER_DISCONNECTED_WHILE_ENTERING_IN_GAME = "player_disconnected_while_entering_in_game";
var MSG_START_THE_GAME = "start_the_game";
var MSG_SET_WINNER = "set_winner";
var MSG_REMATCH_PANEL = "rematch_panel";
var MSG_REMATCH_ANSWER_RESULTS = "rematch_answer_results";
var MSG_PLAYER_ACCEPTED_A_REMATCH_NOTIFY = "player_accepted_a_rematch_notify";
var MSG_ENEMY_MOVES = "enemy_moves";
var MSG_TIMER_END_MATCH = "timer_end_match";
var MSG_STOP_TURN_VOLUNTARILY = "stop_turn_voluntarily";


////MSG TO SERVER
var MSG_MOVED_INTO_GAME = "moved_into_game";
var MSG_END_MATCH = "end_match";
var MSG_ACCEPT_REMATCH = "accept_rematch";
var MSG_DISCONNECTION = "disconnection";
var MSG_MOVE = "move";
var MSG_LAST_TIMER_END = "last_timer_end";
var MSG_PLAYER_DECLARED_END_TURN = "player_declared_end_turn";



function CNetworkMessageForwarder(){
    
    var _oThis;
    
    this._init = function(){
        
    };
      
    //////////////////// COMMUNICATION FROM SERVER /////////
    this.messageHandler = function(message){
        switch (message.type) {
            case MSG_ROOM_IS_FULL: _oThis._onFullRoom(message); break;
            case MSG_GAME_FOUND: _oThis._onGameFound(message); break;
            case MSG_PLAYER_DISCONNECTED_WHILE_ENTERING_IN_GAME: _oThis._onPlayerDisconnectionWhileEnteringInGame(message); break;
            case MSG_START_THE_GAME: _oThis._onGameStart(message); break;
            case MSG_SET_WINNER: _oThis._onSetWinner(message); break;
            case MSG_REMATCH_PANEL: _oThis._onRematchPanel(message); break;
            case MSG_REMATCH_ANSWER_RESULTS: _oThis._onRematchResults(message); break;
            case MSG_PLAYER_ACCEPTED_A_REMATCH_NOTIFY: _oThis._onNotifyPlayerAcceptedRematch(message); break;
            case MSG_ENEMY_MOVES: _oThis._onEnemyMoves(message); break;
            case MSG_TIMER_END_MATCH: _oThis._onTimerEndMatch(message); break;
            case MSG_STOP_TURN_VOLUNTARILY: _oThis._onStopTurn(message); break;
        }
    };
    
    this._onFullRoom = function(){
        g_oCTLMultiplayer.closeAllDialog();
        g_oCTLMultiplayer.showGeneralDialog(TEXT_ROOM_IS_FULL, "s_oNetworkManager.gotoLobby");
    };
    
    this._onGameFound = function(szMessage){
        s_oNetworkManager.gotoGameRoom(szMessage);
    };
    
    this._onPlayerDisconnectionWhileEnteringInGame = function(szMessage){
        g_oCTLMultiplayer.closeAllDialog();
        g_oCTLMultiplayer.showGeneralDialog(TEXT_OPPONENT_LEFT, "s_oNetworkManager.gotoLobby");
    };
    
    this._onGameStart = function(szMessage){
        s_oMenu.onRemoteGameStart();
    };
    
    this._onSetWinner = function(szMessage){
        s_oGame.opponentLeftTheGame();
    };
    
    this._onRematchPanel = function(){
        s_oGame.showRematchQuestion();
    };

    this._onRematchResults = function(szMessage){
        var bAccepted = szMessage.getBoolean(0);
        if(bAccepted){
            s_oGame.onOpponentAcceptRematch();
        }else {
            s_oGame.onOpponentRefuseRematch();
        }
    };

    this._onNotifyPlayerAcceptedRematch = function(szMessage){
        s_oGame.notifyAcceptedRematch();
    };

    this._onEnemyMoves = function(szMessage){
        var szInfoMoves = szMessage.getString(0);
        var oData = JSON.parse(szInfoMoves);
        
        s_oGame.remoteMovePiece(oData[MSG_MOVE]);
    };

    this._onTimerEndMatch = function(szMessage){
        s_oGame.onRemoteLastTimerEnd();
    };
    
    this._onStopTurn = function(szMessage){
        s_oGame.changeTurn();
    };
    _oThis = this;
    this._init();
};


