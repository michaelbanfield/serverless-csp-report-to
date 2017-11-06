# Serverless CSP Report To

Run a CSP violation reporting server with no dedicated infrastructure. Query the reports in S3 using AWS Athena.

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

The run

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
python csp_server.py $(aws cloudformation describe-stacks --query "Stacks[0].Outputs[0].OutputValue" --output text --stack-name TestStack)
```

Visit http://localhost:31338/ from your browser, this should generate some reports

Wait for around 60 seconds then go to the Glue AWS console, press on Crawlers, tick csp_reports_crawler and select Run Crawler

Once this is finished you can go to the Athena Console and run

```
SELECT * FROM "csp_reports"."v1" limit 10;

```
