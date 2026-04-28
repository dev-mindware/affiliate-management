import boto3
from botocore.config import Config
from app.config import settings
from fastapi import UploadFile
import uuid
import os

class StorageService:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version='s3v4')
        )
        self.bucket = settings.S3_BUCKET

    async def upload_file(self, file: UploadFile, folder: str = "proofs") -> str:
        """
        Uploads a file to Cloudflare R2 and returns the public URL.
        """
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"
        
        # Reset file pointer just in case
        await file.seek(0)
        content = await file.read()
        
        self.s3.put_object(
            Bucket=self.bucket,
            Key=unique_filename,
            Body=content,
            ContentType=file.content_type
        )
        
        # Construct the URL. Note: R2 URLs depend on how the bucket is exposed.
        # Assuming the endpoint is the public one or follows the pattern.
        # Often it's https://<bucket>.<account-id>.r2.cloudflarestorage.com/<key>
        # but the user provided S3_ENDPOINT which might be the custom domain or the R2 API endpoint.
        
        # If it's the API endpoint, we might need a separate PUBLIC_URL setting.
        # For now, we'll return the endpoint + filename as a placeholder.
        return f"{settings.S3_ENDPOINT}/{self.bucket}/{unique_filename}"

storage_service = StorageService()
