import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib';

export class ApiS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiBucket = new s3.Bucket(this, 's3bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const executeRole = new iam.Role(this, 'executeRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    })

    executeRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:putObject'],
      resources: [`${apiBucket.bucketArn}/*`],
    })
    )

    const api = new apigateway.RestApi(this, 'api', {
      restApiName: 'S3 API',
      description: 'This service serves S3 buckets',
      binaryMediaTypes: ['*/*'],

    })

    const s3Integration = new apigateway.AwsIntegration({
      service: 's3',
      integrationHttpMethod: 'PUT',
      path: `{bucket}/{key}`,
      options: {
        requestParameters: {
          "integration.request.path.bucket": "method.request.path.bucket",
          "integration.request.path.key": "method.request.path.key",
        },
        credentialsRole: executeRole,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": "integration.response.header.Content-Type",
            },
          }
        ]
      },
    })

    api.root.addResource('{bucket}').addResource('{key}').addMethod('PUT', s3Integration, {
      requestParameters: {
        'method.request.path.bucket': true,
        'method.request.path.key': true,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
          }
        }
      ]
    }
    )

    new CfnOutput(this, 'apiEndpointRequest', {
      value: `${api.url}${apiBucket.bucketName}/`,
      description: 'API endpoint for requests'
    })

  }
}
