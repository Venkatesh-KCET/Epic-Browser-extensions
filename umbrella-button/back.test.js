const rewire = require("rewire")
const back = rewire("./back")
const pageLoaded = back.__get__("pageLoaded")
// @ponicode
describe("pageLoaded", () => {
    test("0", () => {
        pageLoaded()
    })
})
