function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function formatTime(dTms){
  ms = dTms % 60;
  s = Math.floor(dTms / 1000) % 60;
  m = Math.floor(dTms / (1000 * 60)) % 60;
  return (pad(m,2) + ":" + pad(s,2) + "." + pad(ms,2))  
}




function MakerFaireColorApp(){
  this.timer = new MakerFaireColorTimer("#challenge-window");
  this.timer.setupHandlers(this.onNewScore.bind(this));

  this.$leaderBoard = $(".leader-board .board");
  this.$clearLeaderBoardBtn = $(".leader-board .clear");

  this.scores = [];
  this.loadScores();

  this.$clearLeaderBoardBtn.click(this.clearScores.bind(this));

}

MakerFaireColorApp.prototype.onNewScore = function(name,time){
  var scoreObj = {
    date : new Date(),
    name : name,
    time : time
  };
  
  this.scores.push(scoreObj);
  this.sortScores();
  this.saveScores();  
}

MakerFaireColorApp.prototype.saveScores = function(obj){
  localStorage["scores"] = JSON.stringify(this.scores);
  this.drawLeaderBoard();
}

MakerFaireColorApp.prototype.loadScores = function(name,time){
  this.scores = JSON.parse(localStorage["scores"]) || [];
  this.sortScores();
  this.drawLeaderBoard();
}

MakerFaireColorApp.prototype.sortScores = function(){
  this.scores.sort(function(a,b){return a.time - b.time});
}
MakerFaireColorApp.prototype.formatLeaderBoardEntry = function(idx,obj){
  return "<li> #" + (idx+1) + " " + formatTime(obj.time) + " " + obj.name + "</li>";
}

MakerFaireColorApp.prototype.drawLeaderBoard = function(){
  var that = this;
  that.$leaderBoard.html("");
  $(this.scores).each(function(idx){
    that.$leaderBoard.append(that.formatLeaderBoardEntry(idx,this));
    if(idx >= 9)
      return;
  });
}
MakerFaireColorApp.prototype.clearScores = function(){
  this.scores = [];
  this.saveScores();
  this.drawLeaderBoard();
}



function MakerFaireColorTimer(elem){
  var that = this;
  this.elem = elem;
  this.$startButton = $("#go-btn",this.elem);
  this.$stopButton = $("#stop-btn",this.elem);
  this.$closeModalButton = $("#close-btn",this.elem);
  this.$clock = $(".clock .time",this.elem);
  this.$nameEntry = $('.name-entry',this.elem);
  this.$nameEntryInput = $('.name-entry input',this.elem);

  this.$colors = [];
  $('.colors .color',this.elem).each(function(idx){
    that.$colors.push(this);
  });

  this.Colors = ["#FF0000","#00FF00","#0000FF","#FFFF00"];

  this.timer = {
    sTime : null,
    eTime : null,
    displayTimer : null
  };

  this.States = {
    WAITING_TO_START : 0,
    RUNNING : 1,
    WAITING_TO_RESET : 2
  }

  this.state = 0;

  this.newScoreCallback = null;

}

MakerFaireColorTimer.prototype.setupHandlers = function(newScoreCallback) {
  this.$startButton.click(this.startTimer.bind(this));
  this.$stopButton.click(this.stopTimer.bind(this));
  this.$closeModalButton.click(this.reset.bind(this));
  this.setState(this.States.WAITING_TO_START);

  this.newScoreCallback = newScoreCallback;
};

MakerFaireColorTimer.prototype.startTimer = function() {
  this.setState(this.States.RUNNING);
  this.timer.sTime = new Date().getTime();

  this.generateRandomColors();

  clearInterval(this.timer.displayTimer);
  this.timer.displayTimer = setInterval(this.updateClock.bind(this),100);
}

MakerFaireColorTimer.prototype.stopTimer = function() {
  this.setState(this.States.WAITING_TO_RESET);
  this.timer.eTime = new Date().getTime();
  clearInterval(this.timer.displayTimer);
}

MakerFaireColorTimer.prototype.reset = function() {
  this.newScoreCallback(this.$nameEntryInput.val(),(this.timer.eTime-this.timer.sTime));

  this.setState(this.States.WAITING_TO_START);
  this.timer.eTime = null;
  this.timer.eTime = null;
}

MakerFaireColorTimer.prototype.setState = function(state){
    this.state = state;

    switch(this.state){
      case this.States.WAITING_TO_START:
        this.$startButton.show();
        this.$stopButton.hide();
        this.$closeModalButton.hide();
        this.$nameEntry.hide();
        this.$nameEntryInput.val("");
        this.$clock.text("00:00.00");
        $(this.$colors).each(function(){ $(this).css('background-color',"#FFFFFF"); });
      break;      
      case this.States.RUNNING: 
        this.$startButton.hide();
        this.$stopButton.show();
        this.$closeModalButton.hide();
        this.$nameEntry.hide();
      break;
      case this.States.WAITING_TO_RESET: 
        this.$startButton.hide();
        this.$stopButton.hide();
        this.$closeModalButton.show();
        this.$nameEntry.show();
      break;
    }
}


MakerFaireColorTimer.prototype.generateRandomColors = function() {
  var that = this;

  function getRandomColor(){
    return that.Colors[Math.floor(Math.random() * (that.Colors.length - 0) + 0)];
  }

  function loopColors(){
    $(that.$colors).each(function(){
        $(this).css('background-color',getRandomColor());
    });
  }

  function pickFinal(){
    var colorOrder = [];
    $(that.$colors).each(function(idx){
      var c = getRandomColor();
      do {
        c = getRandomColor();
      }while(idx !== 0 && colorOrder[idx-1] === c);
      colorOrder.push(c);
      $(this).css('background-color',c);
    });
  }

  var t = setInterval(loopColors,150);
  setTimeout(function(){
    pickFinal();
    clearInterval(t);
  },3000);

}

MakerFaireColorTimer.prototype.updateClock = function() {
  var dTms = (new Date().getTime() - this.timer.sTime);
  this.$clock.text( formatTime(dTms) );
}


$(document).ready(function onDocumentReady(){
  var app = new MakerFaireColorApp();
});
