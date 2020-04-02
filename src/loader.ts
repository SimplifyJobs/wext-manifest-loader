/**
 *  @author abhijithvijayan <abhijithvijayan.in>
 */

import loaderUtils from 'loader-utils';

const LOADER_NAME = 'wext-manifest-loader';
const browserVendors: string[] = ['chrome', 'firefox', 'opera', 'edge'];
const vendorRegExp = new RegExp(`^__((?:(?:${browserVendors.join('|')})\\|?)+)__(.*)`);

// Fork of `webextension-toolbox/webpack-webextension-plugin`
const transformVendorKeys = (manifest, vendor: string) => {
	if (Array.isArray(manifest)) {
		return manifest.map((newManifest) => {
			return transformVendorKeys(newManifest, vendor);
		});
	}

	if (typeof manifest === 'object') {
		return Object.entries(manifest).reduce((newManifest, [key, value]) => {
			const match = key.match(vendorRegExp);

			if (match) {
				const vendors: string[] = match[1].split('|');

				// Swap key with non prefixed name
				if (vendors.indexOf(vendor) > -1) {
					newManifest[match[2]] = value;
				}
			} else {
				newManifest[key] = transformVendorKeys(value, vendor);
			}

			return newManifest;
		}, {});
	}

	return manifest;
};

export default function loader(source): string | Error {
	if (this.cacheable) {
		this.cacheable();
	}

	let content = {};
	// parse JSON
	if (typeof source === 'string') {
		try {
			content = JSON.parse(source);
		} catch (err) {
			this.emitError(err instanceof Error ? err : new Error(err));
		}
	}

	// get vendor name from env TARGET_BROWSER
	const vendor: string | undefined = process.env.TARGET_BROWSER;

	if (vendor) {
		// vendor not in list
		if (browserVendors.indexOf(vendor) < 0) {
			this.emitError(new Error(`${LOADER_NAME}: browser ${vendor} is not supported`));
		}
	} else {
		this.emitError(new Error(`${LOADER_NAME}: TARGET_BROWSER variable missing`));
	}

	// Transform manifest
	const manifest = transformVendorKeys(content, vendor);
	// ToDo: if EXTENSION_VERSION exist in env, update version field

	const outputPath: string = loaderUtils.interpolateName(this, 'manifest.json', { source });
	const publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

	// separators \u2028 and \u2029 are treated as a new line in ES5 JavaScript and thus can break the entire JSON
	const formattedJson: string = JSON.stringify(manifest, null, 2)
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');

	// emit file content
	this.emitFile(outputPath, formattedJson);

	return `module.exports = ${publicPath};`;
}
