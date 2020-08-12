import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { GetObjectRequest, GetObjectOutput } from 'aws-sdk/clients/s3'
import Jimp from 'jimp/es'

const s3 = new AWS.S3()

const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message
        console.log('Processing S3 event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)

        for (const record of s3Event.Records) {
            // "record" is an instance of S3EventRecord
            await processImage(record)
        }
    }
}

// resizes each image
async function processImage(record: S3EventRecord) {
    console.log('processImage ', record)

    const key = record.s3.object.key
    console.log('Resize S3 image with key: ', key)

    const params: GetObjectRequest = {
        Bucket: record.s3.bucket.name,
        Key: key
    }
    console.log('params: ', params)
    const imageToResize: GetObjectOutput = await s3.getObject(params).promise();
    const body = imageToResize.Body
    const image = await Jimp.read(body)
  
    console.log('Resizing image')
    image.resize(150, Jimp.AUTO)
    const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)
  
    console.log(`Writing image back to S3 bucket: ${thumbnailBucketName}`)
    await s3
      .putObject({
        Bucket: thumbnailBucketName,
        Key: `${key}.jpeg`,
        Body: convertedBuffer
      })
      .promise()

}