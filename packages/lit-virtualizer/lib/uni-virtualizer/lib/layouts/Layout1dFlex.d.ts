import { Layout1dBase } from './Layout1dBase';
import { ItemBox, Positions, Size, LayoutConfig, Type } from './Layout';
export interface Layout1dFlexConfig extends LayoutConfig {
    type?: Type<Layout1dFlex>;
    direction?: "horizontal" | "vertical";
    spacing?: number;
    idealSize?: number;
}
interface Rolumn {
    _startIdx: number;
    _endIdx: number;
    _startPos: number;
    _size: number;
}
interface Chunk {
    _itemPositions: Array<Positions>;
    _rolumns: Array<Rolumn>;
    _size: number;
    _dirty: boolean;
}
/**
 * TODO @straversi: document and test this Layout.
 */
export declare class Layout1dFlex extends Layout1dBase {
    private _itemSizes;
    private _chunkSize;
    private _chunks;
    private _aspectRatios;
    private _numberOfAspectRatiosMeasured;
    protected _idealSize: number;
    protected _config: Layout1dFlexConfig;
    protected static _defaultConfig: Layout1dFlexConfig;
    listenForChildLoadEvents: boolean;
    measureChildren: ((e: Element, i: object) => object);
    set idealSize(px: number);
    get idealSize(): number;
    updateItemSizes(sizes: {
        [key: number]: ItemBox;
    }): void;
    _newChunk(): {
        _rolumns: any[];
        _itemPositions: any[];
        _size: number;
        _dirty: boolean;
    };
    _getChunk(idx: number | string): {
        _rolumns: any[];
        _itemPositions: any[];
        _size: number;
        _dirty: boolean;
    };
    _recordAspectRatio(dims: any): void;
    _getRandomAspectRatio(): Size;
    _viewDim2Changed(): void;
    _getActiveItems(): void;
    _getItemPosition(idx: number): Positions;
    _getItemSize(idx: number): Size;
    _getNaturalItemDims(idx: number): Size;
    _layOutChunk(startIdx: number): Chunk;
    _updateLayout(): void;
    _updateScrollSize(): void;
}
export {};
//# sourceMappingURL=Layout1dFlex.d.ts.map