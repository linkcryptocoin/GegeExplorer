//var cryptoSocket = require('crypto-socket');
var BigNumber = require('bignumber.js');
angular.module('ethExplorer')
    .controller('mainCtrl', function ($rootScope, $scope, $location) {

        // Display & update block list
        //getETHRates();
        updateBlockList();
        updateTXList();
        updateStats();
        getHashrate();

        web3call("eth.filter", [], function(result) {
            //getETHRates();
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
             web3call("updateStats", [], function(st) { 
                 $scope.blockNumber = st.blockNum;
                 $scope.blockNum = st.blockNum;

                 // difficulty
                 $scope.difficulty = st.difficulty;
                 $scope.difficultyToExponential = st.difficultyToExponential;

                 $scope.totalDifficulty = st.totalDifficulty;
                 $scope.totalDifficultyToExponential = st.totalDifficultyToExponential;
                 $scope.totalDifficultyDividedByDifficulty = st.totalDifficultyDividedByDifficulty;
                 $scope.totalDifficultyDividedByDifficulty_formatted = $scope.totalDifficultyDividedByDifficulty; //.toFormat(1);

                 $scope.AltsheetsCoefficient = st.AltsheetsCoefficient;
                 $scope.AltsheetsCoefficient_formatted = $scope.AltsheetsCoefficient; //.toFormat(4);

                 // large numbers still printed nicely:
                 $scope.difficulty_formatted = $scope.difficulty; //.toFormat(0);
                 $scope.totalDifficulty_formatted = $scope.totalDifficulty; //.toFormat(0);

                 // Gas Limit
                 $scope.gasLimit = new BigNumber(st.gasLimit); //.toFormat(0) + " m/s";

                 // Time
                 $scope.time = st.time;

                 $scope.secondsSinceBlock1 = st.secondsSinceBlock1;
                 $scope.daysSinceBlock1 = st.daysSinceBlock1;

          
                 // Average Block Times:
                 // TODO: make fully async, put below into 'fastInfosCtrl'
                 $scope.blocktime = st.blocktime;
            
                 $scope.range1 = st.range1;
                 $scope.blocktimeAverage1 = st.blocktimeAverage1;
                 $scope.range2 = st.range2;
                 $scope.blocktimeAverage2 = st.blocktimeAverage2;
                 $scope.range3 = st.range3;
                 $scope.blocktimeAverage3 = st.blocktimeAverage3;
                 $scope.range4 = st.range4;
                 $scope.blocktimeAverage4 = st.blocktimeAverage4;
            
                 $scope.blocktimeAverageAll = st.blocktimeAverageAll;
          
                 // Block Explorer Info
                 $scope.isConnected = st.isconnected;
                 $scope.versionApi = st.versionApi;
                 $scope.versionClient = st.versionClient;
                 $scope.versionCurrency = st.versionCurrency;
         
                 $scope.versionWhisper = st.versionWhisper;
            })
        }


        function getHashrate()	{
            web3call("eth.hashrate", [], function(hr){
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
            web3call("getTransactionsFromBlocks", [], function(result) {
                $scope.recenttransactions = result;
            });
        }

        function updateBlockList() {
            web3call("getExchangeRate", [], function(result) {
                $scope.exchRate = result;
            });

            web3call("getBlocks", [], function(result) {
                $scope.blocks = result;
                if ($scope.blocks.length > 0) {
                   $scope.blockNumber = $scope.blocks[0].number;
                   $scope.blocktime   = $scope.blocks[0].timestamp * 1000;
                   $scope.gasLimit    = $scope.blocks[0].gasLimit;
                   $scope.difficulty  = $scope.blocks[0].difficulty;
                }
            });
        }
        
	// function: String - the name of the method of attribute
	// args[]: arguments
	async function web3call(web3Func, args, callBack) {
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
             //console.log(JSON.stringify(body.result));
             //console.log(body.message);
             var result = body.result; 
             callBack(result);
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
