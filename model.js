const _knex = require("knex");
const config = require("./config");
const _bookshelf = require("bookshelf");
const paranoia = require("bookshelf-paranoia");
const cache = require("./lib/bookshelf/cache");
const pagination = require("./lib/bookshelf/pagination");
const visibility = require("./lib/bookshelf/visibility");

const getBookshelf = connection => {
	const knex = _knex(connection);
	const bookshelf = _bookshelf(knex);

	// bookshelf.plugin(visibility);
	// bookshelf.plugin(pagination);
	// bookshelf.plugin(paranoia);
	bookshelf.plugin(cache);

	return bookshelf;
};
const bookshelf = getBookshelf({
	client: "mysql",
	connection: config.mysql
});

const Models = {
	user: bookshelf.Model.extend({
		tableName: "koa_demo.user"
	})
};

module.exports = {
	Models
};
