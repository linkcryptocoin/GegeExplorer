//var cryptoSocket = require('crypto-socket');
var BigNumber = require('bignumber.js');
angular.module('ethExplorer')
    .controller('mainCtrl', function ($rootScope, $scope, $location) {

        // Display & update block list
        getETHRates();
        updateBlockList();
        updateTXList();
        updateStats();
        getHashrate();

        web3call("eth.filter", function(result) {
            getETHRates();
            updateBlockList();
            updateTXList();
            updateStats();
            getHashrate();
            $scope.$apply();
        });

        $scope.processRequest= function(){
            var requestStr = $scope.ethRequest;


            if (requestStr!==undefined){

                // maybe we can create a service to do the reg ex test, so we can use it in every controller ?

                var regexpTx = /[0-9a-zA-Z]{64}?/;
                //var regexpAddr =  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/; // TODO ADDR REGEX or use isAddress(hexString) API ?
                var regexpAddr = /^(0x)?[0-9a-f]{40}$/; //New ETH Regular Expression for Addresses
                var regexpBlock = /[0-9]{1,7}?/;

                var result =regexpTx.test(requestStr);
                if (result===true){
                    goToTxInfos(requestStr)
                }
                else{
                    result = regexpAddr.test(requestStr.toLowerCase());
                    if (result===true){
                        goToAddrInfos(requestStr.toLowerCase())
                    }
                    else{
                        result = regexpBlock.test(requestStr);
                        if (result===true){
                            goToBlockInfos(requestStr)
                        }
                        else{
                            console.log("nope");
                            return null;
                        }
                    }
                }
            }
            else{
                return null;
            }
        };


        function goToBlockInfos(requestStr){
            $location.path('/block/'+requestStr);
        }

        function goToAddrInfos(requestStr){
            $location.path('/address/'+requestStr.toLowerCase());
        }

        function goToTxInfos (requestStr){
             $location.path('/tx/'+requestStr);
        }

        function updateStats() {
          web3call("eth.blockNumber", function(result) { // now that was easy
             $scope.blockNum = Number(result);
         
             if($scope.blockNum!==undefined){

             // TODO: put the 2 web3.eth.getBlock into the async function below
             //       easiest to first do with fastInfosCtrl
              web3call("eth.getBlock", [$scope.blockNum],  function(result) {
              var blockNewest = JSON.parse(result);

              if(blockNewest!==undefined){

                // difficulty
                $scope.difficulty = blockNewest.difficulty;
                $scope.difficultyToExponential = blockNewest.difficulty.toExponential(3);

                $scope.totalDifficulty = blockNewest.totalDifficulty;
                $scope.totalDifficultyToExponential = blockNewest.totalDifficulty.toExponential(3);

                $scope.totalDifficultyDividedByDifficulty = $scope.totalDifficulty.dividedBy($scope.difficulty);
                $scope.totalDifficultyDividedByDifficulty_formatted = $scope.totalDifficultyDividedByDifficulty.toFormat(1);

                $scope.AltsheetsCoefficient = $scope.totalDifficultyDividedByDifficulty.dividedBy($scope.blockNum);
                $scope.AltsheetsCoefficient_formatted = $scope.AltsheetsCoefficient.toFormat(4);

                // large numbers still printed nicely:
                $scope.difficulty_formatted = $scope.difficulty.toFormat(0);
                $scope.totalDifficulty_formatted = $scope.totalDifficulty.toFormat(0);

                // Gas Limit
                $scope.gasLimit = new BigNumber(blockNewest.gasLimit).toFormat(0) + " m/s";

                // Time
                  var newDate = new Date();
                  newDate.setTime(blockNewest.timestamp*1000);
                  $scope.time = newDate.toUTCString();

                  $scope.secondsSinceBlock1 = blockNewest.timestamp - 1438226773;
                  $scope.daysSinceBlock1 = ($scope.secondsSinceBlock1 / 86400).toFixed(2);
                 }
                 });
              
                  // Average Block Times:
                  // TODO: make fully async, put below into 'fastInfosCtrl'

                  web3call("eth.getBlock", [$scope.blockNum - 1], function(result) {
                  var blockBefore = JSON.parse(result);
                  if(blockBefore!==undefined){
                  $scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
                  }
                  $scope.range1=100;
                  range = $scope.range1;
                  });

                  web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
                  var blockPast = JSON.parse(result);
n
                  if(blockBefore!==undefined){
                  $scope.blocktimeAverage1 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
                  }
                  $scope.range2=1000;
                  range = $scope.range2;
                  });

                  web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
                  var blockPast = JSON.parse(result);
                  if(blockBefore!==undefined){
                  $scope.blocktimeAverage2 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
                  }
                  $scope.range3=10000;
                  range = $scope.range3;
                  });

                  web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
                  var blockPast = JSON.parse(result);
                  if(blockBefore!==undefined){
                  $scope.blocktimeAverage3 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
                  }
                  $scope.range4=100000;
                  range = $scope.range4;
                  });

                  web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
                  var blockPast = JSON.parse(result);
                  if(blockBefore!==undefined){
                  $scope.blocktimeAverage4 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
                  }

                  range = $scope.blockNum;
                  });

                  web3call("eth.getBlock", [1], function(result) {
                  var blockPast = JSON.parse(result);

                  if(blockBefore!==undefined){
                  $scope.blocktimeAverageAll = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
                  }
                  })
                  //fastAnswers($scope);
                  //$scope=BlockExplorerConstants($scope);

              }
          });
          // Block Explorer Info
          web3call("isConnected", function(result) {
             $scope.isConnected = result;
          });
          //$scope.peerCount = web3.net.peerCount;
          web3call("version.api", function(result) {
             $scope.versionApi = result;
          });
          web3call("version.client", function(result) {
             $scope.versionClient = result;
          });
          //$scope.versionNetwork = web3.version.network;
          web3call("version.ethereum", function(result) { 
             $scope.versionCurrency = result;
          }); 
          // TODO: change that to currencyname?

          // ready for the future:
          try { 
              web3call("version.whisper", function(result) { 
                  $scope.versionWhisper = result;
              }); 
          }
          catch(err) {$scope.versionWhisper = err.message; }
}


        function getHashrate()	{
          $.getJSON("https://etherchain.org/api/miningEstimator", function(json) {
            var hr = json.data[0].hashRate;
            $scope.hashrate = hr;
       	});
      }

        function getETHRates() {
          $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(json) {
            var price = Number(json[0].price_usd);
            //$scope.ethprice = "$" + price.toFixed(2);
            $scope.ethprice = "$0.01" ; //fix ligear price to 0.01
          });

          $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(json) {
            var btcprice = Number(json[0].price_btc);
            $scope.ethbtcprice = btcprice;
          });

          $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(json) {
            var cap = Number(json[0].market_cap_usd);
            //console.log("Current ETH Market Cap: " + cap);
            $scope.ethmarketcap = cap;
          });
        }

        function updateTXList() {
            web3call("eth.blockNumber", function(result) {
                var currentTXnumber = result;
                $scope.txNumber = currentTXnumber;
                $scope.recenttransactions = [];
                for (var i=0; i < 10 && currentTXnumber - i >= 0; i++) {
                    web3call("eth.getTransactionFromBlock", [currentTXnumber - i], function(result) {
                        var trans = JSON.parse(result); 
                        $scope.recenttransactions.push(trans);
                    });
                }
            })
        }

        function updateBlockList() {
            web3call("getExchangeRate", function(result) {
               $scope.exchRate = parseInt(result);
            });
            web3call("eth.blockNumber", function(result) {
               var currentBlockNumber = result.
               $scope.blockNumber = currentBlockNumber;
               $scope.blocks = [];
               for (var i=0; i < 10 && currentBlockNumber - i >= 0; i++) {
                  var number = currentBlockNumber - i;   // gegeChain
                  web3call("eth.getBlock", [number], function(result) { 
                      var aBlock = JSON.parse(result);
                      $scope.blocks.push(aBlock);
                  });
               //$scope.blocks.push(web3.eth.getBlock(currentBlockNumber - i));
               }
            })
        }
        
// function: String - the name of the method of attribute
// args[]: arguments
async function web3call(web3Func, args) {
   //console.log("web3 call:" + web3Func);
   const api_path = "https://linkgear.net:8091/auth/local/web3call";
   const res = await fetch(api_path, {
       method: 'POST',
       headers: {
              'Content-Type': 'application/json'
              },
       body: JSON.stringify({
                web3Func,
                args
             }),
            credentials: 'include',
       });

   const body = await res.json();
   console.log(web3Func + ": " + body.result);
   return body.result;
}
    });

angular.module('filters', []).
  filter('truncate', function () {
    return function (text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length-end.length) + end;
        }
      };
      }).
  filter('diffFormat', function () {
    return function (diffi) {
      if (isNaN(diffi)) return diffi;
      //var n = diffi / 1000000000000;
      //var n = diffi / 1000000;
      //return n.toFixed(3) + " M";
      var n = 0;
      var result = "";
      if (diffi > 1000000) {
	 n = diffi / 1000000;
         result = n.toFixed(3) + " M";
      }
      else if (diffi > 1000) {
	 n = diffi / 1000;
         result = n.toFixed(3) + " K";
      }
      else {
	 n = diffi;
         result = "" + n;
      }
      return result;
    };
  }).
  filter('stylize', function () {
    return function (style) {
      if (isNaN(style)) return style;
      var si = '<span class="btn btn-primary">' + style + '</span>';
      return si;
    };
  }).
  filter('stylize2', function () {
    return function (text) {
      if (isNaN(text)) return text;
      var si = '<i class="fa fa-exchange"></i> ' + text;
      return si;
    };
  }).
  filter('hashFormat', function () {
    return function (hashr) {
      if (isNaN(hashr)) return hashr;
      var n = hashr / 1000000000000;
      return n.toFixed(3) + " TH/s";
    };
  }).
  filter('gasFormat', function () {
    return function (txt) {
      if (isNaN(txt)) return txt;
      var b = new BigNumber(txt);
      return b.toFormat(0) + " m/s";
    };
  }).
  filter('BigNum', function () {
    return function (txt) {
      if (isNaN(txt)) return txt;
      var b = new BigNumber(txt);
      web3call("fromWei", [b], function(result) {
         var w = result;
         return w.toFixed(6) + " ETH";
      })
    };
  }).
  filter('sizeFormat', function () {
    return function (size) {
      if (isNaN(size)) return size;
      var s = size / 1000;
      return s.toFixed(3) + " kB";
    };
  });
