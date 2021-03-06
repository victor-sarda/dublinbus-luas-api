'use strict';

module.exports = (function() {
  const soap = require('soap');
  const inspect = require('util').inspect;
  const url = 'http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?WSDL';
  const initedPromise = new Promise(function(resolve, reject) {
    soap.createClient(url, function(err, client) {
      if (err) {
        reject(err);
      } else {
        resolve(client);
      }
    });
  });

  return {
    getRouteStops: function(route) {
      return new Promise(function(resolve, reject) {
        initedPromise.then(
          function(client) {
            const args = { 'route': route };
            client.GetStopDataByRoute(args, function(err, result) {
              if (err) {
                reject(err);
              } else if (!result.GetStopDataByRouteResult.diffgram) {
                reject('NODATA');
              } else {
                resolve({
                  route: route,
                  stops: result.GetStopDataByRouteResult.diffgram.StopDataByRoute
                });
              }
            });
          },
          function(e) {
            console.error(inspect(e));
          }
        );
      });
    },
    getStopTimes: function(stopId) {
      return new Promise(function(resolve, reject) {
        initedPromise.then(
          function(client) {
            const args = { 'stopId': stopId, 'forceRefresh': '1' };
            client.GetRealTimeStopData(args, function(err, result) {
              if (err) {
                reject(err);
              } else if (!result.GetRealTimeStopDataResult.diffgram) {
                resolve({
                  stopId: stopId,
                  departures: []
                })
              } else {
                const stopData = result.GetRealTimeStopDataResult.diffgram.DocumentElement.StopData;
                const response = {
                  stopId: stopId,
                  departures: stopData.length ? stopData : [ stopData ]
                };
                resolve(response);
              }
            });
          },
          function(e) {
            console.error(inspect(e));
          }
        );
      });
    }
  };

}());
