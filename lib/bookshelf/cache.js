const _ = require("lodash");

module.exports = function(bookshelf) {
    const modelPrototype = bookshelf.Model.prototype;
    const collectionPrototype = bookshelf.Collection.prototype;

    bookshelf.Collection = bookshelf.Collection.extend({
        initialize: function() {
            collectionPrototype.initialize.call(this);

            this.on("fetching", (collection, columns, options) => {});
            this.on("counting", (collection, options) => {});
        }
    });

    bookshelf.Model = bookshelf.Model.extend({
        destroy: async function(options = {}) {
            if (options.withRedisKey) {
                await BaaS.redis.delAll(options.withRedisKey);
            }
            return modelPrototype.destroy.call(this).then(res => {
                return res ? res.serialize() : "";
            });
        },

        save: async function(options = {}) {
            if (options.withRedisKey) {
                await BaaS.redis.delAll(options.withRedisKey);
            }
            return modelPrototype.save.call(this).then(res => {
                return res ? res.serialize() : "";
            });
        },

        fetch: async function(options = {}) {
            if (options.withRedisKey) {
                const cache = await BaaS.redis.cache(options.withRedisKey);
                if (!_.isNil(cache)) {
                    return cache;
                } else {
                    return modelPrototype.fetch
                        .call(this, options)
                        .then(res => {
                            return res ? res.serialize() : "";
                        })
                        .then(res => {
                            BaaS.redis.cache(options.withRedisKey, res);
                            return res;
                        });
                }
            }
            return modelPrototype.fetch.call(this, options).then(res => {
                return res ? res.serialize() : "";
            });
        },

        fetchNoCache: async function(options = {}) {
            return modelPrototype.fetch.call(this, options);
        },

        fetchAll: async function(options = {}) {
            if (options.withRedisKey) {
                const cache = await BaaS.redis.cache(options.withRedisKey);
                if (!_.isNil(cache)) {
                    return cache;
                } else {
                    return modelPrototype.fetchAll
                        .call(this, options)
                        .then(res => {
                            return res.serialize();
                        })
                        .then(res => {
                            BaaS.redis.cache(options.withRedisKey, res);
                            return res;
                        });
                }
            }
            return modelPrototype.fetchAll.call(this, options).then(res => {
                return res.serialize();
            });
        },

        fetchAllNoCache: async function(options = {}) {
            return modelPrototype.fetchAll.call(this, options);
        },

        fetchPage: async function(options = {}) {
            if (options.withRedisKey) {
                const cache = await BaaS.redis.cache(options.withRedisKey);
                if (!_.isNil(cache)) {
                    return cache;
                } else {
                    return modelPrototype.fetchPage
                        .call(this, options)
                        .then(res => {
                            return {
                                data: res,
                                pagination: res.pagination
                            };
                        })
                        .then(res => {
                            BaaS.redis.cache(options.withRedisKey, res);
                            return res;
                        });
                }
            }
            return modelPrototype.fetchPage.call(this, options).then(res => {
                return {
                    data: res,
                    pagination: res.pagination
                };
            });
        },

        fetchPageNoCache: async function(options = {}) {
            return modelPrototype.fetchPage.call(this, options);
        }
    });
};
