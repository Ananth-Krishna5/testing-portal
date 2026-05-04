describe("smoke", () => {
  it("loads", () => {
    cy.visit("https://example.com");
    cy.contains("Example").should("exist");
  });
});
