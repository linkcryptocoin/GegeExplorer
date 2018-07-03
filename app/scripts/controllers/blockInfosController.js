var BigNumber = require('bignumber.js');
angular.module('ethExplorer')
    .controller('blockInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

        $scope.init=function()
        {


            $scope.blockId=$routeParams.blockId;


            if($scope.blockId!==undefined) {

                getBlockInfos()
                    .then(function(result){

                    $scope.result = result;

                    $scope.numberOfUncles = result.uncles.length;

                    //if ($scope.numberOfUncles!=0) {
                    //	uncle1=result.uncles[0];
                    //	console.log(web3.eth.getUncle(uncle1));
                    //}

                    if(result.hash!==undefined){
                        $scope.hash = result.hash;
                    }
                    else{
                        $scope.hash ='pending';
                    }
                    
                    if(result.miner!==undefined){
                        $scope.miner = result.miner;
                    }
                    else{
                        $scope.miner ='pending';
                    }
                    // Miner overwritten
                    //console.log("number: " + number);
                    console.log("result.number: " + result.number);

                    $scope.gasLimit = result.gasLimit;
                    $scope.gasUsed = result.gasUsed;
                    $scope.nonce = result.nonce;
                    //var diff = ("" + result.difficulty).replace(/['"]+/g, '') / 1000000;
                    //$scope.difficulty = diff.toFixed(3) + " M";
                    $scope.difficulty = "" + result.difficulty;
                    $scope.gasLimit = new BigNumber(result.gasLimit).toFormat(0) + " m/s"; // that's a string
                    $scope.gasUsed = new BigNumber(result.gasUsed).toFormat(0) + " m/s";
                    $scope.nonce = result.nonce;
                    $scope.number = result.number;
                    $scope.parentHash = result.parentHash;
                    $scope.uncledata = result.sha3Uncles;
                    $scope.rootHash = result.stateRoot;
                    $scope.blockNumber = result.number;
                    $scope.timestamp = new Date(result.timestamp * 1000).toUTCString();
                    $scope.extraData = result.extraData.slice(2);
                    $scope.dataFromHex = hex2a(result.extraData.slice(2));
                    $scope.size = result.size;
                    $scope.firstBlock = false;
                    $scope.lastBlock = false;
                    if ($scope.blockNumber !== undefined){
                        web3call("eth.blockNumber", function(res) {
                            var number = res;
                            $scope.conf = number - $scope.blockNumber + " Confirmations";
                            if (number === $scope.blockNumber){
                                $scope.conf = 'Unconfirmed';
                                $scope.lastBlock = true;
                            }
                            if ($scope.blockNumber === 0) {
                                $scope.firstBlock = true;
                            }
                       });
                    }

                        if ($scope.blockNumber !== undefined){
                            web3call("eth.getBlock", [$scope.blockNumber], function(result) {
                            var info = JSON.parse(result);
                            if (info !== undefined){
                                var newDate = new Date();
                                newDate.setTime(info.timestamp * 1000);
                                $scope.time = newDate.toUTCString();
                            }
                            });
                        }
                    });

            } else {
                $location.path("/");
            }


            function getBlockInfos(){
                var deferred = $q.defer();

                //web3.eth.getBlock($scope.blockId,function(error, result) {
                //    if(!error){
                //        deferred.resolve(result);
                //    }
                //    else{
                //        deferred.reject(error);
                //    }
                //});
                //return deferred.promise;
                web3call("eth.getBlock", [$scope.blockId], function(result) {
                     deferred.resolve(result);
                });
                return deferred.promise;
                
            }


        };
        $scope.init();

        // parse transactions
        $scope.transactions = []

        /*
        web3.eth.getBlockTransactionCount($scope.blockId, function(error, result){
            var txCount = result;
            $scope.numberOfTransactions = txCount;
            for (var blockIdx = 0; blockIdx < txCount; blockIdx++) {
                web3.eth.getTransactionFromBlock($scope.blockId, blockIdx, function(error, result) {
	                // console.log("Result: ", result);
                    web3.eth.getTransactionReceipt(result.hash, function(error, receipt) {
                        var transaction = {
                            id: receipt.transactionHash,
                            hash: receipt.transactionHash,
                            from: receipt.from,
                            to: receipt.to,
                            gas: receipt.gasUsed,
                            input: result.input.slice(2),
                            value: web3.fromWei(result.value, "ether"),
                            contractAddress: receipt.contractAddress
                        }
                        $scope.$apply(
                            $scope.transactions.push(transaction)
                        );
                    });
                })
            }
            */
        web3call("eth.getBlockTransactionCount", [$scope.blockId], function(result) {
            var txCount = Number(result);
            $scope.numberOfTransactions = txCount;
            for (var blockIdx = 0; blockIdx < txCount; blockIdx++) {
                web3call("eth.getTransactionFromBlock", [$scope.blocakId, blockIdx], function(res) {
                var result = JSON.parse(res);
                web3call(".eth.getTransactionReceipt", [result.hash], function(result) {
                web3call("fromWei", [result.value], function(res) {
                var value = res;
                var receipt = JSON.parse(result);
                var transaction = {
                       id: receipt.transactionHash,
                       hash: receipt.transactionHash,
                       from: receipt.from,
                       to: receipt.to,
                       gas: receipt.gasUsed,
                       input: result.input.slice(2),
                       value: value,
                       contractAddress: receipt.contractAddress
                }
                $scope.$apply(
                     $scope.transactions.push(transaction)
                );
               });
               });
               });
              }
         });

function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));

    return str;
}

// function: String - the name of the method of attribute
// args[]: arguments
async function web3call(web3Func, args) {
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
   console.log(body.result);
   return body.result;
}
});
