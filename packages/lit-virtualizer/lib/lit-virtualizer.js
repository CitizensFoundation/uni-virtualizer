import { __decorate } from "tslib";
import { html, LitElement, customElement, property } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat.js';
import { VirtualScroller } from './uni-virtualizer/lib/VirtualScroller.js';
/**
 * A LitElement wrapper of the scroll directive.
 *
 * Import this module to declare the lit-virtualizer custom element.
 * Pass an items array, renderItem method, and scroll target as properties
 * to the <lit-virtualizer> element.
 */
let LitVirtualizer = class LitVirtualizer extends LitElement {
    // @property()
    // private _layout: Layout | Type<Layout> | LayoutConfig
    // private _scrollToIndex: {index: number, position: string};
    constructor() {
        super();
        this._first = 0;
        this._last = -1;
        this._scroller = null;
        this.scrollTarget = this;
        this._scroller = new VirtualScroller();
        this.addEventListener('rangeChanged', (e) => {
            this._first = e.detail.first;
            this._last = e.detail.last;
        });
    }
    connectedCallback() {
        super.connectedCallback();
        this._scroller.container = this;
        this._scroller.scrollTarget = this.scrollTarget;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._scroller.container = null;
    }
    createRenderRoot() {
        return this;
    }
    get items() {
        return this._items;
    }
    set items(items) {
        this._items = items;
        this._scroller.totalItems = items.length;
    }
    /**
     * The method used for rendering each item.
     */
    get renderItem() {
        return this._renderItem;
    }
    set renderItem(renderItem) {
        if (renderItem !== this.renderItem) {
            this._renderItem = renderItem;
            this.requestUpdate();
        }
    }
    set layout(layout) {
        // TODO (graynorton): Shouldn't have to set this here
        this._scroller.container = this;
        this._scroller.scrollTarget = this.scrollTarget;
        this._scroller.layout = layout;
    }
    get layout() {
        return this._scroller.layout;
    }
    /**
     * Scroll to the specified index, placing that item at the given position
     * in the scroll view.
     */
    async scrollToIndex(index, position = 'start') {
        this._scroller.scrollToIndex = { index, position };
        // this._scrollToIndex = {index, position};
        // this.requestUpdate();
        // await this.updateComplete;
        // this._scrollToIndex = null;
    }
    render() {
        let { items, _first, _last, renderItem, keyFunction } = this;
        if (!keyFunction) {
            keyFunction = item => item;
        }
        const itemsToRender = [];
        for (let i = _first; i < _last + 1; i++) {
            itemsToRender.push(items[i]);
        }
        return html `
            ${repeat(itemsToRender, keyFunction, renderItem)}
        `;
    }
};
__decorate([
    property()
], LitVirtualizer.prototype, "_renderItem", void 0);
__decorate([
    property()
], LitVirtualizer.prototype, "_first", void 0);
__decorate([
    property()
], LitVirtualizer.prototype, "_last", void 0);
__decorate([
    property()
], LitVirtualizer.prototype, "_items", void 0);
__decorate([
    property()
], LitVirtualizer.prototype, "scrollTarget", void 0);
__decorate([
    property()
], LitVirtualizer.prototype, "keyFunction", void 0);
LitVirtualizer = __decorate([
    customElement('lit-virtualizer')
], LitVirtualizer);
export { LitVirtualizer };
