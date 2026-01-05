// Storage wrapper for localStorage

const Storage = {
  // Keys
  KEYS: {
    USERS: "aandelending_users",
    CURRENT_USER: "aandelending_current_user",
    SETTINGS: "aandelending_settings",
  },

  // Get all users
  getUsers() {
    const data = localStorage.getItem(this.KEYS.USERS);
    return data ? JSON.parse(data) : {};
  },

  // Get a specific user
  getUser(username) {
    const users = this.getUsers();
    return users[username] || null;
  },

  // Save user data
  saveUser(username, userData) {
    const users = this.getUsers();
    users[username] = userData;
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  },

  // Delete a user
  deleteUser(username) {
    const users = this.getUsers();
    delete users[username];
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  },

  // Get current logged in user
  getCurrentUser() {
    return localStorage.getItem(this.KEYS.CURRENT_USER);
  },

  // Set current user
  setCurrentUser(username) {
    localStorage.setItem(this.KEYS.CURRENT_USER, username);
  },

  // Clear current user (logout)
  clearCurrentUser() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
  },

  // Get global settings
  getSettings() {
    const data = localStorage.getItem(this.KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  // Save global settings
  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Create new user with initial data
  createUser(username) {
    const settings = Settings.getDefaults();
    const userData = {
      username,
      balance: settings.startingBalance,
      initialBalance: settings.startingBalance,
      portfolio: {}, // { symbol: { quantity, averagePrice, totalInvested } }
      transactions: [],
      createdAt: new Date().toISOString(),
    };
    this.saveUser(username, userData);
    return userData;
  },

  // Reset user account
  resetUser(username) {
    const settings = Settings.get();
    const userData = this.getUser(username);
    if (userData) {
      userData.balance = settings.startingBalance;
      userData.initialBalance = settings.startingBalance;
      userData.portfolio = {};
      userData.transactions = [];
      this.saveUser(username, userData);
    }
    return userData;
  },
};
