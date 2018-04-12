const Koa = require("koa");
const glob = require("glob");
const app = new Koa();
const _ = require("lodash");
const path = require("path");
const Router = require("koa-router");
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const config = require("./config");
const model = require("./model");
const pkg = require("./package.json");
const moment = require("moment");
const router = new Router();

global.Model = model.Models;

// error handler
onerror(app);

// middlewares
app.use(
	bodyparser({
		enableTypes: ["json", "form", "text"]
	})
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
	views(__dirname + "/views", {
		extension: "pug"
	})
);
// error-handling
app.on("error", (err, ctx) => {
	console.error("server error", err, ctx);
});
// logger
app.use(async (ctx, next) => {
	const start = new Date();
	await next();
	const ms = new Date() - start;
	console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 加载路由
const routes = glob.sync("**/*.js", {
	cwd: "./routes"
});

for (const key in routes) {
	if (!_.includes(config.routes, routes[key].replace(/\\/g, "/"))) {
		config.routes.push(routes[key].replace(/\\/g, "/"));
	}
}
// 路由排序
for (const key in config.routes) {
	const route = require(path.resolve("./routes", config.routes[key]));
	if (route instanceof Router) {
		router.use(
			path
				.join("/", path.dirname(config.routes[key]))
				.replace(/\\/g, "/"),
			route.routes()
		);
	}
}
app.use(router.routes());
app.use(router.allowedMethods());
const server = app.listen(config.port, () => {
	const date = moment().format("YYYY-MM-DD HH:mm:ss");
	console.log(`[${date}] Version: ${pkg.version}`);
	console.log(`[${date}] [BaaS] Nodejs Version: ${process.version}`);
	console.log(
		`[${date}] Nodejs Platform: ${process.platform} ${process.arch}`
	);
	console.log(`[${date}] Server Enviroment: ${app.env}`);
	console.log(`[${date}] Server running at: http://127.0.0.1:${config.port}`);
});

module.exports = app;
