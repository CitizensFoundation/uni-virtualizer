import { LitElement } from 'lit-element';
import { TemplateResult } from 'lit-html';
import { Type, Layout, LayoutConfig } from './uni-virtualizer/lib/layouts/Layout.js';
import { VirtualScroller } from './uni-virtualizer/lib/VirtualScroller.js';
/**
 * A LitElement wrapper of the scroll directive.
 *
 * Import this module to declare the lit-virtualizer custom element.
 * Pass an items array, renderItem method, and scroll target as properties
 * to the <lit-virtualizer> element.
 */
export declare class LitVirtualizer<Item, Child extends HTMLElement> extends LitElement {
    private _renderItem;
    private _first;
    private _last;
    private _items;
    private _scroller;
    scrollTarget: Element | Window;
    keyFunction: (item: any) => any;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    createRenderRoot(): this;
    get items(): Item[];
    set items(items: Item[]);
    /**
     * The method used for rendering each item.
     */
    get renderItem(): (item: Item, index?: number) => TemplateResult;
    set renderItem(renderItem: (item: Item, index?: number) => TemplateResult);
    set layout(layout: Layout | Type<Layout> | LayoutConfig);
    get layout(): Layout | Type<Layout> | LayoutConfig;
    get scroller(): VirtualScroller<Item, Child>;
    /**
     * Scroll to the specified index, placing that item at the given position
     * in the scroll view.
     */
    scrollToIndex(index: number, position?: string): Promise<void>;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'lit-virtualizer': LitVirtualizer<unknown, HTMLElement>;
    }
}
//# sourceMappingURL=lit-virtualizer.d.ts.map