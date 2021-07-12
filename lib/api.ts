import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import {Runtime} from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as path from 'path';
import * as iam from '@aws-cdk/aws-iam';
import * as apig from '@aws-cdk/aws-apigatewayv2';
import {LambdaProxyIntegration} from '@aws-cdk/aws-apigatewayv2-integrations'

export interface DocumentManagementAPIProps {
    // props es una variable que querramos pasar
    documentBucket:s3.IBucket;
}

export class DocumentManagementAPI extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: DocumentManagementAPIProps) {
    super(scope, id);

        //Creacion de la lambda
        const getDocumentsFunction = new lambda.NodejsFunction(this,'GetDocumentsFunction',{
            runtime: Runtime.NODEJS_14_X,
            entry: path.join(__dirname,'..','api','getDocuments','index.ts'),
            handler: 'getDocuments',
            bundling: {
                externalModules: [
                  'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime                  
                ],
              },
              environment:{  //creacion de variable 
                  DOCUMENTS_BUCKET_NAME: props.documentBucket.bucketName
              }
        })

        const bucketPermissions = new iam.PolicyStatement();
        bucketPermissions.addResources(`${props.documentBucket.bucketArn}/*`);
        bucketPermissions.addActions('s3:GetObject','s3:PutObject')
        getDocumentsFunction.addToRolePolicy(bucketPermissions)

        
        const bucketContainerPermissions = new iam.PolicyStatement();
        bucketContainerPermissions.addResources(props.documentBucket.bucketArn);
        bucketContainerPermissions.addActions('s3:ListBucket')
        getDocumentsFunction.addToRolePolicy(bucketContainerPermissions)


        const httpApi = new apig.HttpApi(this,'HttpAPI',{
          apiName: 'document-management-api',
          createDefaultStage:true,
          corsPreflight: {            
            allowOrigins: ['*'],
            allowMethods: [apig.CorsHttpMethod.GET],
            maxAge: cdk.Duration.days(10),
          }
        })

        const Lambdaintegration = new LambdaProxyIntegration({
          handler:getDocumentsFunction
        });

        httpApi.addRoutes({
          path:'/getDocuments',
          methods:[
            apig.HttpMethod.GET
          ],
          integration: Lambdaintegration          
        });

        new cdk.CfnOutput(this,'APIEndPoint',{
          value: httpApi.url!,
          exportName: 'ApiEndPoint'
        });
    
  }
}