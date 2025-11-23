import boto3
import json
import os
from botocore.exceptions import NoCredentialsError

class S3Client:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            endpoint_url=os.getenv('S3_ENDPOINT'),
            aws_access_key_id=os.getenv('S3_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('S3_SECRET_KEY'),
            region_name=os.getenv('S3_REGION')
        )
        self.bucket = os.getenv('S3_BUCKET')
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            self.s3.head_bucket(Bucket=self.bucket)
        except:
            # Create bucket if not exists
            self.s3.create_bucket(Bucket=self.bucket)
            
            # Set public policy (Read-only for everyone)
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicRead",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{self.bucket}/*"]
                    }
                ]
            }
            self.s3.put_bucket_policy(Bucket=self.bucket, Policy=json.dumps(policy))

    def upload_file(self, file_obj, filename, content_type):
        try:
            self.s3.upload_fileobj(
                file_obj,
                self.bucket,
                filename,
                ExtraArgs={'ContentType': content_type}
            )
            # Return the public URL
            return f"{os.getenv('S3_ENDPOINT')}/{self.bucket}/{filename}"
        except NoCredentialsError:
            return None
        except Exception as e:
            print(f"S3 Upload Error: {e}")
            return None
