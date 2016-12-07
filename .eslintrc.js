module.exports = {
  extends: ['airbnb'],

  env: {
    browser: true,
  },

  rules: {
    'jsx-quotes': ['error', 'prefer-single'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};
