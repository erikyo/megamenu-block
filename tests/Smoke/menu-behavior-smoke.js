/**
 * Runtime test suite for Mega Menu desktop closing modes.
 *
 * Run with: node tests/Smoke/menu-behavior-smoke.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Simple DOM Mock if JSDOM is not globally available
class MockClassList {
	constructor(el) {
		this.el = el;
		this.classes = new Set();
	}
	add(...cls) {
		cls.forEach(c => this.classes.add(c));
		this.sync();
	}
	remove(...cls) {
		cls.forEach(c => this.classes.delete(c));
		this.sync();
	}
	contains(c) {
		return this.classes.has(c);
	}
	toggle(c, force) {
		if (force !== undefined) {
			if (force) this.add(c);
			else this.remove(c);
			return force;
		}
		if (this.contains(c)) {
			this.remove(c);
			return false;
		} else {
			this.add(c);
			return true;
		}
	}
	sync() {
		this.el.className = Array.from(this.classes).join(' ');
	}
	[Symbol.iterator]() {
		return this.classes.values();
	}
}

class MockElement {
	constructor(tagName = 'div') {
		this.tagName = tagName.toUpperCase();
		this.classList = new MockClassList(this);
		this.dataset = {};
		this.style = {
			removeProperty: (prop) => { delete this.style[prop]; }
		};
		this.children = [];
		this.childNodes = [];
		this.parentElement = null;
		this.nextElementSibling = null;
		this.attributes = {};
		this._focused = false;
		this.ownerDocument = null;
		this._innerHTML = '';
	}

	get className() {
		return Array.from(this.classList.classes).join(' ');
	}

	set className(val) {
		this.classList.classes = new Set((val || '').split(/\s+/).filter(Boolean));
	}

	get type() {
		return this.getAttribute('type');
	}

	set type(val) {
		this.setAttribute('type', val);
	}

	get innerHTML() {
		return this._innerHTML;
	}

	set innerHTML(html) {
		this._innerHTML = html;
		if (html.includes('<span')) {
			const span = new MockElement('span');
			span.ownerDocument = this.ownerDocument;
			this.appendChild(span);
		}
	}

	setAttribute(name, val) {
		this.attributes[name] = String(val);
	}
	getAttribute(name) {
		return this.attributes[name] || null;
	}
	removeAttribute(name) {
		delete this.attributes[name];
	}

	appendChild(child) {
		child.parentElement = this;
		child.ownerDocument = this.ownerDocument || child.ownerDocument;
		this.children.push(child);
		this.childNodes.push(child);
		return child;
	}

	removeChild(child) {
		const idx = this.children.indexOf(child);
		if (idx > -1) {
			this.children.splice(idx, 1);
		}
		const nodeIdx = this.childNodes.indexOf(child);
		if (nodeIdx > -1) {
			this.childNodes.splice(nodeIdx, 1);
		}
		child.parentElement = null;
		return child;
	}

	remove() {
		if (this.parentElement) {
			this.parentElement.removeChild(this);
		}
	}

	querySelector(selector) {
		const all = this.querySelectorAll(selector);
		return all.length > 0 ? all[0] : null;
	}

	querySelectorAll(selector) {
		const results = [];
		const matchesSelector = (el, sel) => {
			if (!el || !el.tagName) return false;
			const parts = sel.split(',').map(s => s.trim());
			return parts.some(part => {
				const classes = part.match(/\.[a-zA-Z0-9_-]+/g) || [];
				const tag = part.replace(/\.[a-zA-Z0-9_-]+/g, '').trim().toUpperCase();
				if (tag && el.tagName !== tag) return false;
				return classes.every(c => el.classList && el.classList.contains(c.slice(1)));
			});
		};

		const match = (el) => {
			if (matchesSelector(el, selector)) {
				results.push(el);
			}
			for (const child of el.children) {
				match(child);
			}
		};
		for (const child of this.children) {
			match(child);
		}
		return results;
	}

	closest(selector) {
		const matchesSelector = (el, sel) => {
			if (!el || !el.tagName) return false;
			const classes = sel.match(/\.[a-zA-Z0-9_-]+/g) || [];
			const tag = sel.replace(/\.[a-zA-Z0-9_-]+/g, '').trim().toUpperCase();
			if (tag && el.tagName !== tag) return false;
			return classes.every(c => el.classList && el.classList.contains(c.slice(1)));
		};
		let curr = this;
		while (curr) {
			if (matchesSelector(curr, selector)) return curr;
			curr = curr.parentElement;
		}
		return null;
	}

	contains(node) {
		let curr = node;
		while (curr) {
			if (curr === this) return true;
			curr = curr.parentElement;
		}
		return false;
	}

	getBoundingClientRect() {
		return { x: 0, y: 0, left: 0, right: 1200, top: 0, bottom: 60, width: 1200, height: 60 };
	}

	focus() {
		this._focused = true;
	}

	blur() {
		this._focused = false;
	}
}

// Build a mock DOM tree representing a MegaMenu block
function createMegaMenuDOM(options = {}) {
	const { activator = 'click', closeMode = 'automatic', itemCount = 1 } = options;

	const nav = new MockElement('nav');
	nav.ownerDocument = mockDocument;
	nav.id = options.id || ('menu-' + Math.random().toString(36).substring(2, 9));
	nav.classList.add('wp-block-megamenu', 'is-collapsible', `activator-${activator}`, `close-mode-${closeMode}`);
	nav.dataset.activator = activator;
	nav.dataset.closeMode = closeMode;
	nav.dataset.responsiveBreakpoint = '1023';
	nav.dataset.dropdownWidth = '1200';

	const hamburgerWrapper = new MockElement('div');
	hamburgerWrapper.ownerDocument = mockDocument;
	const hamburgerBtn = new MockElement('button');
	hamburgerBtn.ownerDocument = mockDocument;
	hamburgerBtn.classList.add('wp-block-megamenu__toggle', 'hamburger');
	hamburgerWrapper.appendChild(hamburgerBtn);
	nav.nextElementSibling = hamburgerWrapper;

	const content = new MockElement('div');
	content.ownerDocument = mockDocument;
	content.classList.add('wp-block-megamenu__content');
	nav.appendChild(content);

	const items = [];
	for (let i = 0; i < itemCount; i++) {
		const menuItem = new MockElement('div');
		menuItem.ownerDocument = mockDocument;
		menuItem.classList.add('wp-block-megamenu-item', 'has-children');
		
		const link = new MockElement('a');
		link.ownerDocument = mockDocument;
		link.classList.add('wp-block-megamenu-item__link');
		menuItem.appendChild(link);

		const dropdown = new MockElement('div');
		dropdown.ownerDocument = mockDocument;
		dropdown.classList.add('wp-block-megamenu-item__dropdown');
		menuItem.appendChild(dropdown);

		content.appendChild(menuItem);
		items.push({ menuItem, link, dropdown });
	}

	return {
		nav,
		hamburgerBtn,
		menuItem: items[0].menuItem,
		link: items[0].link,
		dropdown: items[0].dropdown,
		items
	};
}

console.log('--- Running Mega Menu Desktop Closing Mode Verification ---');

// Load MegaMenu bundle or compile source
// Since MegaMenu.ts is compiled into build/menu/view.js, let's load view.js in a mocked global environment
const viewJsContent = fs.readFileSync(path.join(__dirname, '../../build/menu/view.js'), 'utf8');

// Global mock environment
const documentListeners = {};
const windowListeners = {};

const mockDocument = {
	body: new MockElement('body'),
	addEventListener: (evt, handler) => {
		documentListeners[evt] = documentListeners[evt] || [];
		documentListeners[evt].push(handler);
	},
	createElement: (tag) => {
		const el = new MockElement(tag);
		el.ownerDocument = mockDocument;
		return el;
	},
	querySelectorAll: (sel) => [],
};
mockDocument.body.ownerDocument = mockDocument;
mockDocument.body.scrollWidth = 1200;
mockDocument.body.clientWidth = 1200;

const mockWindow = {
	addEventListener: (evt, handler) => {
		windowListeners[evt] = windowListeners[evt] || [];
		windowListeners[evt].push(handler);
	},
	innerWidth: 1200,
	scrollTo: () => {},
	fetch: async () => ({ ok: true, json: async () => ({}) }),
};

const mockNavigator = {
	maxTouchPoints: 0,
};

// Execute view.js within a VM
const vm = require('vm');
const sandbox = {
	window: mockWindow,
	document: mockDocument,
	navigator: mockNavigator,
	console: console,
	setTimeout: setTimeout,
	clearTimeout: clearTimeout,
	Node: MockElement,
	HTMLElement: MockElement,
	HTMLButtonElement: MockElement,
	HTMLDivElement: MockElement,
	Event: class Event { constructor() { this.defaultPrevented = false; } preventDefault() { this.defaultPrevented = true; } stopPropagation() {} },
	MouseEvent: class MouseEvent {
		constructor(type = 'click', init = {}) {
			if (typeof type === 'object' && type !== null) {
				init = type;
				type = init.type || 'click';
			}
			this.type = type;
			this.clientY = typeof init.clientY === 'number' ? init.clientY : 0;
			this.clientX = typeof init.clientX === 'number' ? init.clientX : 0;
			this.defaultPrevented = false;
		}
		preventDefault() { this.defaultPrevented = true; }
		stopPropagation() {}
	},
	KeyboardEvent: class KeyboardEvent { constructor(init = {}) { this.type = 'keydown'; this.key = init.key || ''; this.defaultPrevented = false; } preventDefault() { this.defaultPrevented = true; } stopPropagation() {} },
	DOMRect: class DOMRect {},
};
sandbox.globalThis = sandbox;
sandbox.global = sandbox;

vm.createContext(sandbox);
vm.runInContext(viewJsContent, sandbox);

// TEST 1: AUTOMATIC CLOSE MODE
console.log('\nTest 1: Automatic Close Mode (activator=click, closeMode=automatic)');
{
	const { nav, menuItem, link, dropdown } = createMegaMenuDOM({ activator: 'click', closeMode: 'automatic' });
	
	// Create MegaMenu instance from global constructor or window.wpBlocks
	// Let's trigger DOMContentLoaded simulation
	mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
	
	documentListeners['DOMContentLoaded'].forEach(fn => fn());
	const menuInstance = sandbox.window.wpBlocks.megamenu[nav.id];
	assert(menuInstance, 'MegaMenu instance was initialized');

	// Step 1: Click Products
	link.onclick(new sandbox.MouseEvent());
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Products menu opened on click');
	assert.strictEqual(dropdown.classList.contains('is-active'), true, 'Dropdown is active');
	
	// Step 2: Verify NO close button rendered in automatic mode
	const closeBtn = dropdown.querySelector('.wp-block-megamenu__close-button');
	assert.strictEqual(closeBtn, null, 'No close button rendered in automatic mode');

	// Step 3: Trigger mouseleave
	menuItem.onmouseleave();
	assert.strictEqual(menuItem.classList.contains('is-left'), true, 'is-left set on mouseleave');

	// Wait 550ms for TIMEOUT (500ms)
	setTimeout(() => {
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Menu automatically closed after timeout');
		console.log('✓ Automatic close mode passed');
		runTest2();
	}, 550);
}

// TEST 2: MANUAL CLOSE MODE - Close button, mouseleave suppression, click outside, escape, trigger toggle
async function runTest2() {
	console.log('\nTest 2: Manual Close Mode (activator=click, closeMode=manual)');
	const { nav, menuItem, link, dropdown } = createMegaMenuDOM({ activator: 'click', closeMode: 'manual' });
	
	mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
	documentListeners['DOMContentLoaded'].forEach(fn => fn());
	const menuInstance = sandbox.window.wpBlocks.megamenu[nav.id];
	assert(menuInstance, 'MegaMenu manual instance initialized');

	// Step 1: Click Products -> Opens
	link.onclick(new sandbox.MouseEvent());
	await new Promise(r => setTimeout(r, 20));

	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Products opened on click');
	assert.strictEqual(dropdown.classList.contains('is-active'), true, 'Dropdown is active');

	// Step 2: X close button appears in top-right corner of dropdown
	const closeBtn = dropdown.querySelector('.wp-block-megamenu__close-button');
	assert(closeBtn, 'Close button exists in open dropdown');
	assert.strictEqual(closeBtn.tagName, 'BUTTON', 'Close button is semantic button element');
	assert.strictEqual(closeBtn.getAttribute('type'), 'button', 'Close button has type="button"');
	assert.strictEqual(closeBtn.getAttribute('aria-label'), 'Close menu', 'Close button has aria-label="Close menu"');

	// Step 3: Mouseleave does NOT close the menu
	menuItem.onmouseleave();
	assert.strictEqual(menuItem.classList.contains('is-left'), false, 'is-left is NOT set in manual close mode');
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu remains open on mouseleave in manual mode');

	// Step 4: Click inside menu does NOT close the menu
	const insideClickEvent = { target: dropdown, preventDefault: () => {}, stopPropagation: () => {} };
	documentListeners['click'].forEach(fn => fn(insideClickEvent));
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu remains open on inside click');

	// Step 5: Click X close button -> Closes whole MegaMenu
	let stoppedPropagation = false;
	let preventedDefault = false;
	const closeClickEvent = {
		preventDefault: () => { preventedDefault = true; },
		stopPropagation: () => { stoppedPropagation = true; }
	};
	closeBtn.onclick(closeClickEvent);
	assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Clicking X closed the menu');
	assert.strictEqual(dropdown.classList.contains('is-active'), false, 'Dropdown inactive after X click');
	assert.strictEqual(link._focused, true, 'Focus restored to link trigger after X click');

	// Step 6: Test Click Outside
	link._focused = false;
	link.onclick(new sandbox.MouseEvent());
	await new Promise(r => setTimeout(r, 20));
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu reopened on click');
	
	const outsideElement = new MockElement('div');
	const outsideClickEvent = { target: outsideElement, preventDefault: () => {}, stopPropagation: () => {} };
	documentListeners['click'].forEach(fn => fn(outsideClickEvent));
	assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Clicking outside closed the menu');

	// Step 7: Test Escape Key
	link.onclick(new sandbox.MouseEvent());
	await new Promise(r => setTimeout(r, 20));
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu reopened on click');
	
	const escapeEvent = { key: 'Escape', preventDefault: () => {} };
	documentListeners['keydown'].forEach(fn => fn(escapeEvent));
	assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Pressing Escape closed the menu');
	assert.strictEqual(link._focused, true, 'Focus restored to link trigger after Escape');

	// Step 8: Test Trigger Toggle (click again to close)
	link.onclick(new sandbox.MouseEvent());
	await new Promise(r => setTimeout(r, 20));
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu opened on first click');
	link.onclick({ type: 'click', preventDefault: () => {} });
	await new Promise(r => setTimeout(r, 20));
	assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Clicking open trigger toggled menu closed');

	// Step 9: Verify no duplicate close buttons on multiple opens
	link.onclick(new sandbox.MouseEvent());
	await new Promise(r => setTimeout(r, 20));
	link.onclick({ type: 'click', preventDefault: () => {} });
	await new Promise(r => setTimeout(r, 20));
	link.onclick(new sandbox.MouseEvent());
	await new Promise(r => setTimeout(r, 20));
	const closeButtons = dropdown.querySelectorAll('.wp-block-megamenu__close-button');
	assert.strictEqual(closeButtons.length, 1, 'Only one close button exists after multiple opens');

	console.log('✓ Manual close mode passed all checks');

	await runTest3();
}

// TEST 3: BREAKPOINT TRANSITION (Desktop -> Mobile)
async function runTest3() {
	console.log('\nTest 3: Breakpoint transition (Desktop -> Mobile)');
	const { nav, menuItem, link, dropdown } = createMegaMenuDOM({ activator: 'click', closeMode: 'manual' });
	
	mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
	documentListeners['DOMContentLoaded'].forEach(fn => fn());
	const menuInstance = sandbox.window.wpBlocks.megamenu[nav.id];

	// Open on desktop
	link.onclick(new sandbox.MouseEvent());
	await new Promise(r => setTimeout(r, 20));
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu opened on desktop');
	assert(dropdown.querySelector('.wp-block-megamenu__close-button'), 'Close button present on desktop');

	// Simulate viewport resize to mobile (< 1023px)
	mockDocument.body.clientWidth = 600;
	windowListeners['resize'].forEach(fn => fn());

	assert.strictEqual(menuInstance.isMobile(), true, 'Device recognized as mobile');
	assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Menu automatically closed on breakpoint change');
	assert.strictEqual(dropdown.querySelector('.wp-block-megamenu__close-button'), null, 'Close button removed in mobile mode');
	assert.strictEqual(nav.classList.contains('is-mobile'), true, 'nav has is-mobile class');

	// Restore desktop width for next test
	mockDocument.body.clientWidth = 1200;
	windowListeners['resize'].forEach(fn => fn());

	console.log('✓ Breakpoint transition test passed');
	await runTest4();
}

// TEST 4: HOVER OPENING + MANUAL CLOSING
async function runTest4() {
	console.log('\nTest 4: Hover opening + Manual closing (activator=hover, closeMode=manual)');
	const { nav, menuItem, link, dropdown } = createMegaMenuDOM({ activator: 'hover', closeMode: 'manual' });
	
	mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
	documentListeners['DOMContentLoaded'].forEach(fn => fn());
	const menuInstance = sandbox.window.wpBlocks.megamenu[nav.id];

	// Hover over menu item -> starts pending open
	assert(menuItem.onmouseenter, 'onmouseenter is defined for hover activator');
	menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
	await new Promise(r => setTimeout(r, 30));
	assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Menu not opened immediately at 30ms');

	// Wait for intentional hover delay (~160ms)
	await new Promise(r => setTimeout(r, 170));
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu opened on hover after delay');
	assert(dropdown.querySelector('.wp-block-megamenu__close-button'), 'Close button present in manual mode');

	// Pointer leaves menu -> stays open (no timeout close in manual mode)
	menuItem.onmouseleave();
	assert.strictEqual(menuItem.classList.contains('is-left'), false, 'is-left not added in manual mode');
	assert.strictEqual(menuItem.classList.contains('is-opened'), true, 'Menu remains open on mouseleave in manual mode');

	// Click close button -> closes
	const closeBtn = dropdown.querySelector('.wp-block-megamenu__close-button');
	closeBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
	assert.strictEqual(menuItem.classList.contains('is-opened'), false, 'Clicking close button closed the hover-opened menu');

	console.log('✓ Hover opening + manual closing passed');
	await runTest5();
}

// TEST 5: HOVER INTENT & CANCEL CHECKS
async function runTest5() {
	console.log('\nTest 5: Hover intent direction & cancellation checks');

	// 5.1 Quick enter + leave does not open
	{
		const { nav, menuItem } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());

		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
		await new Promise(r => setTimeout(r, 50));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.1: Not opened at 50ms');

		menuItem.onmouseleave();
		await new Promise(r => setTimeout(r, 250));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.1: Quick leave cancelled open completely');
		assert.strictEqual(menuItem.classList.contains('is-left'), false, '5.1: is-left was not added');
		console.log('  ✓ 5.1 Quick enter + leave does not open');
	}

	// 5.2 Neutral hover opens after default delay (~160ms)
	{
		const { nav, menuItem } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());

		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
		// Small movement within ±8px dead zone (+4px)
		await new Promise(r => setTimeout(r, 40));
		menuItem.onmousemove(new sandbox.MouseEvent('mousemove', { clientY: 54 }));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.2: Not opened at 40ms');

		// Still pending before default delay
		await new Promise(r => setTimeout(r, 60)); // total ~100ms
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.2: Not opened at 100ms');

		// Wait past 160ms
		await new Promise(r => setTimeout(r, 100)); // total ~200ms
		assert.strictEqual(menuItem.classList.contains('is-opened'), true, '5.2: Opened after default ~160ms delay');
		console.log('  ✓ 5.2 Neutral hover opens after default delay');
	}

	// 5.3 Downward traversal gets longer delay (~300ms total)
	{
		const { nav, menuItem } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());

		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
		await new Promise(r => setTimeout(r, 30));
		// Clear downward movement (+20px > 8px)
		menuItem.onmousemove(new sandbox.MouseEvent('mousemove', { clientY: 70 }));

		// At 200ms, should NOT be opened yet because downward delay is ~300ms total
		await new Promise(r => setTimeout(r, 170)); // total ~200ms
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.3: Not opened at 200ms for downward intent');

		// Wait past 300ms
		await new Promise(r => setTimeout(r, 150)); // total ~350ms
		assert.strictEqual(menuItem.classList.contains('is-opened'), true, '5.3: Opened after ~300ms downward delay');
		console.log('  ✓ 5.3 Downward traversal gets longer delay');
	}

	// 5.4 Upward intent gets shorter delay (~110ms total)
	{
		const { nav, menuItem } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());

		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 100 }));
		await new Promise(r => setTimeout(r, 20));
		// Clear upward movement (-20px < -8px)
		menuItem.onmousemove(new sandbox.MouseEvent('mousemove', { clientY: 80 }));

		// At 50ms, not yet opened
		await new Promise(r => setTimeout(r, 30)); // total ~50ms
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.4: Not opened at 50ms');

		// At 140ms, should be opened (> 110ms)
		await new Promise(r => setTimeout(r, 90)); // total ~140ms
		assert.strictEqual(menuItem.classList.contains('is-opened'), true, '5.4: Opened after accelerated ~110ms delay');
		console.log('  ✓ 5.4 Upward intent gets shorter delay');
	}

	// 5.5 Click cancels pending hover and opens immediately
	{
		const { nav, menuItem, link } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());

		// Start hover
		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
		await new Promise(r => setTimeout(r, 30));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.5: Hover pending at 30ms');

		// Click trigger
		link.onclick(new sandbox.MouseEvent('click'));
		await new Promise(r => setTimeout(r, 10));
		assert.strictEqual(menuItem.classList.contains('is-opened'), true, '5.5: Click opened immediately without waiting');
		console.log('  ✓ 5.5 Click cancels pending hover and opens immediately');
	}

	// 5.6 Re-entering an already-open item cancels close timer
	{
		const { nav, menuItem, link } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());

		// Open item via click
		link.onclick(new sandbox.MouseEvent('click'));
		await new Promise(r => setTimeout(r, 10));
		assert.strictEqual(menuItem.classList.contains('is-opened'), true, '5.6: Opened');

		// Mouse leaves -> is-left added
		menuItem.onmouseleave();
		assert.strictEqual(menuItem.classList.contains('is-left'), true, '5.6: is-left set on leave');

		// Re-enter at 100ms (well before 500ms close timer)
		await new Promise(r => setTimeout(r, 100));
		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
		assert.strictEqual(menuItem.classList.contains('is-left'), false, '5.6: is-left cleared on re-enter');

		// Wait past 500ms close period
		await new Promise(r => setTimeout(r, 550));
		assert.strictEqual(menuItem.classList.contains('is-opened'), true, '5.6: Remained open, close timer was cancelled');
		console.log('  ✓ 5.6 Re-entering already-open item cancels close timer');
	}

	// 5.7 Stale close timer cannot affect a different item opened afterward (race condition fix)
	{
		const { nav, items } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic', itemCount: 2 });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());
		const menuInstance = sandbox.window.wpBlocks.megamenu[nav.id];

		const itemA = items[0];
		const itemB = items[1];

		// 1. Open Item A
		itemA.link.onclick(new sandbox.MouseEvent('click'));
		await new Promise(r => setTimeout(r, 10));
		assert.strictEqual(itemA.menuItem.classList.contains('is-opened'), true, '5.7: Item A open');
		assert.strictEqual(menuInstance.currentLevel, 1, '5.7: Level is 1');

		// 2. Pointer leaves Item A -> 500ms close timer started
		itemA.menuItem.onmouseleave();
		assert.strictEqual(itemA.menuItem.classList.contains('is-left'), true, '5.7: Item A has is-left');

		// 3. Pointer moves to Item B and opens it at 100ms
		await new Promise(r => setTimeout(r, 100));
		itemB.link.onclick(new sandbox.MouseEvent('click'));
		await new Promise(r => setTimeout(r, 10));
		assert.strictEqual(itemA.menuItem.classList.contains('is-opened'), false, '5.7: Item A closed by opening B');
		assert.strictEqual(itemB.menuItem.classList.contains('is-opened'), true, '5.7: Item B is opened');
		assert.strictEqual(menuInstance.currentLevel, 1, '5.7: Level is 1 with Item B open');

		// 4. Wait 550ms for Item A's stale 500ms close timer to fire
		await new Promise(r => setTimeout(r, 550));

		// Verify Item A's stale callback did not corrupt level or close Item B
		assert.strictEqual(itemB.menuItem.classList.contains('is-opened'), true, '5.7: Item B remains open after A stale timer');
		assert.strictEqual(menuInstance.currentLevel, 1, '5.7: Level remains 1, not decremented by stale timer');
		console.log('  ✓ 5.7 Stale close timer does not affect subsequently opened item');
	}

	// 5.8 Escape cancels a pending-but-not-yet-open hover
	{
		const { nav, menuItem } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());

		// Start hover
		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
		await new Promise(r => setTimeout(r, 50));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.8: Not opened at 50ms');

		// Press Escape while hover open is pending
		const escapeEvent = new sandbox.KeyboardEvent({ key: 'Escape' });
		documentListeners['keydown'].forEach(fn => fn(escapeEvent));

		// Wait past normal 160ms delay
		await new Promise(r => setTimeout(r, 200));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.8: Escape cancelled pending hover opening');
		console.log('  ✓ 5.8 Escape cancels pending hover opening');
	}

	// 5.9 Hover -> Responsive breakpoint transition cancels pending open and restores click-only
	{
		const { nav, menuItem, link } = createMegaMenuDOM({ activator: 'hover', closeMode: 'automatic' });
		mockDocument.querySelectorAll = (sel) => sel === '.wp-block-megamenu' ? [nav] : [];
		documentListeners['DOMContentLoaded'].forEach(fn => fn());
		const menuInstance = sandbox.window.wpBlocks.megamenu[nav.id];

		// Trigger pending hover opening on desktop
		menuItem.onmouseenter(new sandbox.MouseEvent('mouseenter', { clientY: 50 }));
		await new Promise(r => setTimeout(r, 30));
		// Move downward to request ~300ms total
		menuItem.onmousemove(new sandbox.MouseEvent('mousemove', { clientY: 75 }));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.9: Pending open at 30ms');

		// Resize below breakpoint (< 1023px) before opening completes
		mockDocument.body.clientWidth = 600;
		windowListeners['resize'].forEach(fn => fn());
		assert.strictEqual(menuInstance.isMobile(), true, '5.9: Mobile mode active');

		// Wait longer than maximum 300ms delay
		await new Promise(r => setTimeout(r, 350));
		assert.strictEqual(menuItem.classList.contains('is-opened'), false, '5.9: Did not open after resize');
		assert.strictEqual(menuItem.onmouseenter, null, '5.9: Desktop hover handling removed in mobile mode');

		// Verify responsive click behavior remains functional
		link.onclick(new sandbox.MouseEvent('click'));
		await new Promise(r => setTimeout(r, 20));
		assert.strictEqual(menuItem.classList.contains('is-opened'), true, '5.9: Responsive click works');

		// Restore desktop width
		mockDocument.body.clientWidth = 1200;
		windowListeners['resize'].forEach(fn => fn());
		console.log('  ✓ 5.9 Hover -> mobile transition cancels pending open and preserves click');
	}

	await runTest6();
}

// TEST 6: EDITOR FULL-WIDTH DROPDOWN POSITIONING
async function runTest6() {
	console.log('\nTest 6: Editor Full-Width Dropdown Positioning (calcPosition)');
	const { calcPosition } = await import('../../src/utils/index.ts');

	// 6.1 Baseline scenario: viewport=1400px, megaMenu left=200px, selected item left=650px, expandDropdown=true
	{
		const editorDoc = {
			documentElement: { clientWidth: 1400 },
			body: { clientWidth: 1400 },
			defaultView: { innerWidth: 1400 }
		};

		const megaMenuEl = new MockElement('nav');
		megaMenuEl.classList.add('wp-block-megamenu');
		megaMenuEl.getBoundingClientRect = () => ({
			x: 200, y: 0, left: 200, right: 1200, top: 0, bottom: 60, width: 1000, height: 60
		});

		const menuItemEl = new MockElement('div');
		menuItemEl.ownerDocument = editorDoc;
		menuItemEl.classList.add('wp-block-megamenu-item');
		menuItemEl.getBoundingClientRect = () => ({
			x: 650, y: 0, left: 650, right: 800, top: 0, bottom: 60, width: 150, height: 60
		});
		menuItemEl.closest = (sel) => sel.includes('wp-block-megamenu') ? megaMenuEl : null;

		const dropdownEl = new MockElement('div');
		dropdownEl.ownerDocument = editorDoc;
		dropdownEl.classList.add('wp-block-megamenu-item__dropdown');
		dropdownEl.parentElement = menuItemEl;
		dropdownEl.offsetParent = menuItemEl;
		dropdownEl.getBoundingClientRect = () => ({
			x: 650, y: 60, left: 650, right: 800, top: 60, bottom: 300, width: 150, height: 240
		});

		const coords = calcPosition(menuItemEl, dropdownEl, { expandDropdown: true });

		assert.strictEqual(coords.left, '-650px', 'Dropdown left offset must be -650px (difference between viewport X=0 and containing block X=650)');
		assert.notStrictEqual(coords.left, '-200px', 'Must NOT use mega-menu offset (-200px)');
		assert.strictEqual(coords.width, '1400px', 'Dropdown width must match viewport width (1400px)');
		assert.strictEqual(coords.maxWidth, '1400px', 'Dropdown maxWidth must match viewport width (1400px)');

		const effectiveLeft = menuItemEl.getBoundingClientRect().left + parseFloat(coords.left);
		const effectiveRight = effectiveLeft + parseFloat(coords.width);
		assert.strictEqual(effectiveLeft, 0, 'Effective dropdown left edge aligns exactly at viewport X=0');
		assert.strictEqual(effectiveRight, 1400, 'Effective dropdown right edge aligns exactly at viewport X=1400');
		console.log('  ✓ 6.1 Baseline full-width editor scenario aligns to viewport X=0 and spans 1400px');
	}

	// 6.2 Selecting differently positioned menu items produces the same final viewport boundaries
	{
		const editorDoc = {
			documentElement: { clientWidth: 1400 },
			body: { clientWidth: 1400 },
			defaultView: { innerWidth: 1400 }
		};

		const itemPositions = [
			{ name: 'First item', left: 200, width: 150 },
			{ name: 'Middle item', left: 650, width: 150 },
			{ name: 'Last item', left: 1050, width: 150 },
		];

		for (const pos of itemPositions) {
			const menuItem = new MockElement('div');
			menuItem.ownerDocument = editorDoc;
			menuItem.getBoundingClientRect = () => ({
				x: pos.left, y: 0, left: pos.left, right: pos.left + pos.width, top: 0, bottom: 60, width: pos.width, height: 60
			});

			const dropdown = new MockElement('div');
			dropdown.ownerDocument = editorDoc;
			dropdown.parentElement = menuItem;
			dropdown.offsetParent = menuItem;
			dropdown.getBoundingClientRect = () => ({
				x: pos.left, y: 60, left: pos.left, right: pos.left + pos.width, top: 60, bottom: 300, width: pos.width, height: 240
			});

			const coords = calcPosition(menuItem, dropdown, { expandDropdown: true });
			assert.strictEqual(coords.left, `-${pos.left}px`, `${pos.name} offset must be -${pos.left}px`);
			assert.strictEqual(coords.width, '1400px', `${pos.name} width must be 1400px`);

			const effectiveLeft = pos.left + parseFloat(coords.left);
			const effectiveRight = effectiveLeft + parseFloat(coords.width);
			assert.strictEqual(effectiveLeft, 0, `${pos.name} final left edge is 0`);
			assert.strictEqual(effectiveRight, 1400, `${pos.name} final right edge is 1400`);
		}
		console.log('  ✓ 6.2 Differently positioned menu items produce identical viewport boundaries');
	}

	// 6.3 Non-expanded dropdown (expandDropdown: false) preserves centered behavior
	{
		const editorDoc = {
			documentElement: { clientWidth: 1400 },
			body: { clientWidth: 1400 },
			defaultView: { innerWidth: 1400 }
		};

		const megaMenuEl = new MockElement('nav');
		megaMenuEl.classList.add('wp-block-megamenu');
		megaMenuEl.getBoundingClientRect = () => ({
			x: 200, y: 0, left: 200, right: 1200, top: 0, bottom: 60, width: 1000, height: 60
		});

		const menuItemEl = new MockElement('div');
		menuItemEl.ownerDocument = editorDoc;
		menuItemEl.getBoundingClientRect = () => ({
			x: 650, y: 0, left: 650, right: 800, top: 0, bottom: 60, width: 150, height: 60
		});
		menuItemEl.closest = (sel) => sel.includes('wp-block-megamenu') ? megaMenuEl : null;

		const dropdownEl = new MockElement('div');
		dropdownEl.ownerDocument = editorDoc;
		dropdownEl.parentElement = menuItemEl;
		dropdownEl.offsetParent = menuItemEl;
		dropdownEl.getBoundingClientRect = () => ({
			x: 675, y: 60, left: 675, right: 775, top: 60, bottom: 300, width: 100, height: 240
		});

		const coords = calcPosition(menuItemEl, dropdownEl, { expandDropdown: false });
		assert.notStrictEqual(coords.width, '1400px', 'Non-expanded dropdown must not be 1400px wide');
		assert.strictEqual(coords.left, '-25px', 'Non-expanded dropdown centers under menu item (-25px)');
		console.log('  ✓ 6.3 Non-expanded dropdown preserves centered layout');
	}

	await runTest7();
}

// TEST 7: GUTENBERG EDITOR DIRTY-STATE & ZERO-MUTATION VERIFICATION
async function runTest7() {
	console.log('\nTest 7: Gutenberg Editor Dirty-State & Zero-Mutation Verification');

	function createHookHarness() {
		let hooks = [];
		let hookIndex = 0;
		let effects = [];
		let layoutEffects = [];

		const reset = () => { hookIndex = 0; };
		const flushEffects = () => {
			const le = layoutEffects; layoutEffects = [];
			for (const eff of le) eff();
			const e = effects; effects = [];
			for (const eff of e) eff();
		};
		const useState = (init) => {
			const idx = hookIndex++;
			if (hooks[idx] === undefined) hooks[idx] = typeof init === 'function' ? init() : init;
			const setState = (val) => { hooks[idx] = typeof val === 'function' ? val(hooks[idx]) : val; };
			return [hooks[idx], setState];
		};
		const useEffect = (cb, deps) => {
			const idx = hookIndex++;
			const oldDeps = hooks[idx];
			const hasChanged = !oldDeps || !deps || deps.some((d, i) => d !== oldDeps[i]);
			if (hasChanged) { hooks[idx] = deps; effects.push(cb); }
		};
		const useLayoutEffect = (cb, deps) => {
			const idx = hookIndex++;
			const oldDeps = hooks[idx];
			const hasChanged = !oldDeps || !deps || deps.some((d, i) => d !== oldDeps[i]);
			if (hasChanged) { hooks[idx] = deps; layoutEffects.push(cb); }
		};
		const useCallback = (cb, deps) => {
			const idx = hookIndex++;
			const old = hooks[idx];
			if (!old || deps.some((d, i) => d !== old.deps[i])) {
				hooks[idx] = { cb, deps };
				return cb;
			}
			return old.cb;
		};
		const useRef = (init) => {
			const idx = hookIndex++;
			if (!hooks[idx]) hooks[idx] = { current: init };
			return hooks[idx];
		};

		return { reset, flushEffects, useState, useEffect, useLayoutEffect, useCallback, useRef };
	}

	let registeredBlock = null;
	const harness = createHookHarness();
	let storeState = { blockCount: 1, hasSelectedInner: false };
	const resizeListeners = [];

	const sandbox = {
		window: {
			addEventListener: (event, handler) => {
				if (event === 'resize') resizeListeners.push(handler);
			},
			removeEventListener: (event, handler) => {
				const idx = resizeListeners.indexOf(handler);
				if (idx > -1) resizeListeners.splice(idx, 1);
			},
			innerWidth: 1400,
		},
		document: {
			createElement: () => ({}),
			documentElement: { clientWidth: 1400 },
			body: { clientWidth: 1400 },
		},
		wp: {
			blocks: {
				registerBlockType: (name, config) => { registeredBlock = { name, config }; }
			},
			blockEditor: {
				useBlockProps: (props) => props,
				useInnerBlocksProps: (props) => props,
				store: 'blockEditorStore',
				RichText: () => null,
			},
			components: { Icon: () => null },
			data: {
				useDispatch: () => ({ replaceInnerBlocks: () => {} }),
				useSelect: (cb) => cb((store) => ({
					hasSelectedInnerBlock: () => storeState.hasSelectedInner,
					getBlockCount: () => storeState.blockCount,
					getBlocks: () => storeState.blockCount ? [{}] : []
				}), {})
			},
			element: {
				useState: (...args) => harness.useState(...args),
				useEffect: (...args) => harness.useEffect(...args),
				useLayoutEffect: (...args) => harness.useLayoutEffect(...args),
				useCallback: (...args) => harness.useCallback(...args),
				useRef: (...args) => harness.useRef(...args),
			},
			i18n: { __: (s) => s },
			icons: { chevronDown: 'chevronDown' },
			primitives: {},
		},
		ReactJSXRuntime: {
			jsx: (type, props) => ({ type, props }),
			jsxs: (type, props) => ({ type, props }),
			Fragment: 'Fragment',
		}
	};
	sandbox.global = sandbox;
	sandbox.window = sandbox;

	const code = fs.readFileSync(path.join(__dirname, '../../build/menu-item/index.js'), 'utf8');
	vm.createContext(sandbox);
	vm.runInContext(code, sandbox);

	const Edit = registeredBlock?.config?.edit;
	assert(typeof Edit === 'function', 'Menu-item Edit component must be a function');

	const setAttributesCalls = [];
	const mockSetAttributes = (attrs) => { setAttributesCalls.push(attrs); };

	const initialProps = {
		attributes: {
			text: 'Products',
			hasDescendants: true,
			showOnMobile: false,
			parentAttributes: { menusMinWidth: 80, expandDropdown: true }
		},
		setAttributes: mockSetAttributes,
		isSelected: false,
		clientId: 'test-menu-item-1',
		context: {
			'megamenu/align': 'center',
			'megamenu/menusMinWidth': 100,
			'megamenu/expandDropdown': true,
		},
		onReplace: () => {},
		mergeBlocks: () => {},
	};

	// 7.1 Initial Mount: with already-valid hasDescendants: true
	harness.reset();
	const blockElement1 = Edit(initialProps);
	harness.flushEffects();
	assert.strictEqual(setAttributesCalls.length, 0, 'Initial mount with valid hasDescendants=true must call setAttributes 0 times');
	console.log('  ✓ 7.1 Initial mount with valid attributes calls setAttributes 0 times (no false dirty state)');

	// 7.2 Initial Mount: with already-valid hasDescendants: false
	storeState.blockCount = 0;
	harness.reset();
	Edit({ ...initialProps, attributes: { ...initialProps.attributes, hasDescendants: false } });
	harness.flushEffects();
	assert.strictEqual(setAttributesCalls.length, 0, 'Initial mount with valid hasDescendants=false must call setAttributes 0 times');
	console.log('  ✓ 7.2 Initial mount with valid hasDescendants=false calls setAttributes 0 times');

	// Reset state back to blockCount = 1
	storeState.blockCount = 1;

	// 7.3 Selecting the block in the editor must not call setAttributes
	harness.reset();
	Edit({ ...initialProps, isSelected: true });
	harness.flushEffects();
	assert.strictEqual(setAttributesCalls.length, 0, 'Selecting menu-item block must not call setAttributes');
	console.log('  ✓ 7.3 Selecting a menu item calls setAttributes 0 times');

	// 7.4 Deselecting the block must not call setAttributes
	harness.reset();
	Edit({ ...initialProps, isSelected: false });
	harness.flushEffects();
	assert.strictEqual(setAttributesCalls.length, 0, 'Deselecting menu-item block must not call setAttributes');
	console.log('  ✓ 7.4 Deselecting a menu item calls setAttributes 0 times');

	// 7.5 Window resize event must not call setAttributes
	for (const handler of resizeListeners) handler();
	harness.flushEffects();
	assert.strictEqual(setAttributesCalls.length, 0, 'Resize event must not call setAttributes');
	console.log('  ✓ 7.5 Editor resize event calls setAttributes 0 times (positioning is purely local React state)');

	// 7.6 Runtime context derivation
	assert.strictEqual(blockElement1.props.style.minWidth, '100px', 'minWidth must be derived from context (100px)');
	console.log('  ✓ 7.6 Context values (menusMinWidth, expandDropdown) are derived at runtime without persisting parentAttributes');

	// 7.7 Real descendant change: inner blocks removed (count = 0)
	storeState.blockCount = 0;
	harness.reset();
	Edit(initialProps);
	harness.flushEffects();
	assert.strictEqual(setAttributesCalls.length, 1, 'Removing inner blocks must synchronize hasDescendants');
	assert.strictEqual(setAttributesCalls[0].hasDescendants, false, 'hasDescendants must be synchronized to false');
	assert.strictEqual(Object.keys(setAttributesCalls[0]).length, 1, 'setAttributes must only contain hasDescendants');
	console.log('  ✓ 7.7 Removing inner blocks synchronizes hasDescendants: false');

	// 7.8 Real descendant change: inner blocks added (count = 1 when attribute is false)
	setAttributesCalls.length = 0;
	storeState.blockCount = 1;
	harness.reset();
	Edit({ ...initialProps, attributes: { ...initialProps.attributes, hasDescendants: false } });
	harness.flushEffects();
	assert.strictEqual(setAttributesCalls.length, 1, 'Adding inner blocks must synchronize hasDescendants');
	assert.strictEqual(setAttributesCalls[0].hasDescendants, true, 'hasDescendants must be synchronized to true');
	assert.strictEqual(Object.keys(setAttributesCalls[0]).length, 1, 'setAttributes must only contain hasDescendants');
	console.log('  ✓ 7.8 Adding inner blocks synchronizes hasDescendants: true');

	// 7.9 Verify clientId and parentAttributes are never written
	assert.strictEqual('clientId' in setAttributesCalls[0], false, 'clientId must never be persisted');
	assert.strictEqual('parentAttributes' in setAttributesCalls[0], false, 'parentAttributes must never be persisted');
	console.log('  ✓ 7.9 clientId and parentAttributes are never written to setAttributes');

	console.log('\n--- All Mega Menu Desktop & Editor Verification Checks Passed! ---');
}

