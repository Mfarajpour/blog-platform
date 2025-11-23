from flask import request, jsonify
from werkzeug.utils import secure_filename
from app.middleware.auth_middleware import token_required
from app.utils.s3_client import S3Client
from . import upload_bp
import uuid
import os

# Initialize S3 Client once
s3_client = S3Client()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/', methods=['POST'])
@token_required
def upload_file(current_user):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        # Generate unique filename to prevent overwrite
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        file_url = s3_client.upload_file(
            file, 
            unique_filename, 
            file.content_type
        )
        
        if file_url:
            return jsonify({
                'message': 'File uploaded successfully',
                'url': file_url
            }), 201
        else:
            return jsonify({'error': 'Upload failed'}), 500
            
    return jsonify({'error': 'File type not allowed'}), 400
