# Serverless FileServer
This repository contains code for deploying a Serverless FileServer.

The backend is deployed using Amazon EFS, Amazon API Gateway, Amazon Cognito and AWS Lambda.
The frontend is deployed using AWS Amplify.

The solution uses AWS Serverless Application Model (SAM) to deploy resources in to an AWS Account. The AWS Lambda function is written in Python 3.7.

Please refer to  
<a href="https://nivleshc.wordpress.com/2022/07/10/create-a-serverless-fileserver-using-amazon-efs-amazon-api-gateway-amazon-cognito-and-aws-lambda-the-backend/" target="_blank">https://nivleshc.wordpress.com/2022/07/10/create-a-serverless-fileserver-using-amazon-efs-amazon-api-gateway-amazon-cognito-and-aws-lambda-the-backend/</a> for more backend details. <br><br>

<a href="https://nivleshc.wordpress.com/2022/07/24/create-a-serverless-fileserver-using-amazon-efs-amazon-api-gateway-amazon-cognito-and-aws-lambda-the-frontend/" target="_blank">https://nivleshc.wordpress.com/2022/07/24/create-a-serverless-fileserver-using-amazon-efs-amazon-api-gateway-amazon-cognito-and-aws-lambda-the-frontend/</a> for more frontend details.
  
# Backend  
## Preparation
Clone this repository using the following command.
```
git clone https://github.com/nivleshc/blog-serverless-fileserver.git
```
Update Makefile with appropriate values for the following:

**aws_profile** update this with the name of your AWS CLI profile that will be used to deploy the backend into your AWS environment

**aws_s3_bucket** update this with the name of the Amazon S3 bucket where the AWS SAM artefacts will be uploaded to. This Amazon S3 bucket must exist.

**aws_s3_bucket_prefix** update this with the prefix that will be used when storing the artefacts into the Amazon S3 bucket referred to by aws_s3_bucket above. Think of this as the folder name within the Amazon S3 bucket.

**aws_stack_name** update this with the name that should be given to the AWS CloudFormation Stack that will be created by AWS SAM when deploying the backend.

## Commands
For help, run the following command:
```
make
```
To deploy the code in this repository to your AWS account, use the following steps:

```
make package
make deploy
```

If you make any changes to **template.yaml**, first validate the changes by using the following command (validation is not required if you change other files):
```
make validate
```

After validation is successful, use the following command to deploy the changes:
```
make update
```

To delete all resources provisioned in AWS, run the following command. At the prompt, press CTRL+C to abort otherwise any other key to continue with the deletion.
```
make delete
```

# Frontend
Follow the instructions at <a href="https://nivleshc.wordpress.com/2022/07/24/create-a-serverless-fileserver-using-amazon-efs-amazon-api-gateway-amazon-cognito-and-aws-lambda-the-frontend/" target="_blank">https://nivleshc.wordpress.com/2022/07/24/create-a-serverless-fileserver-using-amazon-efs-amazon-api-gateway-amazon-cognito-and-aws-lambda-the-frontend/</a> to deploy the frontend.