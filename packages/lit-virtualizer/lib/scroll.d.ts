import { NodePart, TemplateResult } from 'lit-html';
import { Type, Layout, LayoutConfig } from './uni-virtualizer/lib/layouts/Layout.js';
/**
 * Configuration options for the scroll directive.
 */
interface ScrollConfig<Item> {
    /**
     * A function that returns a lit-html TemplateResult. It will be used
     * to generate the DOM for each item in the virtual list.
     */
    renderItem?: (item: Item, index?: number) => TemplateResult;
    keyFunction?: (item: any) => any;
    layout?: Layout | Type<Layout> | LayoutConfig;
    /**
     * An element that receives scroll events for the virtual scroller.
     */
    scrollTarget?: Element | Window;
    /**
     * The list of items to display via the renderItem function.
     */
    items?: Array<Item>;
    /**
     * Limit for the number of items to display. Defaults to the length of the
     * items array.
     */
    totalItems?: number;
    /**
     * Index and position of the item to scroll to.
     */
    scrollToIndex?: {
        index: number;
        position?: string;
    };
}
/**
 * A lit-html directive that turns its parent node into a virtual scroller.
 *
 * See ScrollConfig interface for configuration options.
 */
export declare const scroll: <Item>(config: ScrollConfig<Item>) => (part: NodePart) => Promise<void>;
export {};
//# sourceMappingURL=scroll.d.ts.map