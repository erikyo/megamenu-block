# WordPress Mega Menu Block (Enhanced Edition)

This repository is an optimized and modernized fork of the original Mega Menu block. It has been significantly refactored to align with the latest WordPress Core standards, focusing on pure server-side rendering, flawless SEO crawlability, and native Gutenberg editor integrations. 

*If you are looking for the original repository, please visit:*
- [Original Mega Menu Block Git Repo](https://github.com/motopress/getwid-megamenu)
- [Original WordPress Plugin Page](https://motopress.com/products/wordpress-mega-menu-block/)

---

## 🚀 What's New in This Release

This version introduces a ground-up architectural rebuild to maximize performance and modernize the editor experience.

### 1. 100% SEO-Optimized Server-Side Rendering
The asynchronous REST API fetching architecture has been completely replaced with a native **Server-Side Dynamic Block** pattern. The entire hierarchical tree of your submenu links is now fully rendered in the semantic HTML payload on the initial page load. 
* **Benefits:** Perfect SEO crawlability, completely eliminates Cumulative Layout Shift (CLS), and dramatically improves initial render speeds.

### 2. Native Gutenberg Block Supports
Custom, legacy inspector controls have been stripped out in favor of WordPress Core's native Block Supports (`theme.json` compliant). 
* Gain seamless access to native Core controls for **Flex Layout**, **Typography**, **Spacing (Margin/Padding)**, and **Colors**.
* A cleaner, lighter editor UI that looks and acts exactly like native core blocks.

### 3. Advanced Alignment & Flex Justification
Menu alignment is no longer a rigid custom attribute. You now have granular control using native tools:
* **Parent Layout Justification:** Control the horizontal alignment of all menu items (Left, Center, Right, Space Between) using the native Flex layout toolbar.
* **Granular Text Alignment:** Apply native text alignment (Left, Center, Right) to individual menu links or cascade them globally from the parent block. CSS natively maps `.has-text-align-*` classes to internal flex wrappers for pixel-perfect positioning.

### 4. Unlocked Dropdown Block Nesting
The Mega Menu dropdown is now a true layout canvas. The rigid restrictions have been lifted, allowing you to nest rich Core layout blocks directly inside your submenus.
* **Supported Blocks Include:** Columns, Groups, Spacers, Paragraphs, Search, Social Links, Buttons, Lists, and Headings.

### 5. Seamless Backward Compatibility
Upgrading from older, static versions of this plugin will not break your site. A robust Gutenberg **Deprecation Migration Path** has been implemented. Older static HTML menus are safely scraped and automatically upgraded to the new dynamic structure without losing text or triggering block validation errors.

---

## ✨ Core Features

* **Visual Drag & Drop Interface:** Build complex mega menus directly inside the Gutenberg Block Editor without touching any code.
* **Responsive & Mobile Ready:** Automatic mobile toggle (Hamburger menu) with customizable breakpoints.
* **Custom Triggers:** Choose between `Hover` or `Click` events to reveal dropdown content.
* **Flexible Dropdown Widths:** Set dropdowns to match the container width, the window width, or a custom maximum pixel width.
* **Inherits Theme Styles:** Because it utilizes native WordPress wrapper attributes, the menu effortlessly inherits your active block theme's typography, colors, and shadows.

---

## 🛠️ Installation & Usage

1. Download the plugin folder and upload it to your `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Open the Block Editor on any page, post, or template.
4. Search for **Mega Menu** in the block inserter and add it to your layout.
5. Add **Menu Items**, and click the `+` icon inside their dropdown wrappers to start building out your rich mega menu content with columns, images, and links.

---

## 💻 Development

To modify the source code and recompile the block assets:

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run start` for active development and hot-reloading.
4. Run `npm run build` to compile production-ready assets. 

```