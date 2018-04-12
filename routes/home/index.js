const router = require("koa-router")();

router.get("/", async (ctx, next) => {
	await ctx.render("index", {
		title: "Hello Koa 2!"
	});
});

router.get("/string", async (ctx, next) => {
	const user = await Model.user.query({ where: { id: 1 } }).fetch();
	console.log("user", user);
	ctx.body = "koa2 string";
});

router.get("/json", async (ctx, next) => {
	ctx.body = {
		title: "koa2 json"
	};
});

module.exports = router;
