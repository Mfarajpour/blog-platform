from flask import request, jsonify
from app.extensions import db
from app.models import Post, User
from app.middleware.auth_middleware import token_required
from . import blog_bp
import datetime

@blog_bp.route('/posts', methods=['POST'])
@token_required
def create_post(current_user):
    data = request.get_json()
    
    if not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400
        
    # Simple slug generation
    slug = data['title'].lower().replace(' ', '-')
    
    # Ensure slug is unique
    if Post.query.filter_by(slug=slug).first():
        slug = f"{slug}-{int(datetime.datetime.utcnow().timestamp())}"

    post = Post(
        title=data['title'],
        content=data['content'],
        slug=slug,
        author=current_user
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify(post.to_dict()), 201

@blog_bp.route('/posts', methods=['GET'])
def get_posts():
    # Filter by username (Simulating Tenant)
    username = request.args.get('username')
    
    query = Post.query
    if username:
        user = User.query.filter_by(username=username).first()
        if user:
            query = query.filter_by(user_id=user.id)
        else:
            return jsonify([]), 200

    posts = query.order_by(Post.timestamp.desc()).all()
    return jsonify([post.to_dict() for post in posts]), 200

@blog_bp.route('/posts/<slug>', methods=['GET'])
def get_post(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    return jsonify(post.to_dict()), 200

@blog_bp.route('/posts/<int:id>', methods=['DELETE'])
@token_required
def delete_post(current_user, id):
    post = Post.query.get_or_404(id)
    
    if post.author.id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({'message': 'Post deleted'}), 200
