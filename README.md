# Serverless CSP Report To

Serverless CSP violation reporting server that streams reports to a S3 data lake, and enables easy querying using Athena.

This application has the following components

* A simple API Gateway endpoint that accepts CSP violations
* Validates and cleans submitted reports
* Publishes the reports to Kinesis Firehose
* Batch writes the reports into S3
* Creates a AWS Glue table on top of the S3 data for simple querying through Athena

# Usage

This application uses AWS SAM, a simple framework for deploying serverless applications

## Prerequisites
* AWS CLI
* Local IAM user with permissions for cloudformation etc

First clone this repository

```
git clone git@github.com:michaelbanfield/serverless-csp-report-to.git
```

Then create an S3 bucket to store the code

Then run

```
aws cloudformation package \
    --template-file template.yaml \
    --s3-bucket <bucket-you-just-created> \
    --output-template-file packaged-template.yaml

aws cloudformation deploy --template-file /Users/michaelbanfield/dev/js/serverless-csp-report-to/packaged-template.yaml --stack-name CSPReporter --capabilities CAPABILITY_IAM
```

Once cloudformation finishes you can get the CSP url with this command

```
aws cloudformation describe-stacks --query "Stacks[0].Outputs[0].OutputValue" --output text --stack-name CSPReporter
```

Then just simply add this URL to the report-to/report-uri section of your CSP header

## Trying it out

Optionally to test this out quickly with some real data

```
cd example
python csp_server.py $(aws cloudformation describe-stacks --query "Stacks[0].Outputs[0].OutputValue" --output text --stack-name CSPReporter)
```

Visit http://localhost:31338/ from your browser, this should generate some reports

Wait for around 60 seconds then go to the Glue AWS console, press on Crawlers, tick csp_reports_crawler and select Run Crawler

Once this is finished you can go to the Athena Console and run

```
SELECT * FROM "csp_reports"."v1" limit 10;

```

From here you can explore the data using standard SQL.

# Next Steps

## Cost
For cost saving purposes the Glue crawler has no schedule defined, the monthly cost of an hourly crawler (~$50) is not really warranted for most use cases.

This means you cant take advantage of partitions, which can make your queries much faster and cheaper for larger datasets (ie if you only need reports from a particular hour, you only pay for scanning that hour). If you would rather take advantage of partitions, just set up a schedule that works for you from the Glue console. Hourly will ensure you can always query the latest data.

If you would rather save money, and your dataset is fairly small, you will need to manually delete the partition_0, partition_1 etc columns manually through the Glue console.

The rest of the application should be low/no cost, especially on the free tier. You should still keep an eye on your AWS bill, setting an alarm or similar as the report URL is unauthenticated, and you could recieve malicious traffic driving up the various costs.

A further cost saving would be dialing up the buffer variables (size and time) in kinesis firehose to the maximum. This can be done through the UI or template.yaml.

Finally settings up a lifecycle rule to delete reports after X days is a simple way to reduce cost.

## Table improvements

Glue cant detect that the timestamp field is a timestamp, to enable date functions on this field just manually change the datatype to TIMESTAMP in the Glue console.


# TODO/Improvements

* Switch from GZIP to Snappy compression, this is better for a data lake however Glue cant seem to scan it correctly
* Move from a crawler to a table defined in cloud formation - this would solve the snappy problem as well as some other limitations


