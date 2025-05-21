class HomePage {
    constructor(page) {
      this.page = page;
      this.profileButton = page.locator('#profile');
    }
  
    async goToProfile() {
      await this.profileButton.click();
    }
  }
  
  module.exports = HomePage;