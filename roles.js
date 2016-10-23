var db = require('./db');

exports.checkRole = function(roles){
    return function(req, res, next){
        var user = req.user;
        db.get().query('SELECT * FROM users WHERE username = ? LIMIT 1', [user.username], function(err, rows) {
            if(err){
				res.status(422).json({error: 'No user found.'});
				return next(err);
			}
            var foundUser = rows[0];
            if(roles.indexOf(foundUser.role) > -1){
				return next();
			}
            db.get().query('SELECT * FROM todos WHERE id=? AND username=?', [req.params.id, user.username], function(err, rows) {
                if(err){
                    res.status(401).json({error: 'You are not authorized to do this action.'});
			        return next('Unauthorized');
			    }
                return next();
            });
        });
    }
}
