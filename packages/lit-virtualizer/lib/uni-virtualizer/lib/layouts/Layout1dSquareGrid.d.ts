import { Layout1dGrid } from './Layout1dGrid.js';
import { Positions } from './Layout.js';
export declare class Layout1dSquareGrid extends Layout1dGrid {
    protected _idealSize: number;
    constructor(config: any);
    set idealSize(px: any);
    _getItemPosition(idx: number): Positions;
    _updateLayout(): void;
}
//# sourceMappingURL=Layout1dSquareGrid.d.ts.map