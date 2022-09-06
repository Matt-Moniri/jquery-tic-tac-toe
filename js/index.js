//--------------------------=={   O X-i n g      j s      p r o g r a m   }==--------------------------
//------------------- beginning of XO game code ---------------------------------
/*create an array containing all the 
combinations of indexes that represent the straight lines on the board.*/
winCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

//create an empty object which will be our board.
//This will be a model of the board that is living in the DOM.
const board = {};

/* create an array of 9 strings as a property of the board object. 
The string value of each element is the word "empty".*/
board.cells = new Array(9).fill("empty");
function boardConstructor() {
  $table = $(`<div class="table"></div>`);
  for (i = 0; i < 3; i++) {
    $row = $(`<div class="row"></div>`);
    for (j = 0; j < 3; j++) {
      $gameCell = $(`<div class="gameCell" id="${i * 3 + j}"></div>`);
      $row.append($gameCell);
    }
    $table.append($row);
  }
  $("#board").append($table);
  adjustGameCells();
}
$.when(boardConstructor()).done(() => {
  console.log("construct done");
  $(".gameCell").click(moveListener);
});
function adjustGameCells() {
  console.log("adjusted gamecels");
  let displayIsLandscape =
    $(window).width() > $(window).height() * 0.65 ? true : false;
  let cellWidth;
  if (displayIsLandscape) {
    // landscape
    cellWidth = 100 * 0.65 * 0.33 * 0.9; // percentage of windows height
    $(".gameCell").css({
      width: `${cellWidth}vh`,
      height: `${cellWidth}vh`,
      "line-height": `${cellWidth * 0.97}vh`,
      "font-size": `${cellWidth * 0.97}vh`,
    });
    $(".table").css({
      "margin-top": `2vh`,
    });
  } else {
    // portrait
    cellWidth = 100 * 0.33 * 0.8; // percentage of windows width
    $(".gameCell").css({
      width: `${cellWidth}vw`,
      height: `${cellWidth}vw`,
      "line-height": `${cellWidth}vw`,
      "font-size": `${cellWidth * 0.95}vw`,
    });

    //$(".row").width("65vw");
    $(".table").css({
      "margin-top": `${(100 - 3 * cellWidth) / 2}vw`,
    });
  }
}
$(window).resize(adjustGameCells);
board.winner = { winner: "null", winLine: "null" };
async function moveListener(e) {
  if (board.wait) {
    return;
  }
  e.preventDefault(); //prevent default behavior
  //first make sure that the game is not finished and not won by any player
  if (board.winner.winner != "null") {
    return;
  }

  let id = $(e.target).attr("id"); // read the id of the target which is the id of the square clicked
  //make sure that the cell is not olready filled
  if (board.cells[id] != "empty") {
    return;
  }
  board.moveHuman(id); //execute the moveHuman function
  board.checkWin("Human");
  if (board.winner.winner != "null") {
    console.log(`after human board.winner.winner=${board.winner.winner}`);
    $("#bigPopUp").css({
      opacity: "100",
    });
  }
  board.wait = true;
  let moveDelay = new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve();
    }, 150);
  });
  await moveDelay.then();
  board.moveComputer();
  board.checkWin("Computer");
  if (board.winner.winner != "null") {
    $("#bigPopUp").css({
      opacity: "100",
    });
  }
  board.wait = false;
}

////////////// O O P for the game /////////////////

/* The moveHuman() is easy to write. 
It receives the id of the cell that the human has clicked on
and then updates the DOM and the model.
*/
board.moveHuman = (id) => {
  board.cells[id] = "o"; //update the model
  $(`#${id}`).text("O"); //update the DOM.
};

/*
This part is reponsible for the way computer thinks and moves.
The thinking pcocess is done step after step. At the start of each step the variable
'group' is filled with information. Then the computer checks that information to see if
it can make a decision based on them. If the computer succeeds in deciding
it makes a move and exits the functions using a 'return'.
In other words if the computer suceeds in making a move in any step,
the execution of the function terminates at the end of that step.
The flow of the program looks very simple in this way.
***The computer always plays 'x' and the user always plays 'o'.
*/

board.moveComputer = function () {
  /* Step1: check if there is a line that has 2 'x's and an empty cell.
  if so, put 'x' in the empty cell */
  group = board.findCombinations("x", 2);
  if (group.combination != "nul" && group.emptyCells.length > 0) {
    board.cells[group.emptyCells[0]] = "x";
    $(`#${group.emptyCells[0]}`).text("X");
    return;
  }

  /* Step2: check if there is a line that has 2 'o's and an empty cell.
  if so, put 'x' in the empty cell */
  group = board.findCombinations("o", 2);
  if (group.combination != "nul" && group.emptyCells.length > 0) {
    board.cells[group.emptyCells[0]] = "x";
    $(`#${group.emptyCells[0]}`).text("X");

    return;
  }

  /* Step3: check if the center is empty.
  if so, put 'x' in the center cell 
  there is no need to create 'group' */
  if (board.cells[4] == "empty") {
    board.cells[4] = "x";
    $(`#4`).text("X");
    return;
  }

  /* Step4: check if there is a line that has 1 'x' and 2 empty cells.
  if so, put 'x' in the first empty cell in that line */
  group = board.findCombinations("x", 1);
  if (group.combination != "nul" && group.emptyCells.length == 2) {
    board.cells[group.emptyCells[0]] = "x";
    $(`#${group.emptyCells[0]}`).text("X");
    return;
  }

  /* Step5: Put 'x' in the first empty cell found.
  there is no need to create 'group' */
  for (i = 0; i < 9; i++) {
    if (board.cells[i] == "empty") {
      board.cells[i] = "x";
      $(`#${i}`).text("X");
      return;
    }
  }
  /* 
  If the execution of the function reaches here, 
  it means that there is no empty cell so the game has already finished 
  and the appropriate message has been already put on the screen.
  so we put a 'return'. We could omit this return but 
  writing it makes the code more legible.
  */
  return;
};

/*
This function checks if there is a winning line on the board. 
A line consists of three cells that are in a horizontal, vertical or diagonal order.
A winning line is a line that has 3 of the same character in each of its three cells.

*/
board.checkWin = (player) => {
  for (i = 0; i < winCombinations.length; i++) {
    if (
      board.cells[winCombinations[i][0]] ==
        board.cells[winCombinations[i][1]] &&
      board.cells[winCombinations[i][0]] ==
        board.cells[winCombinations[i][2]] &&
      board.cells[winCombinations[i][0]] != "empty"
    ) {
      board.winner = { winner: player, winLine: winCombinations[i] };
      $("#bigPopUp p").text(`The ${player} Wins!`);
      for (let j = 0; j < 3; j++) {
        $(`#${board.winner.winLine[j]}`).css({ "background-color": "#88292F" });
      }
      console.log("win");
      console.log(board.winner);
      return;
    }
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      console.log(board.cells[i][j]);
      if (board.cells[3 * i + j] == "empty") {
        board.winner = { winner: "null", winLine: "null" };
        console.log("notYet");
        return;
      }
    }
  }
  board.winner = { winner: "equal", winLine: "null" };
  console.log("cats");
  console.log(board.winner);
  $("#bigPopUp p").text(`Cats Game! It is a Draw!`);

  $("#bigPopUp").css({
    opacity: "100",
  });

  return;
};
/* 
This function takes two arguments: a 'letter' and 'instances'.
Then it checks the board to find a line that  
the occurances of the 'letter' is equal to 'instances' and there is no other letter in cells.
In other words it is trying to find a line that contains 'intances' number of the 'letter'
and no other letter.
To do this:
We iterate through winCombinations array, which contains all the lines. 
*/

board.findCombinations = (letter, instances) => {
  /*'result is the final object that the function returns.
  Its combination proprty contain the line where the combination is found
  which is a three-element array and each element is an id of a cell
  'emptyCells' property is an array containing the ids of the empty cells in the mentioned line.
  */
  let result = { combination: [], emptyCells: [] };

  /* 'found' is used to break the loop of 'winCombinations.forEach' iterator when we realise that
  a suitable combination is found*/
  let found = false;
  let i = 0;
  while (!found && i < winCombinations.length) {
    // loop through the 'winCombinations' using '.forEach'
    line = winCombinations[i];
    // make sure we haven't found a proper line yet
    let numb = 0; //This is the number of occurencees of the give letter in a given line
    let emptyCells = []; //an array containing the ids of the empty cells in the mentioned line.

    for (j = 0; j < 3; j++) {
      // loop through the 3 elements in a given line

      if (board.cells[line[j]] == letter) {
        numb += 1; //increment 'numb' if a cell's value is equal to the letter that we are seeking
      }

      if (board.cells[line[j]] == "empty") {
        //If the cell is empty,push the id of the cell into emptyCells array
        emptyCells.push(line[j]);
      }
      /* if the 'numb' and 'emptyCells' show that this line is the line we want,
       put them in 'result' and set found = true */
    } //}for 3
    if (numb == instances && emptyCells.length == 3 - instances) {
      result = { combination: line, emptyCells: emptyCells };
      found = true;
    }
    i += 1;
  }
  return result; //return the final result
};

// this function renews the game
board.newGame = () => {
  board.winner = { winner: "null", winLine: "null" };
  board.cells.forEach((element, index) => {
    board.cells[index] = "empty";
    $(`#${index}`).text(""); // because the index is also the id value of the div
  });
  $("#bigPopUp").css({
    opacity: "0",
  });
  $(`.gameCell`).css({ "background-color": "unset" });
};

$("#bigPopUpClose").click(board.newGame);
console.log($("#main").height());
console.log($(window).height());
