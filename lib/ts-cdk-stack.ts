import * as cdk from '@aws-cdk/core';
import { Bucket,BucketEncryption } from '@aws-cdk/aws-s3';
import { Network } from './networking';
import { Tags } from '@aws-cdk/core';
import {DocumentManagementAPI } from './api';
import * as s3Deploy  from '@aws-cdk/aws-s3-deployment';
import * as path from 'path';


export class TsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'DocumentBucket', {
      encryption: BucketEncryption.S3_MANAGED
  });

  new s3Deploy.BucketDeployment(this,'DocumentsDeployment',{
    sources:[
      s3Deploy.Source.asset(path.join(__dirname,'..','documents'))
    ],
    destinationBucket:bucket,
    memoryLimit:512
  })

  new cdk.CfnOutput(this,'DocumentBucketExportName',{
    value: bucket.bucketName,
    exportName: 'DocumentBucketName'
  });

  const networkingStack = new Network(this,'NetworkingConstructor',{
    maxAzs:2
  })

  Tags.of(networkingStack).add('Module','Networking');


  const api = new DocumentManagementAPI(this,'DocumentManagementAPI',{
    documentBucket:bucket
  });

  Tags.of(api).add('Module','API');

  }
}
