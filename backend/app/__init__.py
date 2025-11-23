from flask import Flask, jsonify
from .config import config
from .extensions import db, migrate

def create_app(config_name='default'):
    app = Flask(__name__)
    
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    migrate.init_app(app, db)

    from . import models
    
    # Register Blueprints
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    @app.route('/health')
    def health_check():
        try:
            db.session.execute(db.text('SELECT 1'))
            return jsonify({'status': 'healthy', 'db': 'connected'}), 200
        except Exception as e:
            return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

    return app
