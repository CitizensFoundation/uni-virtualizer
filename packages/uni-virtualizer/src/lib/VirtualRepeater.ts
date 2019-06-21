// In THIS class, child is a Node.
// How to represent while allowing override in subclasses?
export type Child = any;

interface ExtendedDimensions {
  width: number,
  height: number,
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  marginLeft: number
}
interface Margins {
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  marginLeft: number
}

export class VirtualRepeater {
  _createElementFn: (item: any, index: number) => Child = null;
  // Child is any, not element, because implementer decides what children are.
  _updateElementFn: (child: Child, item: any, index: number) => void = null;
  _recycleElementFn: (child: Child, index: number) => void = null;
  _elementKeyFn: (index: number) => any = null;
  protected _measureCallback: (sizes: {[key: number]: ExtendedDimensions}) => void = null;
  _items: Array<any> = [];
  _totalItems: number = null;

  // Consider renaming this. count? visibleElements?
  _num: number = Infinity;

  // Consider renaming this. firstVisibleIndex?
  _first: number = 0;
  _last: number = 0;
  _prevFirst: number = 0;
  _prevLast: number = 0;
  _needsReset: boolean = false;
  _needsRemeasure: boolean = false;
  _pendingRender = null;
  _container: Element | ShadowRoot = null;
  
  // Contains child nodes in the rendered order.
  _ordered: Array<Child> = [];
  _active = new Map();
  _prevActive = new Map();

  // Both used for recycling purposes.
  _keyToChild: Map<any, Child> = new Map();
  _childToKey: WeakMap<Child, any> = new WeakMap();

  // Used to keep track of measures by index.
  _indexToMeasure = {}
  __incremental: boolean = false;

  // Used for tracking range changes.
  _prevNum: number;
  
  constructor(config) {
    if (config) {
      Object.assign(this, config);
    }
  }

  // API

  /**
   * The parent of all child nodes to be rendered.
   */
  get container(): Element | ShadowRoot {
    return this._container;
  }
  set container(container: Element | ShadowRoot) {
    if (container === this._container) {
      return;
    }

    if (this._container) {
      // Remove children from old container.
      this._ordered.forEach((child) => this._removeChild(child));
    }

    this._container = container;

    if (container) {
      // Insert children in new container.
      this._ordered.forEach((child) => this._insertBefore(child, null));
    } else {
      this._ordered.length = 0;
      this._active.clear();
      this._prevActive.clear();
    }
    this.requestReset();
  }

  /**
   * Invoked to create a child.
   * Override or set directly to control element creation.
   */
  get createElement(): (item: any, index: number) => Child {
    return this._createElementFn;
  }
  set createElement(fn) {
    if (fn !== this._createElementFn) {
      this._createElementFn = fn;
      this._keyToChild.clear();
      this.requestReset();
    }
  }

  /**
   * Invoked to update a child.
   * Override or set directly to control element updates.
   */
  get updateElement(): (child: Child, item: any, index: number) => void {
    return this._updateElementFn;
  }
  set updateElement(fn) {
    if (fn !== this._updateElementFn) {
      this._updateElementFn = fn;
      this.requestReset();
    }
  }

  /**
   * Invoked in place of removing a child from the DOM, so that it can be reused.
   * Override or set directly to prepare children for reuse.
   */
  get recycleElement(): (child: any, index: number) => void {
    return this._recycleElementFn;
  }
  set recycleElement(fn) {
    if (fn !== this._recycleElementFn) {
      this._recycleElementFn = fn;
      this.requestReset();
    }
  }

  /**
   * Invoked to generate a key for an element.
   * Override or set directly to control how keys are generated for children.
   */
  get elementKey(): (index: number) => any {
    return this._elementKeyFn;
  }
  set elementKey(fn) {
    if (fn !== this._elementKeyFn) {
      this._elementKeyFn = fn;
      this._keyToChild.clear();
      this.requestReset();
    }
  }

  /**
   * The index of the first child in the range.
   */
  get first(): number {
    return this._first;
  }
  set first(idx: number) {
    if (typeof idx !== 'number') {
      throw new Error('New value must be a number.');
    }

    const newFirst = Math.max(0, Math.min(idx, this.totalItems - this._num));
    if (newFirst !== this._first) {
      this._first = newFirst;
      this._scheduleRender();
    }
  }

  /**
   * The number of children in the range.
   */
  get num(): number {
    return this._num;
  }
  set num(n) {
    if (typeof n !== 'number') {
      throw new Error('New value must be a number.');
    }

    if (n !== this._num) {
      this._num = n;
      this.first = this._first;
      this._scheduleRender();
    }
  }

  /**
   * An array of data to be used to render child nodes.
   */
  get items(): Array<any> {
    return this._items;
  }
  set items(items) {
    if (items !== this._items && Array.isArray(items)) {
      this._items = items;
      this.requestReset();
    }
  }

  /**
   * The total number of items, regardless of the range, that can be rendered
   * as child nodes.
   */
  get totalItems(): number {
    return (this._totalItems === null ? this._items.length : this._totalItems);
  }
  set totalItems(num: number) {
    if (typeof num !== 'number' && num !== null) {
      throw new Error('New value must be a number.');
    }

    // TODO(valdrin) should we check if it is a finite number?
    // Technically, Infinity would break Layout, not VirtualRepeater.
    if (num !== this._totalItems) {
      this._totalItems = num;
      this.first = this._first;
      this.requestReset();
    }
  }

  /**
   * TODO @straversi: Document this.
   */
  get _incremental(): boolean {
    return this.__incremental;
  }
  set _incremental(inc: boolean) {
    if (inc !== this.__incremental) {
      this.__incremental = inc;
      this._scheduleRender();
    }
  }

  /**
   * Invoke to request that all elements in the range be measured.
   */
  requestRemeasure(): void {
    this._needsRemeasure = true;
    this._scheduleRender();
  }

  // Core functionality

  protected _shouldRender(): boolean {
    return Boolean(this.container && this.createElement);
  }

  /**
   * Render at the next opportunity.
   */
  protected async _scheduleRender(): Promise<void> {
    if (!this._pendingRender) {
      this._pendingRender = true;
      await Promise.resolve();
      this._pendingRender = false;
      if (this._shouldRender()) {
        this._render();
      }
      // this._pendingRender = requestAnimationFrame(() => {
      //   this._pendingRender = null;
      //   if (this._shouldRender()) {
      //     this._render();
      //   }
      // });
    }
  }

  /**
   * Invoke to request that all elements in the range be updated.
   */
  private requestReset(): void {
    this._needsReset = true;
    this._scheduleRender();
  }

  /**
   * Returns those children that are about to be displayed and that require to
   * be positioned. If reset or remeasure has been triggered, all children are
   * returned.
   */
  private get _toMeasure(): {indices: Array<number>, children: Array<Child>} {
    return this._ordered.reduce((toMeasure, c, i) => {
      const idx = this._first + i;
      if (this._needsReset || this._needsRemeasure || idx < this._prevFirst ||
          idx > this._prevLast) {
        toMeasure.indices.push(idx);
        toMeasure.children.push(c);
      }
      return toMeasure;
    }, {indices: [], children: []});
  }

  /**
   * Measures each child bounds and builds a map of index/bounds to be passed
   * to the `_measureCallback`
   */
  private async _measureChildren({indices, children}): Promise<void> {
    // await Promise.resolve();
    await (new Promise(resolve => {
      requestAnimationFrame(resolve);
    }));
    let pm = children.map(
        (c, i) => /*this._indexToMeasure[indices[i]] ||*/ this._measureChild(c));
    const mm = /** @type {{number: {width: number, height: number}}} */
        (pm.reduce((out, cur, i) => {
          out[indices[i]] = this._indexToMeasure[indices[i]] = cur;
          return out;
        }, {}));
    this._measureCallback(mm);
  }

  /**
   * Render items within the current range to the DOM.
   */
  protected async _render(): Promise<void> {
    const rangeChanged =
        this._first !== this._prevFirst || this._num !== this._prevNum;
    // Create/update/recycle DOM.
    if (rangeChanged || this._needsReset) {
      this._last =
          this._first + Math.min(this._num, this.totalItems - this._first) - 1;
      if (this._num || this._prevNum) {
        if (this._needsReset) {
          this._reset(this._first, this._last);
        } else {
          // Remove old children and insert new children without touching
          // shared children.
          this._discardHead();
          this._discardTail();
          this._addHead();
          this._addTail();
        }
      }
    }
    if (this._needsRemeasure || this._needsReset) {
      this._indexToMeasure = {};
    }
    // Retrieve DOM to be measured.
    // Do it right before cleanup and reset of properties.
    const shouldMeasure = this._num > 0 && this._measureCallback &&
        (rangeChanged || this._needsRemeasure || this._needsReset);
    const toMeasure = shouldMeasure ? this._toMeasure : null;

    // Cleanup.
    if (!this._incremental) {
      this._prevActive.forEach((idx, child) => this._unassignChild(child, idx));
      this._prevActive.clear();
    }
    // Reset internal properties.
    this._prevFirst = this._first;
    this._prevLast = this._last;
    this._prevNum = this._num;
    this._needsReset = false;
    this._needsRemeasure = false;

    // Notify render completed.
    this._didRender();
    // Measure DOM.
    if (toMeasure) {
      await this._measureChildren(toMeasure);
    }
  }

  /**
   * Invoked after DOM is updated, and before it gets measured.
   */
  protected _didRender() {
  }

  /**
   * Unassigns any children at indices lower than the start of the current
   * range.
   */
  private _discardHead(): void {
    const o = this._ordered;
    for (let idx = this._prevFirst; o.length && idx < this._first; idx++) {
      this._unassignChild(o.shift(), idx);
    }
  }

  /**
   * Unassigns any children at indices higher than the end of the current
   * range.
   */
  private _discardTail(): void {
    const o = this._ordered;
    for (let idx = this._prevLast; o.length && idx > this._last; idx--) {
      this._unassignChild(o.pop(), idx);
    }
  }

  /**
   * Assigns and inserts non-existent children from the current range with
   * indices lower than the start of the previous range.
   * @private
   */
  private _addHead(): void {
    const start = this._first;
    const end = Math.min(this._last, this._prevFirst - 1);
    for (let idx = end; idx >= start; idx--) {
      const child = this._assignChild(idx);
      // Maintain dom order.
      this._insertBefore(child, this._firstChild);
      if (this.updateElement) {
        this.updateElement(child, this._items[idx], idx);
      }
      this._ordered.unshift(child);
    }
  }

  /**
   * Assigns and appends non-existent children from the current range with
   * indices higher than the end of the previous range.
   * @private
   */
  private _addTail(): void {
    const start = Math.max(this._first, this._prevLast + 1);
    const end = this._last;
    for (let idx = start; idx <= end; idx++) {
      const child = this._assignChild(idx);
      // Maintain dom order.
      this._insertBefore(child, null);
      if (this.updateElement) {
        this.updateElement(child, this._items[idx], idx);
      }
      this._ordered.push(child);
    }
  }

  /**
   * Re-insert and update children in the given range.
   */
  private _reset(first: number, last: number): void {
    // Swapping prevActive with active - affects _assignChild.
    // Upon resetting, the current active children become potentially inactive.
    // _assignChild will remove a child from _prevActive if it is still active.
    const prevActive = this._active;
    this._active = this._prevActive;
    this._prevActive = prevActive;

    this._ordered.length = 0;
    let currentMarker = this._firstChild;
    for (let i = first; i <= last; i++) {
      const child = this._assignChild(i);
      this._ordered.push(child);

      if (currentMarker) {
        if (currentMarker === this._node(child)) {
          currentMarker = this._nextSibling(child);
        } else {
          this._insertBefore(child, currentMarker);
        }
      } else if (!this._childIsAttached(child)) {
        this._insertBefore(child, null);
      }

      if (this.updateElement) {
        this.updateElement(child, this._items[i], i);
      }
    }
  }

  /**
   * Instantiates, tracks, and returns the child at idx.
   * Prevents cleanup of children that already exist.
   * Returns the new child at idx.
   */
  private _assignChild(idx: number): Child {
    const key = this.elementKey ? this.elementKey(idx) : idx;
    let child;
    if (child = this._keyToChild.get(key)) {
      this._prevActive.delete(child);
    } else {
      child = this.createElement(this._items[idx], idx);
      this._keyToChild.set(key, child);
      this._childToKey.set(child, key);
    }
    this._showChild(child);
    this._active.set(child, idx);
    return child;
  }

  /**
   * Removes the child at idx, recycling it if possible.
   */
  private _unassignChild(child: Child, idx: number): void {
    this._hideChild(child);
    if (this._incremental) {
      this._active.delete(child);
      this._prevActive.set(child, idx);
    } else {
      const key = this._childToKey.get(child);
      this._childToKey.delete(child);
      this._keyToChild.delete(key);
      this._active.delete(child);
      if (this.recycleElement) {
        this.recycleElement(child, idx);
      } else if (this._node(child).parentNode) {
        this._removeChild(child);
      }
    }
  }

  // TODO: Is this the right name?
  /**
   * Returns the node for the first child in the current range, if the node is
   * in the DOM.
   * @private
   */
  get _firstChild(): Node {
    return this._ordered.length && this._childIsAttached(this._ordered[0]) ?
        this._node(this._ordered[0]) :
        null;
  }

  // Overridable abstractions for child manipulation

  // @straversi: opinion for after typescript conversion done:
  // All of these except _node should deal in type Child. Anwhere
  // else in this class that needs the actual NODE should be
  // responsible for calling this._node

  /**
   * Return the node for child.
   * Override if child !== child's node.
   * @protected
   */
  _node(child: Child): Node {
    return child;
  }

  /**
   * Returns the next node sibling of a child node.
   * @protected
   */
  _nextSibling(child: Child): Node {
    return child.nextSibling;
  }

  /**
   * Inserts child before referenceNode in the container.
   * Override to control child insertion.
   * @protected
   */
  _insertBefore(child: Child, referenceNode: Node): void {
    // referenceNode.parentNode.insertBefore(child, referenceNode);
    this._container.insertBefore(child, referenceNode);
  }

  /**
   * Removes child from the DOM.
   * @protected
   */
  // TODO: this does not work, but is not being used/tested.
  _removeChild(child: Child): void {
    child.parentNode.removeChild(child);
  }

  /**
   * Returns whether the child's node is a child of the container
   * element.
   * @protected
   */
  _childIsAttached(child: Child): boolean {
    const node = this._node(child);
    return node && node.parentNode === this._container;
  }

  /**
   * Sets the display style of the given node to 'none'.
   * @protected
   */
  _hideChild(child: Child): void {
    if (child.style) {
      child.style.display = 'none';
    }
  }

  /**
   * Sets the display style of the given node to null.
   * @protected
   */
  _showChild(child: Child): void {
    if (child.style) {
      child.style.display = null;
    }
  }

  /**
   * Returns the width, height, and margins of the given child.
   * Override if child !== child's node.
   * @param {!Element} child
   * @protected
   */
  _measureChild(child): ExtendedDimensions {
    // offsetWidth doesn't take transforms in consideration, so we use
    // getBoundingClientRect which does.
    const {width, height} = child.getBoundingClientRect();
    return Object.assign({width, height}, getMargins(child));
  }
}

function getMargins(el): Margins {
  const style = window.getComputedStyle(el);
  return {
    marginTop: getMarginValue(style.marginTop),
    marginRight: getMarginValue(style.marginRight),
    marginBottom: getMarginValue(style.marginBottom),
    marginLeft: getMarginValue(style.marginLeft),
  };
}

function getMarginValue(value: string): number {
  let float = value ? parseFloat(value) : NaN;
  return Number.isNaN(float) ? 0 : float;
}
