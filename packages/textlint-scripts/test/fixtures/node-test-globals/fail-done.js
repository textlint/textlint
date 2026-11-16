describe("callback", () => {
    it("done with error", function (done) {
        setTimeout(() => done(new Error("done error")), 1);
    });
});
