import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError


class R2Storage:
    def __init__(self) -> None:
        endpoint_url = os.getenv("R2_ENDPOINT_URL")
        access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        bucket_name = os.getenv("R2_BUCKET_NAME")

        if not endpoint_url:
            raise RuntimeError("Falta R2_ENDPOINT_URL")

        if not access_key_id:
            raise RuntimeError("Falta R2_ACCESS_KEY_ID")

        if not secret_access_key:
            raise RuntimeError("Falta R2_SECRET_ACCESS_KEY")

        if not bucket_name:
            raise RuntimeError("Falta R2_BUCKET_NAME")

        self.bucket_name = bucket_name

        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name="auto",
        )

    def upload_file(self, local_path: str, object_key: str) -> None:
        try:
            self.client.upload_file(
                local_path,
                self.bucket_name,
                object_key,
            )
        except (BotoCoreError, ClientError) as exc:
            raise RuntimeError(
                f"No se pudo subir el archivo a R2: {object_key}"
            ) from exc

    def download_file(self, object_key: str, local_path: str) -> None:
        try:
            self.client.download_file(
                self.bucket_name,
                object_key,
                local_path,
            )
        except (BotoCoreError, ClientError) as exc:
            raise RuntimeError(
                f"No se pudo descargar el archivo desde R2: {object_key}"
            ) from exc

    def delete_file(self, object_key: str) -> None:
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key,
            )
        except (BotoCoreError, ClientError) as exc:
            raise RuntimeError(
                f"No se pudo borrar el archivo de R2: {object_key}"
            ) from exc

    def file_exists(self, object_key: str) -> bool:
        try:
            self.client.head_object(
                Bucket=self.bucket_name,
                Key=object_key,
            )
            return True
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code")
            if error_code in ("404", "NoSuchKey", "NotFound"):
                return False
            raise RuntimeError(
                f"No se pudo comprobar el archivo en R2: {object_key}"
            ) from exc
        except BotoCoreError as exc:
            raise RuntimeError(
                f"No se pudo comprobar el archivo en R2: {object_key}"
            ) from exc