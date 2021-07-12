import S3 from 'aws-sdk/clients/s3'
import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from 'aws-lambda';

// forma de llamar variables de ambiente
const bucketName = process.env.DOCUMENTS_BUCKET_NAME
const s3 = new S3();

export const getDocuments = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  //console.log('event 👉', event);
  console.log(`Bucket Name: ${bucketName}`);
  
  try {   
    
    const { Contents:results} = await s3.listObjects({Bucket:bucketName! }).promise()
    const documents = await Promise.all(results!.map(async r => generateSignedURL(r)))
    return {
      body: JSON.stringify(documents),
      statusCode: 200,
    }
  } catch (err){
      return {   
        statusCode: 500,
        body: err.message
      }
    }
}

const generateSignedURL = async(object:S3.Object):Promise<{filename:string ,url:string}> =>{
const url = await s3.getSignedUrlPromise('getObject',{
  Bucket: bucketName,
  Key: object.Key!,
  Expires: (60*60)//1 hour
})
  return{
    filename:object.Key!,
    url:url
  }
}