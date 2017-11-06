'use strict';


const AWS = require('aws-sdk');

const firehose = new AWS.Firehose();

function js_yyyy_mm_dd_hh_mm_ss () {
  var now = new Date();
  var year = "" + now.getFullYear();
  var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

exports.report = (event, context, callback) => {

    const body = JSON.parse(event.body)["csp-report"];


    //APIg doesnt seem to support blocking requests with extra fields, so pick out the important fields here
    //and camelcase them so they are easier to query
    const cspReport = {}

    cspReport.documentUri = body["document-uri"];
    cspReport.violatedDirective = body["violated-directive"];
    cspReport.effectiveDirective = body["effective-directive"];
    cspReport.originalPolicy = body["original-policy"];
    cspReport.blockedUri = body["blocked-uri"];
    cspReport.statusCode = body["status-code"];
    cspReport.timestamp = js_yyyy_mm_dd_hh_mm_ss();


    const params = {
        DeliveryStreamName: "CSPReports",
        Record: {
            Data: JSON.stringify(cspReport) + "\n"
        }
    }

    firehose.putRecord(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } 
        else {
            console.log(data);
        }

        //Fail silently
        callback(null, {
            statusCode: 200
        });
    });
    
};