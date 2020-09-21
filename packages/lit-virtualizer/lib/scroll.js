import { directive } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { VirtualScroller } from './uni-virtualizer/lib/VirtualScroller.js';
const partToState = new WeakMap();
function renderItems({ renderItem, keyFunction, first, last, items }) {
    if (!keyFunction) {
        keyFunction = item => item;
    }
    const itemsToRender = [];
    if (first >= 0 && last >= first) {
        for (let i = first; i < last + 1; i++) {
            itemsToRender.push(items[i]);
        }
    }
    return repeat(itemsToRender, keyFunction, renderItem);
}
/**
 * A lit-html directive that turns its parent node into a virtual scroller.
 *
 * See ScrollConfig interface for configuration options.
 */
export const scroll = directive((config) => async (part) => {
    // Retain the scroller so that re-rendering the directive's parent won't
    // create another one.
    const { items, renderItem, keyFunction } = config;
    let state = partToState.get(part);
    if (!state) {
        if (!part.startNode.isConnected) {
            await Promise.resolve();
        }
        const container = part.startNode.parentNode;
        const scrollTarget = config.scrollTarget || container;
        state = {
            scroller: new VirtualScroller({ container, scrollTarget }),
            first: 0,
            last: -1,
            renderItem,
            keyFunction,
            items
        };
        partToState.set(part, state);
        container.addEventListener('rangeChanged', (e) => {
            state.first = e.detail.first;
            state.last = e.detail.last;
            part.setValue(renderItems(state));
            part.commit();
        });
    }
    const { scroller } = state;
    Object.assign(state, { items, renderItem, keyFunction });
    if (config.items !== undefined) {
        scroller.items = items;
        scroller.totalItems = config.items.length;
    }
    for (let prop of ['totalItems', 'layout', 'scrollToIndex']) {
        if (config[prop] !== undefined) {
            scroller[prop] = config[prop];
        }
    }
    part.setValue(renderItems(state));
});
