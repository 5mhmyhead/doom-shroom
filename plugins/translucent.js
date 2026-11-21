const { withAndroidStyles } = require('expo/config-plugins');

// makes the app window translucent so screens with a transparent background show the app underneath
module.exports = (config) =>
  withAndroidStyles(config, (config) => {
    const theme = config.modResults.resources.style?.find((s) => s.$.name === 'AppTheme');
    if (theme) {
      const drop = ['android:windowIsTranslucent', 'android:windowBackground'];
      theme.item = (theme.item ?? []).filter((i) => !drop.includes(i.$.name));
      theme.item.push({ $: { name: 'android:windowIsTranslucent' }, _: 'true' });
      theme.item.push({ $: { name: 'android:windowBackground' }, _: '@android:color/transparent' });
    }
    return config;
  });