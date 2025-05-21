class LoginPage {
  constructor(page, config) {
    this.page = page;
    this.config = config; // Store the config

    //selectors
    this.emailTextbox = page.locator('input[name="email"]');
    this.passwordTextbox = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    
  }

  // Method to perform login using values from the config file
  async login() {
    await this.emailTextbox.click();
    await this.emailTextbox.fill(this.config.credentials.username); // Use username from config
    await this.passwordTextbox.fill(this.config.credentials.password); // Use password from config
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
