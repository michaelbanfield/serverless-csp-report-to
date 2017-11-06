'use strict';


const AWS = require('aws-sdk');

const firehose = new AWS.Firehose();

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