import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'evtnet.app',
	appName: 'evtnet',
	webDir: 'build',
	plugins: {
		StatusBar: {
			overlaysWebView: false,
			backgroundColor: '#00b2caff',
			style: 'dark' // or 'light'
		},
		SafeArea: {
			enabled: true,
			customColorsForSystemBars: true,
			statusBarColor: '#00b2ca',
			statusBarContent: 'dark',
			navigationBarColor: '#ffffff',
			navigationBarContent: 'dark',
			offset: 0
		}
  }
};

export default config;
