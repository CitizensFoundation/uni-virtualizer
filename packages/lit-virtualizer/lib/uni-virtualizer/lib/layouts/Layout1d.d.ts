import { Layout1dBase } from './Layout1dBase.js';
import { ItemBox, Positions, Size } from './Layout.js';
declare type ItemBounds = {
    pos: number;
    size: number;
};
export declare class Layout1d extends Layout1dBase {
    /**
     * Indices of children mapped to their (position and length) in the scrolling
     * direction. Used to keep track of children that are in range.
     */
    _physicalItems: Map<number, ItemBounds>;
    /**
     * Used in tandem with _physicalItems to track children in range across
     * reflows.
     */
    _newPhysicalItems: Map<number, ItemBounds>;
    /**
     * Width and height of children by their index.
     */
    _metrics: Map<number, Size>;
    /**
     * anchorIdx is the anchor around which we reflow. It is designed to allow
     * jumping to any point of the scroll size. We choose it once and stick with
     * it until stable. _first and _last are deduced around it.
     */
    _anchorIdx: number;
    /**
     * Position in the scrolling direction of the anchor child.
     */
    _anchorPos: number;
    /**
     * Whether all children in range were in range during the previous reflow.
     */
    _stable: boolean;
    /**
     * Whether to remeasure children during the next reflow.
     */
    _needsRemeasure: boolean;
    /**
     * Number of children to lay out.
     */
    private _nMeasured;
    /**
     * Total length in the scrolling direction of the laid out children.
     */
    private _tMeasured;
    private _measureChildren;
    _estimate: boolean;
    constructor(config: any);
    get measureChildren(): boolean;
    /**
     * Determine the average size of all children represented in the sizes
     * argument.
     */
    updateItemSizes(sizes: {
        [key: number]: ItemBox;
    }): void;
    /**
     * Set the average item size based on the total length and number of children
     * in range.
     */
    _updateItemSize(): void;
    _getMetrics(idx: number): ItemBox;
    _getPhysicalItem(idx: number): ItemBounds;
    _getSize(idx: number): number | undefined;
    /**
     * Returns the position in the scrolling direction of the item at idx.
     * Estimates it if the item at idx is not in the DOM.
     */
    _getPosition(idx: any): number;
    _calculateAnchor(lower: number, upper: number): number;
    _getAnchor(lower: number, upper: number): number;
    /**
     * Updates _first and _last based on items that should be in the current
     * viewed range.
     */
    _getActiveItems(): void;
    /**
     * Sets the range to empty.
     */
    _clearItems(): void;
    _getItems(): void;
    _calculateError(): number;
    _updateScrollSize(): void;
    _reflow(): void;
    _resetReflowState(): void;
    /**
     * Returns the top and left positioning of the item at idx.
     */
    _getItemPosition(idx: number): Positions;
    /**
     * Returns the height and width of the item at idx.
     */
    _getItemSize(idx: number): Size;
    _viewDim2Changed(): void;
    _emitRange(): void;
}
export {};
//# sourceMappingURL=Layout1d.d.ts.map