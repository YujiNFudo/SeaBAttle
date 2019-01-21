var mongoose = require('mongoose');

var state = {
	db: null
};

exports.connect = function(url, done) {
	if (state.db) {
		return done();
	}

	mongoose.connect("mongodb://admin:qwerty123@ds251894.mlab.com:51894/questionstempl", function(err,database) {
		if (err) {
			return done(err);
		}
		db = database;

		state.db = db;
		done();
	})
}

exports.get = function() {
	return state.db;
}