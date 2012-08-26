String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var cluedoPlayers = ["", "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"];
var default_items = {
  guest: {mustard: 0, plum: 0, green: 0, peacock: 0, scarlet: 0, white: 0},
  items: {knife: 0, candle: 0, pistol: 0, poison: 0, rope: 0, dumbbell: 0},
  rooms: {hall: 0, dining: 0, kitchen: 0, living: 0, theatre: 0, observatory: 0, spa: 0, guest: 0, patio: 0}
}
var playerItemCount = [];
var investigationsCount = {};

function updatePlayerName(player){
  var player_id = player.data().playerid;
  player.bind("keyup", function(event){
    if(jQuery.trim(player.val()).length != 0){
      value = player.val();
      cluedoPlayers[player_id] = value;
    }
    else{
      value = "Player " + player_id;
    }

    jQuery(".player_" + player_id).text(value);
    initUpdateOptions();
  });
}

function updateViewInfos(){
  var hash = {guest: [], items: [], rooms: []};

  for(clue_type in default_items){
    for(item in default_items[clue_type]){
      item_count = default_items[clue_type][item];
      style = "color: black;";

      if(item_count >= 3 && item_count <= 5){
        style = "color: #8a6800";
        jQuery(".global_item_" + item).css({"text-decoration": "none"});
      }
      else if(item_count == 6){
        style = "color: red";
        jQuery(".global_item_" + item).css({"text-decoration": "line-through"});
      }

      if(item_count > 6){
        style = "color: green";
        pretty_item_count = "★";
        jQuery(".global_item_" + item).css({"text-decoration": "line-through"});
      }
      else {
        pretty_item_count = item_count;
      }

      html = "<label style=\"" + style + "\">" + item.capitalize() + " = " + pretty_item_count + "</label><br>";

      hash[clue_type].push([item_count, html]);
    }

    hash[clue_type] = hash[clue_type].sort(function(a,b){
      return b[0]-a[0]
    });

    content = "";
    jQuery.each(hash[clue_type], function(index, item_array){
      content += item_array[1];
    });

    jQuery("#" + clue_type + "_count_info").html(content);
  }

}

function updateAnswer(answerCell){
  var cellData = answerCell.data();

  answerCell.bind("click", function(){

    if(jQuery(this).hasClass("no_card")){
      jQuery(this).removeClass("no_card");
      jQuery(this).addClass("has_card");
      jQuery(this).text("★");
      default_items[cellData.itemtype][cellData.item] += 1;
    }
    else if(jQuery(this).hasClass("has_card")){
      jQuery(this).removeClass("has_card");
      jQuery(this).text("");
      default_items[cellData.itemtype][cellData.item] -= 2;
    }
    else{
      jQuery(this).addClass("no_card");
      jQuery(this).text("✖");
      default_items[cellData.itemtype][cellData.item] += 1;
    }

    updateViewInfos();
  });
}

function initPlayerNames(){
  var players = jQuery(".player_field");

  jQuery.each(players, function(index, player){
    updatePlayerName(jQuery(player));
  });
}

function initClueboxAnswers(){
  var answers = jQuery(".cluebox_answer");

  jQuery.each(answers, function(index, answer){
    answer = jQuery(answer);
    answer.attr("title", "Click " + answer.data().item + " for " + cluedoPlayers[answer.data().playerid]);
    answer.addClass("player_" + answer.data().playerid + "_column");
    answer.addClass("card_" + answer.data().item + "_row");
    updateAnswer(jQuery(answer));
  });
}

function initUpdateOptions(){
  var player_options = guests_options = rooms_options = items_options = "";

  jQuery.each(cluedoPlayers, function(index, player){
    player_options += "<option value=" + index + ">" + player + "</option>";
  });

  for(clue_type in default_items){
    for(item in default_items[clue_type]){

      html =  "<option value=" + item + ">" + item.capitalize() + "</option>"

      switch(clue_type){
        case "guest":
          guests_options += html;
          break;
        case "items":
          items_options += html;
          break;
        case "rooms":
          rooms_options += html;
          break;
      }
    }
  }

  jQuery("#investigator_selection").html(player_options);
  jQuery("#player_selection").html(player_options);
  jQuery("#guest_selection").html(guests_options);
  jQuery("#items_selection").html(items_options);
  jQuery("#rooms_selection").html(rooms_options);
}

function updatePlayerEvidenceView(){
  var playersList = [];

  jQuery.each(cluedoPlayers, function(index, player){
    playersList[index] = {
      guest: {mustard: 0, plum: 0, green: 0, peacock: 0, scarlet: 0, white: 0},
      items: {knife: 0, candle: 0, pistol: 0, poison: 0, rope: 0, dumbbell: 0},
      rooms: {hall: 0, dining: 0, kitchen: 0, living: 0, theatre: 0, observatory: 0, spa: 0, guest: 0, patio: 0}
    }
  });

  for(code in investigationsCount){
    hash = investigationsCount[code];

    if(hash != undefined){
      playersList[hash['player']]['guest'][hash['guest']]++;
      playersList[hash['player']]['items'][hash['item']]++;
      playersList[hash['player']]['rooms'][hash['room']]++;
    }
  }

  jQuery.each(playersList, function(index, player_hash){
    html = ""
    for(clue_type in player_hash){
      for(item in player_hash[clue_type]){
        if(player_hash[clue_type][item] > 0){
          html += "<span class='global_item_" + item + "'>"
          html += item.capitalize() + " - " + player_hash[clue_type][item] + "<br></span>"
        }
      }
    }
    jQuery("#player_evidence_" + index).html(html);
  });
}

function initInvestigationForm(){
  jQuery("#add_investigation_button").bind("click", function(){
    jQuery("#investigation_form").effect("blind", {mode: 'show'}, 500);
  });

  jQuery("#cancel_investigation_button").bind("click", function(){
    jQuery("#investigation_form").effect("blind", 500);
  });

  jQuery("#save_investigation_button").bind("click", function(){
    var investigator = jQuery("#investigator_selection").val();
    var guest = jQuery("#guest_selection").val();
    var item  = jQuery("#items_selection").val();
    var room  = jQuery("#rooms_selection").val();
    var player = jQuery("#player_selection").val();
    var html = "";

    code = (new Date).getTime();
    investigationsCount[code] = {investigator: investigator, player: player, guest: guest, item: item, room: room};

    updatePlayerEvidenceView();

    html += "<div class='investigated_row'>"
    html += "<div class='investigate_box investigator_item_box' style='background-color: #bda926'>" + (cluedoPlayers[investigator] || "none") + "</div>";
    html += "<div class='investigate_box guest_item_box' style='background-color: #404040; color: white;'>" + guest.capitalize() + "</div>";
    html += "<div class='investigate_box items_item_box' style='background-color: #426155; color: white;'>" + item.capitalize() + "</div>";
    html += "<div class='investigate_box rooms_item_box' style='background-color: #e086a4'>" + room.capitalize() + "</div>";
    html += "<div class='investigate_box player_item_box' style='background-color: #fa0'>" + (cluedoPlayers[player] || "none") + "</div>";
    html += "<div class='investigate_box remove_row_box' data-investigationid='" + code + "' title='Remove this investigation' style='cursor: pointer'><img src='trash.png'></div>"
    html += "</div>";

    jQuery("#investigations_list").append(jQuery(html));
    jQuery("#investigation_form").effect("blind", 500);
  });

  jQuery(".remove_row_box").live("click", function(){
    if(confirm("Are you sure? There's no turning back.")){
      investigationsCount[jQuery(this).data().investigationid] = undefined;
      jQuery(this).parent().effect("puff");
      updatePlayerEvidenceView();
    }
  });
}

function initPlayerData(){
  jQuery.each(cluedoPlayers, function(index, player){
    playerItemCount[index] = {
      guest: {mustard: 0, plum: 0, green: 0, peacock: 0, scarlet: 0, white: 0},
      items: {knife: 0, candle: 0, pistol: 0, poison: 0, rope: 0, dumbbell: 0},
      rooms: {hall: 0, dining: 0, kitchen: 0, living: 0, theatre: 0, observatory: 0, spa: 0, guest: 0, patio: 0}
    }
;
  });
}

jQuery(document).ready(function(){
  initPlayerNames();
  initClueboxAnswers();
  initInvestigationForm();
  initUpdateOptions();
});
