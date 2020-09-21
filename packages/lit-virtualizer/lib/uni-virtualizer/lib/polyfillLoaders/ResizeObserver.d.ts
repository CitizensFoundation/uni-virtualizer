declare global {
    interface ResizeObserver {
        observe(target: Element): void;
        unobserve(target: Element): void;
        disconnect(): void;
    }
}
export default function ResizeObserver(): Promise<any>;
//# sourceMappingURL=ResizeObserver.d.ts.map