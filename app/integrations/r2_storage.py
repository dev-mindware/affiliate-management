import boto3
from botocore.client import Config
from app.config import settings

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name=settings.S3_REGION
    )

def upload_file_to_r2(file_content, object_name, content_type):
    s3 = get_s3_client()
    s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=object_name,
        Body=file_content,
        ContentType=content_type
    )
    return f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{object_name}"

def generate_presigned_url(object_name, expiration=3600):
    s3 = get_s3_client()
    url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': settings.S3_BUCKET, 'Key': object_name},
        ExpiresIn=expiration
    )
    return url
