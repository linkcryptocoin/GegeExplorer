angular.module('ethExplorer')
    .controller('transactionInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

        $scope.init=function()
        {


            $scope.txId=$routeParams.transactionId;




            if($scope.txId!==undefined) { // add a test to check if it match tx paterns to avoid useless API call, clients are not obliged to come from the search form...

                getTransactionInfos()
                    .then(function(result){
                        //TODO Refactor this logic, asynchron calls + services....

                    $scope.result = result;

                    if(result.blockHash!==undefined){
                        $scope.blockHash = result.blockHash;
                    }
                    else{
                        $scope.blockHash ='pending';
                    }
                    if(result.blockNumber!==undefined){
                        $scope.blockNumber = result.blockNumber;
                    }
                    else{
                        $scope.blockNumber ='pending';
                    }
                    $scope.from = result.from;
                    $scope.gas = result.gas;
                    //$scope.gasPrice = result.gasPrice.c[0] + " WEI";
                    web3call("fromWei", [result.gasPrice], function(result) {
                       $scope.gasPrice = result.toFormat(10) + " LKG";
                    });
                    $scope.hash = result.hash;
                    $scope.input = result.input; // that's a string
                    $scope.nonce = result.nonce;
                    $scope.to = result.to;
                    $scope.transactionIndex = result.transactionIndex;
                    //$scope.ethValue = web3.fromWei(result.value[0], "ether"); Newer method but has ""
                    $scope.ethValue = result.value.c[0] / 10000;
                    web3call("fromWei", [result.gas * result.gasPrice], function(result) {
                    $scope.txprice = result + " LKG";
                    });
                    if($scope.blockNumber!==undefined){
                        web3call("eth.blockNumber", function(result) {
                        var number = result;
                        $scope.conf = number - $scope.blockNumber;
                        if($scope.conf===0){
                            $scope.conf='unconfirmed'; //TODO change color button when unconfirmed... ng-if or ng-class
                        }
                        }) 
                    }
                        //TODO Refactor this logic, asynchron calls + services....
                    if($scope.blockNumber!==undefined){
                        web3call("eth.getBlock", [$scope.blockNumber], function(result) {
                        var info = JSON.parse(result);
                        if(info!==undefined){
                            $scope.time = info.timestamp;
                        }
                        })
                    }

                });

            }



            else{
                $location.path("/"); // add a trigger to display an error message so user knows he messed up with the TX number
            }


            function getTransactionInfos(){
                var deferred = $q.defer();

                //web3.eth.getTransaction($scope.txId,function(error, result) {
                //    if(!error){
                //        deferred.resolve(result);
                //    }
                //    else{
                //        deferred.reject(error);
                //    }
                //});
                //return deferred.promise;
                web3call("eth.getTransaction", [$scope.txId], function(result) {
                    deferred.resolved(result);
                });
                return deferred.promise;
            }



        };
        $scope.init();
        console.log($scope.result);
// function: String - the name of the method of attribute
// args[]: arguments
async function web3call(web3Func, args) {
   const api_path = "https://lonkgear.net:8091/auth/local/web3call";
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
